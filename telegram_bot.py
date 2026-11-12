"""
=============================================================================
MIRRORS AGENCY — TELEGRAM FINANCE BOT (PYTHON VERSION)
=============================================================================
Бот для оперативного учета кассы, расходов, доходов и сплита агентства MIRRORS.
Подключается напрямую к Google Apps Script Web App (к той же таблице, что и дашборд Vercel).

Запуск:
    ./.venv/bin/python telegram_bot.py
=============================================================================
"""

import os
import re
import json
import logging
import datetime
import requests
import telebot
from telebot import types

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# ---------------------------------------------------------------------------
# КОНФИГУРАЦИЯ
# ---------------------------------------------------------------------------
CONFIG_FILE = "bot_config.json"

def load_config():
    default_cfg = {
        "bot_token": os.getenv("TELEGRAM_BOT_TOKEN", "9068998139:AAGV1moTeBpncUXTwgMJbYh5K0pKYlUrhm8"),
        "gsheet_url": os.getenv("GSHEET_WEBAPP_URL", "")
    }
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                default_cfg.update(saved)
        except Exception as e:
            logging.warning(f"Ошибка чтения {CONFIG_FILE}: {e}")
    return default_cfg

def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logging.error(f"Ошибка сохранения {CONFIG_FILE}: {e}")

CONFIG = load_config()
bot = telebot.TeleBot(CONFIG["bot_token"], parse_mode="HTML")

# Категории и Модели (синхронизированы с finance.js и dashboard)
CATEGORIES_EXPENSE = [
    "Трафик: TikTok",
    "Трафик: Reddit",
    "Трафик: Twitter",
    "Зарплаты: Чаттеры",
    "Выплаты моделям",
    "Софт: OnlyMonster",
    "Комиссии и вывод",
    "Прочие расходы"
]

CATEGORIES_INCOME = [
    "Выплаты OnlyFans",
    "Прочий доход"
]

MODELS_LIST = [
    "Lolly (Lollysunnery)",
    "Lolly (1lollyhere)",
    "Eva Blush",
    "Lila (angelkiss)",
    "Eva Pinky (Fansly)",
    "Agency Core (Общие)"
]

CONTRACTORS = [
    {"name": "@osckelly (Оскар) — OFTV", "amount": 350, "terms": "175$ в начале + 175$ в конце", "cat": "Трафик: TikTok"},
    {"name": "@aneskagency (Анастасия) — FYP", "amount": 250, "terms": "125$ каждые 2 недели", "cat": "Трафик: TikTok"},
    {"name": "OnlyMonster CRM", "amount": 220, "terms": "220$ / 2-го числа (единственный софт)", "cat": "Софт: OnlyMonster"},
    {"name": "@KillerLe0n (Леон) — SFS", "amount": 580, "terms": "По сверке 1–5 числа", "cat": "Трафик: Twitter"}
]

# Хранилище временного состояния пошагового ввода { user_id: { ... } }
user_sessions = {}

# ---------------------------------------------------------------------------
# ВЗАИМОДЕЙСТВИЕ С GOOGLE APPS SCRIPT WEB APP
# ---------------------------------------------------------------------------

def send_tx_to_sheets(tx: dict) -> bool:
    url = CONFIG.get("gsheet_url", "").strip()
    if not url:
        return False
    try:
        res = requests.post(
            url,
            json={"action": "addTransaction", "transaction": tx},
            headers={"Content-Type": "text/plain;charset=utf-8"},
            timeout=10
        )
        return res.status_code == 200
    except Exception as e:
        logging.error(f"Ошибка отправки в Sheets: {e}")
        return False

def delete_tx_from_sheets(tx: dict) -> bool:
    url = CONFIG.get("gsheet_url", "").strip()
    if not url:
        return False
    try:
        res = requests.post(
            url,
            json={"action": "deleteTransaction", "transaction": tx, "deleteAllDuplicates": True},
            headers={"Content-Type": "text/plain;charset=utf-8"},
            timeout=10
        )
        return res.status_code == 200
    except Exception as e:
        logging.error(f"Ошибка удаления из Sheets: {e}")
        return False

def fetch_data_from_sheets() -> list:
    url = CONFIG.get("gsheet_url", "").strip()
    if not url:
        return []
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            data = res.json()
            raw = data.get("transactions", [])
            # Полная фильтрация багнутых 100k операций
            return [
                t for t in raw 
                if float(t.get("amount", 0)) < 90000 
                and not (float(t.get("amount", 0)) >= 50000 and "lolly" in str(t.get("model", "")).lower())
            ]
    except Exception as e:
        logging.error(f"Ошибка выгрузки из Sheets: {e}")
    return []

# ---------------------------------------------------------------------------
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ АВТООПРЕДЕЛЕНИЯ
# ---------------------------------------------------------------------------

def extract_date_from_text(text: str):
    """
    Извлекает дату задним числом из текста сообщения:
    - YYYY-MM-DD (2026-11-02)
    - DD.MM.YYYY (02.11.2026)
    - Текстовые месяцы (2 ноября, 02 ноя)
    - DD.MM (02.11 или 2.11) -> берет текущий год
    - 'вчера' / 'позавчера'
    Возвращает (YYYY-MM-DD, очищенный_текст)
    """
    today = datetime.date.today()
    y = today.year
    date_val = today.isoformat()
    s = text.strip()

    # 1. YYYY-MM-DD
    m_iso = re.search(r"\b(202\d)-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])\b", s)
    if m_iso:
        date_val = f"{int(m_iso.group(1)):04d}-{int(m_iso.group(2)):02d}-{int(m_iso.group(3)):02d}"
        s = (s[:m_iso.start()] + " " + s[m_iso.end():]).strip()
        return date_val, re.sub(r"\s+", " ", s).strip()

    # 2. DD.MM.YYYY или DD/MM/YYYY
    m_full = re.search(r"\b(0?[1-9]|[12]\d|3[01])[./](0?[1-9]|1[0-2])[./](202\d)\b", s)
    if m_full:
        date_val = f"{int(m_full.group(3)):04d}-{int(m_full.group(2)):02d}-{int(m_full.group(1)):02d}"
        s = (s[:m_full.start()] + " " + s[m_full.end():]).strip()
        return date_val, re.sub(r"\s+", " ", s).strip()

    # 3. Текстовые месяцы (например "2 ноября", "02 ноя")
    month_map = {
        "янв": 1, "фев": 2, "мар": 3, "апр": 4, "май": 5, "мая": 5,
        "июн": 6, "июл": 7, "авг": 8, "сен": 9, "окт": 10, "ноя": 11, "дек": 12
    }
    m_text = re.search(r"\b(0?[1-9]|[12]\d|3[01])\s+([а-яёА-ЯЁ]{3,8})\b", s, flags=re.IGNORECASE)
    if m_text:
        day_n = int(m_text.group(1))
        m_word = m_text.group(2).lower()[:3]
        if m_word in month_map:
            date_val = f"{y:04d}-{month_map[m_word]:02d}-{day_n:02d}"
            s = (s[:m_text.start()] + " " + s[m_text.end():]).strip()
            return date_val, re.sub(r"\s+", " ", s).strip()

    # 4. DD.MM или DD/MM (например 02.11, 2.11)
    m_short = re.search(r"\b(0?[1-9]|[12]\d|3[01])[./](0?[1-9]|1[0-2])\b", s)
    if m_short:
        date_val = f"{y:04d}-{int(m_short.group(2)):02d}-{int(m_short.group(1)):02d}"
        s = (s[:m_short.start()] + " " + s[m_short.end():]).strip()
        return date_val, re.sub(r"\s+", " ", s).strip()

    # 5. Вчера / позавчера
    if re.search(r"\bвчера\b", s, flags=re.IGNORECASE):
        date_val = (today - datetime.timedelta(days=1)).isoformat()
        s = re.sub(r"\bвчера\b", "", s, flags=re.IGNORECASE).strip()
    elif re.search(r"\bпозавчера\b", s, flags=re.IGNORECASE):
        date_val = (today - datetime.timedelta(days=2)).isoformat()
        s = re.sub(r"\bпозавчера\b", "", s, flags=re.IGNORECASE).strip()

    return date_val, re.sub(r"\s+", " ", s).strip()

def parse_split_payout(text: str):
    """
    Распознает составной вывод OnlyFans по нескольким анкетам с комиссией.
    Пример: "2500 вывод онлифанс, после комсы 2364, 1301 (sunnery) 650 (blush) 549 (1lollyhere)"
    Возвращает dict со сплитом по анкетам или None.
    """
    models_patterns = [
        (r"(?:1lolly|1лолли|1lollyhere)", "Lolly (1lollyhere)"),
        (r"(?:sunnery|саннери|lollysunnery)", "Lolly (Lollysunnery)"),
        (r"(?:blush|блаш|evablush)", "Eva Blush"),
        (r"(?:pinky|пинки|evapinky|fansly|фансли)", "Eva Pinky (Fansly)"),
        (r"(?:lila|лила|angelkiss)", "Lila (angelkiss)"),
    ]

    splits = []
    for pat, model_name in models_patterns:
        # Вариант 1: 1301 (sunnery) или 1301 sunnery
        m1 = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:\(\s*)?" + pat, text, flags=re.IGNORECASE)
        # Вариант 2: sunnery: 1301 или (sunnery) 1301
        m2 = re.search(pat + r"[\s:)-]+(\d+(?:[.,]\d+)?)", text, flags=re.IGNORECASE)

        amt = None
        if m1:
            amt = float(m1.group(1).replace(",", "."))
        elif m2:
            amt = float(m2.group(1).replace(",", "."))
        if amt and amt > 0:
            splits.append({"model": model_name, "amount": amt})

    # Считаем сплитом, только если найдено минимум 2 разные анкеты
    if len(splits) < 2:
        return None

    # Поиск фактической суммы на руках (после комиссии) или явной комиссии
    m_net = re.search(r"(?:после комсы|после комиссии|на руки|в кассу|получено|чистыми)[:\s]+(\d+(?:[.,]\d+)?)", text, flags=re.IGNORECASE)
    m_fee = re.search(r"(?:комса|комиссия|fee)[:\s]+(\d+(?:[.,]\d+)?)", text, flags=re.IGNORECASE)

    total_gross = sum(s["amount"] for s in splits)
    fee = 0.0

    if m_net:
        net_received = float(m_net.group(1).replace(",", "."))
        if net_received < total_gross:
            fee = total_gross - net_received
    elif m_fee:
        fee = float(m_fee.group(1).replace(",", "."))

    return {
        "splits": splits,
        "total_gross": total_gross,
        "fee": fee,
        "actual_received": total_gross - fee
    }

def detect_model(desc: str) -> str:
    d = desc.lower()
    # 1. 1lolly (вторая анкета Lolly)
    if "1lolly" in d or "1лолли" in d or "1lollyhere" in d:
        return "Lolly (1lollyhere)"
    # 2. Основная Lolly (Lollysunnery)
    if "lolly" in d or "лолли" in d or "sunnery" in d or "саннери" in d:
        return "Lolly (Lollysunnery)"
    # 3. Fansly (Eva Pinky) - единственная анкета на Fansly
    if "pinky" in d or "eva pinky" in d or "пинки" in d or "fansly" in d or "фансли" in d or "evapinky" in d:
        return "Eva Pinky (Fansly)"
    # 4. Eva Blush (OnlyFans) - третья анкета на OnlyFans
    if "blush" in d or "блаш" in d or "eva blush" in d or "ева блаш" in d or "evablush" in d:
        return "Eva Blush"
    # 5. Lila
    if "lila" in d or "angelkiss" in d or "лила" in d:
        return "Lila (angelkiss)"
    # 6. Если просто Eva / Ева
    if "eva" in d or "ева" in d:
        return "Eva Blush"
    return "Agency Core (Общие)"

def detect_category(desc: str, tx_type: str) -> str:
    d = desc.lower()
    if tx_type == "Доход":
        return "Выплаты OnlyFans"

    # Расходы
    if "оскар" in d or "osckelly" in d or "oftv" in d or "монтаж" in d or "сценари" in d:
        return "Трафик: TikTok"
    if "анастасия" in d or "aneskagency" in d or "fyp" in d or "tiktok" in d or "тикток" in d:
        return "Трафик: TikTok"
    if "реддит" in d or "reddit" in d or "дейтинг" in d or "dating" in d:
        return "Трафик: Reddit"
    if "леон" in d or "killerle0n" in d or "sfs" in d or "твиттер" in d or "twitter" in d:
        return "Трафик: Twitter"
    if "чаттер" in d or "оператор" in d or "зп" in d or "смена" in d or "карина" in d or "тимур" in d:
        return "Зарплаты: Чаттеры"
    if "модел" in d or "выплата модел" in d or "доля" in d:
        return "Выплаты моделям"
    if "монстр" in d or "monster" in d or "onlymonster" in d or "софт" in d or "crm" in d:
        return "Софт: OnlyMonster"
    if "паксум" in d or "paxum" in d or "комисси" in d or "вывод" in d or "обнал" in d or "байбит" in d or "bybit" in d:
        return "Комиссии и вывод"
    return "Прочие расходы"

# ---------------------------------------------------------------------------
# КЛАВИАТУРЫ
# ---------------------------------------------------------------------------

def get_main_keyboard():
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, is_persistent=True, row_width=2)
    markup.add(types.KeyboardButton("💰 Баланс Кассы"))
    markup.add(
        types.KeyboardButton("💸 Внести Расход"),
        types.KeyboardButton("💵 Внести Доход")
    )
    markup.add(
        types.KeyboardButton("📅 Подрядчики"),
        types.KeyboardButton("📋 Последние Записи")
    )
    return markup

def get_category_keyboard(tx_type="Расход"):
    markup = types.InlineKeyboardMarkup(row_width=2)
    cats = CATEGORIES_EXPENSE if tx_type == "Расход" else CATEGORIES_INCOME
    buttons = [types.InlineKeyboardButton(text=c, callback_data=f"cat:{c}") for c in cats]
    markup.add(*buttons)
    markup.add(types.InlineKeyboardButton(text="❌ Отмена", callback_data="cancel"))
    return markup

def get_model_keyboard():
    markup = types.InlineKeyboardMarkup(row_width=2)
    buttons = [types.InlineKeyboardButton(text=m, callback_data=f"model:{m}") for m in MODELS_LIST]
    markup.add(*buttons)
    markup.add(types.InlineKeyboardButton(text="❌ Отмена", callback_data="cancel"))
    return markup

# ---------------------------------------------------------------------------
# КОМАНДЫ
# ---------------------------------------------------------------------------

@bot.message_handler(commands=["start", "help"])
def cmd_start(msg):
    url_status = "🟢 Подключено" if CONFIG.get("gsheet_url") else "⚪ Не подключено (введите /url)"
    text = (
        f"👑 <b>MIRRORS Agency — Финансовый Бот</b>\n\n"
        f"Быстрый учет кассы, расходов, доходов и сплита для овнера и команды.\n\n"
        f"<b>Статус Google Sheets:</b> {url_status}\n\n"
        f"⚡ <b>Быстрый ввод одной строкой:</b>\n"
        f"• <code>/out 175 Оскар OFTV монтаж</code>\n"
        f"• <code>/out 250 Анастасия FYP</code>\n"
        f"• <code>/out 220 OnlyMonster CRM</code>\n"
        f"• <code>/in 4200 Вывод OnlyFans Lolly</code>\n"
        f"• Или просто: <code>-150 Тикток</code>, <code>+4200 Лолли</code>\n\n"
        f"<i>Или используйте кнопки меню ниже:</i>"
    )
    bot.send_message(msg.chat.id, text, reply_markup=get_main_keyboard(), parse_mode="HTML")

@bot.message_handler(commands=["url"])
def cmd_set_url(msg):
    parts = msg.text.split(maxsplit=1)
    if len(parts) > 1 and parts[1].strip().startswith("https://script.google.com"):
        CONFIG["gsheet_url"] = parts[1].strip()
        save_config(CONFIG)
        bot.send_message(
            msg.chat.id,
            f"✅ <b>Google Apps Script Web App успешно подключен!</b>\n\nURL сохранен. Все новые операции моментально синхронизируются с таблицей и дашбордом на Vercel."
        )
    else:
        current = CONFIG.get("gsheet_url", "не задан")
        bot.send_message(
            msg.chat.id,
            f"🔗 <b>Привязка Google Sheets:</b>\n\n"
            f"Текущий URL: <code>{current}</code>\n\n"
            f"Чтобы подключить таблицу, отправьте команду:\n"
            f"<code>/url ВАШ_URL_APPS_SCRIPT</code>"
        )

# ---------------------------------------------------------------------------
# ВНЕСЕНИЕ ОПЕРАЦИЙ (КНОПКИ И ТЕКСТ)
# ---------------------------------------------------------------------------

@bot.message_handler(func=lambda m: m.text in ["💸 Внести Расход", "💵 Внести Доход"])
def handle_menu_add(msg):
    tx_type = "Расход" if "Расход" in msg.text else "Доход"
    user_sessions[msg.from_user.id] = {"type": tx_type, "step": "await_amount"}
    icon = "💸" if tx_type == "Расход" else "💵"
    bot.send_message(
        msg.chat.id,
        f"{icon} <b>Внесение: {tx_type}</b>\n\nНапишите сумму ($) или сумму с описанием:\n"
        f"Например: <code>175 Оскар аванс</code> или просто <code>175</code>",
        reply_markup=types.ForceReply()
    )

@bot.message_handler(commands=["out", "in"])
def handle_cmd_out_in(msg):
    is_out = msg.text.startswith("/out")
    tx_type = "Расход" if is_out else "Доход"
    cleaned = re.sub(r"^/(out|in)\s*", "", msg.text, flags=re.IGNORECASE).strip()
    process_amount_and_desc(msg, tx_type, cleaned)

def handle_composite_split_save(msg, split_info: dict, tx_date: str, original_text: str):
    author = msg.from_user.first_name or "Telegram"
    total_gross = split_info["total_gross"]
    fee = split_info["fee"]
    actual_received = split_info["actual_received"]

    # 1. Сохраняем доход отдельно по каждой модели
    for s in split_info["splits"]:
        m_tx = {
            "date": tx_date,
            "type": "Доход",
            "category": "Выплаты OnlyFans",
            "model": s["model"],
            "amount": s["amount"],
            "desc": f"Вывод OnlyFans {s['model']} (сплит на ${total_gross:,.2f})",
            "author": author
        }
        send_tx_to_sheets(m_tx)

    # 2. Если была комиссия - делим её поровну между всеми моделями в сплите
    if fee > 0 and split_info["splits"]:
        n = len(split_info["splits"])
        fee_base = round(fee / n, 2)
        fee_rem = round(fee - (fee_base * n), 2)

        for idx, s in enumerate(split_info["splits"]):
            m_fee = round(fee_base + (fee_rem if idx == 0 else 0.0), 2)
            fee_tx = {
                "date": tx_date,
                "type": "Расход",
                "category": "Комиссии и вывод",
                "model": s["model"],
                "amount": m_fee,
                "desc": f"Комиссия вывода / обнала Paxum Bybit (доля {s['model']} со сплита ${total_gross:,.2f})",
                "author": author
            }
            send_tx_to_sheets(fee_tx)

    # 3. Отправляем развернутый и красивый отчет в Telegram
    lines = [
        "🔀 <b>Обнаружен и разбит составной вывод OnlyFans!</b>\n",
        f"📅 <b>Дата:</b> {tx_date}",
        f"💵 <b>Сумма начислений (Gross):</b> +${total_gross:,.2f}\n",
        "<b>Разбивка по анкетам:</b>"
    ]
    for idx, s in enumerate(split_info["splits"], 1):
        lines.append(f"{idx}. <b>+${s['amount']:,.2f}</b> — {s['model']}")

    if fee > 0:
        eff_fee = (fee / total_gross) * 100
        lines.append(f"\n💳 <b>Комиссия вывода (Paxum/P2P):</b> -${fee:,.2f} (эфф. {eff_fee:.1f}%)")

    lines.append(f"🏦 <b>Фактически зачислено в кассу:</b> <b>+${actual_received:,.2f}</b>\n")
    lines.append("<i>☁️ Все операции успешно синхронизированы с Google Sheets и дашбордом!</i>")

    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(types.InlineKeyboardButton(text="💰 Баланс кассы", callback_data="btn_balance"))
    bot.send_message(msg.chat.id, "\n".join(lines), reply_markup=markup, parse_mode="HTML")

@bot.message_handler(func=lambda m: m.text and (m.text.startswith("-") or m.text.startswith("+") or re.search(r"\b\d+(?:[.,]\d+)?\b", m.text)))
def handle_quick_amount(msg):
    text = msg.text.strip()
    tx_type = "Расход"
    if "+" in text or "вывод" in text.lower() or "доход" in text.lower() or "onlyfans" in text.lower():
        tx_type = "Доход"
    process_amount_and_desc(msg, tx_type, text)

def process_amount_and_desc(msg, tx_type: str, text: str):
    # 1. Извлекаем дату задним числом (02.11, 2 ноября, 2026-11-02, вчера)
    tx_date, clean_s = extract_date_from_text(text)

    # 2. Проверяем составной вывод OnlyFans по нескольким моделям
    split_info = parse_split_payout(clean_s)
    if split_info:
        handle_composite_split_save(msg, split_info, tx_date, clean_s)
        return

    # 3. Если в очищенном тексте явно указан знак + или -
    if clean_s.startswith("+"):
        tx_type = "Доход"
        clean_s = clean_s[1:].strip()
    elif clean_s.startswith("-"):
        tx_type = "Расход"
        clean_s = clean_s[1:].strip()

    # 3. Извлекаем комиссию вывода или сумму фактического получения
    fee = 0.0
    rec_val = None
    m_fee = re.search(r"\b(?:fee|ком|комса|комиссия)[:\s]+(\d+(?:[.,]\d+)?)\b", clean_s, flags=re.IGNORECASE)
    if m_fee:
        fee = float(m_fee.group(1).replace(",", "."))
        clean_s = (clean_s[:m_fee.start()] + " " + clean_s[m_fee.end():]).strip()
    else:
        m_rec = re.search(r"\b(?:rec|received|получено)[:\s]+(\d+(?:[.,]\d+)?)\b", clean_s, flags=re.IGNORECASE)
        if m_rec:
            rec_val = float(m_rec.group(1).replace(",", "."))
            clean_s = (clean_s[:m_rec.start()] + " " + clean_s[m_rec.end():]).strip()

    # 4. Ищем основную сумму числом
    match = re.search(r"\b(\d+(?:[.,]\d+)?)\b", clean_s)
    if not match:
        bot.send_message(
            msg.chat.id,
            "⚠️ Укажите сумму числом. Пример: <code>150 TikTok</code> или <code>+2384 02.11 вывод оф полина</code> (можно с комиссией: <code>+8000 fee 250</code>)",
            reply_markup=get_main_keyboard(),
            parse_mode="HTML"
        )
        return

    amount = float(match.group(1).replace(",", "."))
    if amount <= 0:
        bot.send_message(msg.chat.id, "⚠️ Сумма должна быть больше 0.", reply_markup=get_main_keyboard())
        return

    if rec_val is not None and rec_val < amount:
        fee = amount - rec_val

    # Описание - весь текст за вычетом найденной суммы
    desc = (clean_s[:match.start()] + " " + clean_s[match.end():]).strip()
    desc = re.sub(r"\s+", " ", desc)
    uid = msg.from_user.id

    if desc:
        # Автоопределение категории и модели
        cat = detect_category(desc, tx_type)
        model = detect_model(desc)
        save_and_confirm(msg.chat.id, uid, tx_type, amount, cat, model, desc, msg.from_user.first_name, tx_date=tx_date, fee=fee)
    else:
        # Интерактивный режим по кнопкам
        user_sessions[uid] = {
            "type": tx_type,
            "amount": amount,
            "desc": desc,
            "date": tx_date,
            "fee": fee,
            "step": "choose_category"
        }
        icon = "💸" if tx_type == "Расход" else "💵"
        bot.send_message(
            msg.chat.id,
            f"{icon} <b>Сумма: ${amount:,.2f}</b> ({tx_type}) | 📅 {tx_date}\n\nВыберите категорию:",
            reply_markup=get_category_keyboard(tx_type),
            parse_mode="HTML"
        )

# ---------------------------------------------------------------------------
# CALLBACK QUERY (ИНЛАЙН КНОПКИ)
# ---------------------------------------------------------------------------

@bot.callback_query_handler(func=lambda call: True)
def handle_callbacks(call):
    uid = call.from_user.id
    data = call.data

    if data == "cancel":
        user_sessions.pop(uid, None)
        bot.edit_message_text("❌ Внесение отменено.", call.message.chat.id, call.message.message_id)
        return

    # Шаг 1: Выбор категории
    if data.startswith("cat:"):
        cat = data.split("cat:", 1)[1]
        session = user_sessions.get(uid)
        if not session:
            bot.answer_callback_query(call.id, "Сессия истекла. Начните заново.")
            return

        session["category"] = cat
        session["step"] = "choose_model"

        bot.edit_message_text(
            f"📂 Категория: <b>{cat}</b>\nСумма: <b>${session['amount']:,.2f}</b>\n\nТеперь выберите модель / проект:",
            call.message.chat.id,
            call.message.message_id,
            reply_markup=get_model_keyboard()
        )
        bot.answer_callback_query(call.id)
        return

    # Шаг 2: Выбор модели
    if data.startswith("model:"):
        model = data.split("model:", 1)[1]
        session = user_sessions.get(uid)
        if not session:
            bot.answer_callback_query(call.id, "Сессия истекла.")
            return

        tx_type = session["type"]
        amount = session["amount"]
        cat = session["category"]
        desc = session.get("desc") or f"{cat} ({model})"
        author = call.from_user.first_name or "Telegram"
        fee = session.get("fee", 0.0)

        tx_date = session.get("date")
        user_sessions.pop(uid, None)
        save_and_confirm(call.message.chat.id, uid, tx_type, amount, cat, model, desc, author, edit_msg_id=call.message.message_id, tx_date=tx_date, fee=fee)
        bot.answer_callback_query(call.id)
        return

    # Быстрая оплата подрядчика
    if data.startswith("pay_contractor:"):
        c_idx = int(data.split(":")[1])
        c = CONTRACTORS[c_idx]
        user_sessions[uid] = {
            "type": "Расход",
            "amount": float(c["amount"]),
            "category": c["cat"],
            "model": "Agency Core (Общие)",
            "desc": f"Выплата: {c['name']}"
        }
        save_and_confirm(
            call.message.chat.id,
            uid,
            "Расход",
            float(c["amount"]),
            c["cat"],
            "Agency Core (Общие)",
            f"Выплата: {c['name']}",
            call.from_user.first_name or "Telegram",
            edit_msg_id=call.message.message_id
        )
        bot.answer_callback_query(call.id, "Выплата внесена!")
        return

    # Запрос баланса из инлайн-кнопки
    if data == "btn_balance":
        send_balance_report(call.message.chat.id)
        bot.answer_callback_query(call.id)
        return

def save_and_confirm(chat_id, user_id, tx_type, amount, category, model, desc, author, edit_msg_id=None, tx_date=None, fee=0.0):
    tx_date_str = tx_date or datetime.date.today().isoformat()
    new_tx = {
        "date": tx_date_str,
        "type": tx_type,
        "category": category,
        "model": model,
        "amount": amount,
        "desc": desc,
        "author": author
    }

    # Отправка основной операции в Google Sheets
    synced = send_tx_to_sheets(new_tx)

    fee_synced = True
    if tx_type == "Доход" and fee > 0:
        fee_tx = {
            "date": tx_date_str,
            "type": "Расход",
            "category": "Комиссии и вывод",
            "model": model,
            "amount": fee,
            "desc": f"Комиссия вывода / обнала ({desc or model})",
            "author": author
        }
        fee_synced = send_tx_to_sheets(fee_tx)

    sync_badge = "☁️ Синхронизировано с Google Sheets & Vercel" if (synced and fee_synced) else "⚠️ Сохранено локально (привяжите /url)"
    icon = "💸" if tx_type == "Расход" else "💵"
    sign = "-" if tx_type == "Расход" else "+"

    if tx_type == "Доход" and fee > 0:
        actual_received = amount - fee
        msg_text = (
            f"✅ <b>Операция успешно записана!</b>\n\n"
            f"💵 <b>Доход (Net OF):</b> +${amount:,.2f}\n"
            f"💳 <b>Комиссия вывода:</b> -${fee:,.2f}\n"
            f"🏦 <b>Фактически в кассу:</b> +${actual_received:,.2f}\n"
            f"📂 <b>Категория:</b> {category}\n"
            f"👑 <b>Модель:</b> {model}\n"
            f"📝 <b>Описание:</b> {desc}\n"
            f"👤 <b>Автор:</b> {author}\n"
            f"📅 <b>Дата:</b> {tx_date_str}\n\n"
            f"<i>{sync_badge}</i>"
        )
    else:
        msg_text = (
            f"✅ <b>Операция успешно записана!</b>\n\n"
            f"{icon} <b>{tx_type}:</b> {sign}${amount:,.2f}\n"
            f"📂 <b>Категория:</b> {category}\n"
            f"👑 <b>Модель:</b> {model}\n"
            f"📝 <b>Описание:</b> {desc}\n"
            f"👤 <b>Автор:</b> {author}\n"
            f"📅 <b>Дата:</b> {tx_date_str}\n\n"
            f"<i>{sync_badge}</i>"
        )

    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(
        types.InlineKeyboardButton(text="💰 Баланс кассы", callback_data="btn_balance")
    )

    if edit_msg_id:
        try:
            bot.edit_message_text(msg_text, chat_id, edit_msg_id, reply_markup=markup)
        except Exception:
            bot.send_message(chat_id, msg_text, reply_markup=markup)
    else:
        bot.send_message(chat_id, msg_text, reply_markup=markup)

# ---------------------------------------------------------------------------
# ОТЧЕТЫ И СТАТИСТИКА
# ---------------------------------------------------------------------------

def send_balance_report(chat_id):
    txs = fetch_data_from_sheets()
    if not txs:
        text = (
            "🏦 <b>АКТУАЛЬНОЕ СОСТОЯНИЕ КАССЫ</b>\n"
            "━━━━━━━━━━━━━━━━━━━━\n"
            "💰 <b>Физическая касса (на руках):</b> <code>$0.00</code>\n"
            "🟢 <b>Свободная касса (Safe Cash):</b> <code>$0.00</code>\n"
            "🔒 <b>Зарплатный резерв (Эскроу):</b> <code>$0.00</code>\n\n"
            "💵 <b>Выручка Net OF:</b> $0.00\n"
            "💸 <b>Расходы OPEX:</b> $0.00\n"
            "💳 <b>Комиссии вывода:</b> $0.00\n"
            "📊 <b>Чистая маржинальность:</b> 0.0%\n"
            "📋 <b>Всего записей в реестре:</b> 0\n\n"
            "<i>Касса чистая ($0.00). Вносите доходы (/in) и расходы (/out).</i>"
        )
        bot.send_message(chat_id, text, reply_markup=get_main_keyboard(), parse_mode="HTML")
        return

    income = sum(float(t.get("amount", 0)) for t in txs if t.get("type") == "Доход")
    expense = sum(float(t.get("amount", 0)) for t in txs if t.get("type") == "Расход")
    balance = income - expense
    net_margin = (balance / income * 100) if income > 0 else 0

    # Комиссии вывода & обнала
    withdrawal_fees = 0.0
    for t in txs:
        if t.get("type") == "Расход":
            amt = float(t.get("amount", 0))
            cat = str(t.get("category", "")).lower()
            desc = str(t.get("desc", "")).lower()
            if any(k in cat or k in desc for k in ["комисси", "вывод", "paxum", "bybit", "обнал"]):
                withdrawal_fees += amt

    effective_fee = (withdrawal_fees / income * 100) if income > 0 else 0.0

    # Расчет зарплатного резерва (Эскроу) по периодам:
    # Период 1 (1–15 число) -> выплата 31-го числа
    # Период 2 (16–31 число) -> выплата 15-го числа следующего месяца
    # Доли: Модели 25%, Чаттеры 20% (Итого 45%)
    p1_income = 0.0
    p2_income = 0.0
    models_paid = 0.0
    chatters_paid = 0.0

    for t in txs:
        amt = float(t.get("amount", 0))
        if t.get("type") == "Доход":
            date_str = str(t.get("date", ""))
            day = int(date_str.split("-")[2]) if "-" in date_str and len(date_str.split("-")) >= 3 else 1
            if day <= 15:
                p1_income += amt
            else:
                p2_income += amt
        elif t.get("type") == "Расход":
            cat = str(t.get("category", "")).lower()
            if "модел" in cat:
                models_paid += amt
            elif "чаттер" in cat or "оператор" in cat:
                chatters_paid += amt

    # Начисления (45% от Net OF)
    p1_due = p1_income * 0.45
    p2_due = p2_income * 0.45
    total_payroll_paid = models_paid + chatters_paid

    p1_paid = min(p1_due, total_payroll_paid)
    p1_remaining = max(0.0, p1_due - p1_paid)
    p2_paid = min(p2_due, max(0.0, total_payroll_paid - p1_due))
    p2_remaining = max(0.0, p2_due - p2_paid)
    total_escrow = p1_remaining + p2_remaining

    # Подрядчики к доплате
    contractors_due = 0.0
    for c in CONTRACTORS:
        c_name_lower = c["name"].lower()
        paid_c = sum(
            float(t.get("amount", 0)) for t in txs 
            if t.get("type") == "Расход" and (c_name_lower in str(t.get("desc", "")).lower() or c["cat"].lower() in str(t.get("category", "")).lower())
        )
        rem_c = max(0.0, float(c["amount"]) - paid_c)
        contractors_due += rem_c

    # Свободная касса овнера
    safe_cash = balance - total_escrow - contractors_due
    safe_icon = "🟢" if safe_cash >= 0 else "🚨"
    safe_note = (
        "<i>🟢 Доступно к выводу овнером без риска разрыва кассы</i>" 
        if safe_cash >= 0 
        else "<i>⚠️ Дефицит кассы! Не выводите дивиденды до закрытия выплат</i>"
    )

    text = (
        f"🏦 <b>СОСТОЯНИЕ КАССЫ & РЕЗЕРВОВ MIRRORS</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"💰 <b>Физическая касса (на руках):</b> <code>${balance:,.2f}</code>\n\n"
        f"🔒 <b>Зарплатный резерв (Эскроу):</b> <code>${total_escrow:,.2f}</code>\n"
        f"   ├ <i>К 31-му (период 1–15):</i> ${p1_remaining:,.2f}\n"
        f"   └ <i>К 15-му (период 16–31):</i> ${p2_remaining:,.2f}\n\n"
        f"📅 <b>Подрядчики к доплате:</b> ${contractors_due:,.2f}\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"{safe_icon} <b>СВОБОДНАЯ КАССА (Safe Cash):</b> <code>${safe_cash:,.2f}</code>\n"
        f"{safe_note}\n\n"
        f"📊 <b>ФИНАНСОВЫЙ СРЕЗ:</b>\n"
        f"💵 <b>Выручка Net OF:</b> ${income:,.2f}\n"
        f"💸 <b>Расходы OPEX:</b> ${expense:,.2f}\n"
        f"💳 <b>Комиссии вывода & обнала:</b> ${withdrawal_fees:,.2f} ({effective_fee:.1f}%)\n"
        f"🏆 <b>Чистая прибыль:</b> ${balance:,.2f} ({net_margin:.1f}%)\n"
        f"📋 <b>Записей в реестре:</b> {len(txs)}\n\n"
        f"<i>Данные онлайн из Google Sheets & Dashboard</i>"
    )
    bot.send_message(chat_id, text, reply_markup=get_main_keyboard(), parse_mode="HTML")

@bot.message_handler(func=lambda m: m.text in ["💰 Баланс Кассы", "/balance", "/касса"])
def report_balance(msg):
    send_balance_report(msg.chat.id)

@bot.message_handler(func=lambda m: m.text in ["📅 Подрядчики", "/contractors", "/runway"])
def report_contractors(msg):
    text = (
        f"📅 <b>РЕЕСТР ПОДРЯДЧИКОВ И ПОДПИСОК</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━\n\n"
    )
    markup = types.InlineKeyboardMarkup(row_width=1)
    for idx, c in enumerate(CONTRACTORS):
        text += (
            f"• <b>{c['name']}</b>\n"
            f"  💰 Ставка: <b>${c['amount']} USDT</b> / месяц\n"
            f"  ⏳ Условия: <i>{c['terms']}</i>\n\n"
        )
        markup.add(types.InlineKeyboardButton(text=f"💸 Оплатить: {c['name']} (${c['amount']})", callback_data=f"pay_contractor:{idx}"))

    bot.send_message(msg.chat.id, text, reply_markup=markup)

@bot.message_handler(func=lambda m: m.text in ["📋 Последние Записи", "/recent", "/last"])
def report_recent(msg):
    txs = fetch_data_from_sheets()
    if not txs:
        bot.send_message(msg.chat.id, "Записей пока нет.", reply_markup=get_main_keyboard())
        return

    recent = txs[:5]
    text = "📋 <b>ПОСЛЕДНИЕ 5 ОПЕРАЦИЙ:</b>\n━━━━━━━━━━━━━━━━━━━━\n\n"
    for t in recent:
        icon = "💵" if t.get("type") == "Доход" else "💸"
        sign = "+" if t.get("type") == "Доход" else "-"
        text += (
            f"{icon} <b>{sign}${float(t.get('amount', 0)):,.2f}</b> — {t.get('category')}\n"
            f"👑 {t.get('model')} | 📅 {t.get('date')}\n"
            f"📝 <i>{t.get('desc', '—')}</i>\n\n"
        )

    bot.send_message(msg.chat.id, text, reply_markup=get_main_keyboard(), parse_mode="HTML")

@bot.message_handler(func=lambda m: True)
def handle_any_other(msg):
    text = (
        "💡 Используйте постоянные кнопки меню внизу экрана или быстрые команды:\n\n"
        "• <code>/balance</code> — 💰 Баланс кассы\n"
        "• <code>/out 175 Оскар OFTV</code> — 💸 Внести расход\n"
        "• <code>/in 4200 Lolly</code> — 💵 Внести доход"
    )
    bot.send_message(msg.chat.id, text, reply_markup=get_main_keyboard(), parse_mode="HTML")
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 MIRRORS FINANCE BOT УСПЕШНО ЗАПУЩЕН!")
    print(f"🤖 Bot: @mirrorsfinancebot (Token: {CONFIG['bot_token'][:15]}...)")
    print(f"📊 WebApp URL: {CONFIG.get('gsheet_url') or 'не задан (используйте /url)'}")
    print("=" * 60)
    try:
        bot.set_my_commands([
            types.BotCommand("balance", "💰 Баланс кассы и остаток"),
            types.BotCommand("out", "💸 Внести расход"),
            types.BotCommand("in", "💵 Внести доход"),
            types.BotCommand("contractors", "📅 Подрядчики"),
            types.BotCommand("recent", "📋 Последние записи"),
            types.BotCommand("start", "👑 Главное меню и кнопки"),
        ])
    except Exception as e:
        logging.warning(f"Ошибка регистрации команд: {e}")
    bot.infinity_polling(skip_pending=True)
