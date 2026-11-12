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
            return data.get("transactions", [])
    except Exception as e:
        logging.error(f"Ошибка выгрузки из Sheets: {e}")
    return []

# ---------------------------------------------------------------------------
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ АВТООПРЕДЕЛЕНИЯ
# ---------------------------------------------------------------------------

def detect_model(desc: str) -> str:
    d = desc.lower()
    if "blush" in d or "блаш" in d or "eva blush" in d:
        return "Eva Blush"
    if "pinky" in d or "fansly" in d or "eva pinky" in d:
        return "Eva Pinky (Fansly)"
    if "lollysunnery" in d or "саннери" in d or "sunnery" in d:
        return "Lolly (Lollysunnery)"
    if "1lolly" in d or "лолли" in d or "1lollyhere" in d:
        return "Lolly (1lollyhere)"
    if "lila" in d or "angelkiss" in d or "лила" in d:
        return "Lila (angelkiss)"
    return "Agency Core (Общие)"

def detect_category(desc: str, tx_type: str) -> str:
    d = desc.lower()
    if tx_type == "Доход":
        return "Выплаты OnlyFans"

    if "оскар" in d or "osckelly" in d or "oftv" in d:
        return "Трафик: TikTok"
    if "анастасия" in d or "aneskagency" in d or "fyp" in d or "tiktok" in d or "тикток" in d:
        return "Трафик: TikTok"
    if "реддит" in d or "reddit" in d or "дейтинг" in d:
        return "Трафик: Reddit"
    if "леон" in d or "killerle0n" in d or "sfs" in d or "твиттер" in d or "twitter" in d:
        return "Трафик: Twitter"
    if "чаттер" in d or "оператор" in d or "зп" in d or "смена" in d or "карина" in d or "тимур" in d:
        return "Зарплаты: Чаттеры"
    if "модел" in d or "выплата" in d or "доля" in d:
        return "Выплаты моделям"
    if "монстр" in d or "monster" in d or "onlymonster" in d or "софт" in d or "crm" in d:
        return "Софт: OnlyMonster"
    if "паксум" in d or "paxum" in d or "комисси" in d or "вывод" in d or "обнал" in d or "байбит" in d:
        return "Комиссии и вывод"
    return "Прочие расходы"

# ---------------------------------------------------------------------------
# КЛАВИАТУРЫ
# ---------------------------------------------------------------------------

def get_main_keyboard():
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    markup.add(
        types.KeyboardButton("💸 Внести Расход"),
        types.KeyboardButton("💵 Внести Доход")
    )
    markup.add(
        types.KeyboardButton("💰 Баланс Кассы"),
        types.KeyboardButton("🧮 Сплит Вывода")
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
    bot.send_message(msg.chat.id, text, reply_markup=get_main_keyboard())

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

@bot.message_handler(func=lambda m: m.text and (m.text.startswith("-") or m.text.startswith("+") or re.match(r"^\d+", m.text)))
def handle_quick_amount(msg):
    text = msg.text.strip()
    tx_type = "Доход" if text.startswith("+") else "Расход"
    cleaned = text.lstrip("+-").strip()
    process_amount_and_desc(msg, tx_type, cleaned)

def process_amount_and_desc(msg, tx_type: str, text: str):
    match = re.match(r"^(\d+(?:[.,]\d+)?)(?:\s*(.*))?$", text)
    if not match:
        bot.send_message(
            msg.chat.id,
            f"⚠️ Укажите сумму числом. Пример: <code>150 TikTok</code> или <code>/out 250</code>"
        )
        return

    amount = float(match.group(1).replace(",", "."))
    if amount <= 0:
        bot.send_message(msg.chat.id, "⚠️ Сумма должна быть больше 0.")
        return

    desc = (match.group(2) or "").strip()
    uid = msg.from_user.id

    if desc:
        # Автоопределение категории и модели
        cat = detect_category(desc, tx_type)
        model = detect_model(desc)
        save_and_confirm(msg.chat.id, uid, tx_type, amount, cat, model, desc, msg.from_user.first_name)
    else:
        # Интерактивный режим по кнопкам
        user_sessions[uid] = {
            "type": tx_type,
            "amount": amount,
            "desc": desc,
            "step": "choose_category"
        }
        icon = "💸" if tx_type == "Расход" else "💵"
        bot.send_message(
            msg.chat.id,
            f"{icon} <b>Сумма: ${amount:,.2f}</b> ({tx_type})\n\nВыберите категорию:",
            reply_markup=get_category_keyboard(tx_type)
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

        user_sessions.pop(uid, None)
        save_and_confirm(call.message.chat.id, uid, tx_type, amount, cat, model, desc, author, edit_msg_id=call.message.message_id)
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

def save_and_confirm(chat_id, user_id, tx_type, amount, category, model, desc, author, edit_msg_id=None):
    today_str = datetime.date.today().isoformat()
    new_tx = {
        "date": today_str,
        "type": tx_type,
        "category": category,
        "model": model,
        "amount": amount,
        "desc": desc,
        "author": author
    }

    # Отправка в Google Sheets
    synced = send_tx_to_sheets(new_tx)

    sync_badge = "☁️ Синхронизировано с Google Sheets & Vercel" if synced else "⚠️ Сохранено (требуется подключение /url)"
    icon = "💸" if tx_type == "Расход" else "💵"
    sign = "-" if tx_type == "Расход" else "+"

    msg_text = (
        f"✅ <b>Операция успешно записана!</b>\n\n"
        f"{icon} <b>{tx_type}:</b> {sign}${amount:,.2f}\n"
        f"📂 <b>Категория:</b> {category}\n"
        f"👑 <b>Модель:</b> {model}\n"
        f"📝 <b>Описание:</b> {desc}\n"
        f"👤 <b>Автор:</b> {author}\n"
        f"📅 <b>Дата:</b> {today_str}\n\n"
        f"<i>{sync_badge}</i>"
    )

    if edit_msg_id:
        try:
            bot.edit_message_text(msg_text, chat_id, edit_msg_id)
        except Exception:
            bot.send_message(chat_id, msg_text)
    else:
        bot.send_message(chat_id, msg_text)

# ---------------------------------------------------------------------------
# ОТЧЕТЫ И СТАТИСТИКА
# ---------------------------------------------------------------------------

@bot.message_handler(func=lambda m: m.text in ["💰 Баланс Кассы", "/balance", "/касса"])
def report_balance(msg):
    txs = fetch_data_from_sheets()
    if not txs:
        bot.send_message(
            msg.chat.id,
            "ℹ️ Данные в Google Таблице пока пусты или не подключен /url веб-приложения."
        )
        return

    income = sum(float(t.get("amount", 0)) for t in txs if t.get("type") == "Доход")
    expense = sum(float(t.get("amount", 0)) for t in txs if t.get("type") == "Расход")
    balance = income - expense
    margin = (balance / income * 100) if income > 0 else 0

    text = (
        f"🏦 <b>АКТУАЛЬНОЕ СОСТОЯНИЕ КАССЫ</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"💰 <b>Остаток в кассе:</b> <code>${balance:,.2f}</code>\n"
        f"💵 <b>Выручка (Всего):</b> ${income:,.2f}\n"
        f"💸 <b>Расходы (OPEX):</b> ${expense:,.2f}\n"
        f"📊 <b>Чистая маржинальность:</b> {margin:.1f}%\n"
        f"📋 <b>Всего записей в реестре:</b> {len(txs)}\n\n"
        f"<i>Данные онлайн из Google Sheets & Dashboard</i>"
    )
    bot.send_message(msg.chat.id, text)

@bot.message_handler(func=lambda m: m.text == "🧮 Сплит Вывода" or m.text.startswith("/split"))
def report_split(msg):
    parts = msg.text.split()
    amount = 0.0
    if len(parts) > 1:
        try:
            amount = float(parts[1].replace(",", "."))
        except ValueError:
            pass

    if amount <= 0:
        bot.send_message(
            msg.chat.id,
            "🧮 <b>Понедельничный Сплит-Калькулятор</b>\n\n"
            "Укажите сумму поступившего вывода OnlyFans:\n"
            "Например: <code>/split 8500</code>"
        )
        return

    models_share = amount * 0.25
    chatters_share = amount * 0.20
    traffic_target = 950.0  # Недельный бюджет трафика
    profit = max(0.0, amount - models_share - chatters_share - traffic_target)

    text = (
        f"🧮 <b>Сплит транша OnlyFans: ${amount:,.2f}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━\n\n"
        f"🔒 <b>Фонд Моделей (25%):</b> ${models_share:,.2f}\n"
        f"<i>(Накапливается на 15 и 31 число)</i>\n\n"
        f"🔒 <b>Фонд Чаттеров (20%):</b> ${chatters_share:,.2f}\n"
        f"<i>(Накапливается на выплаты смен)</i>\n\n"
        f"⚡ <b>Недельный трафик & софт:</b> ${traffic_target:,.2f}\n"
        f"<i>(TikTok, Reddit, OnlyMonster CRM)</i>\n\n"
        f"🟢 <b>Свободный буфер / Чистая прибыль:</b> <b>${profit:,.2f}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"💡 <i>Свободный буфер остается на счету агентства для покрытия кассовых разрывов.</i>"
    )
    bot.send_message(msg.chat.id, text)

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
        bot.send_message(msg.chat.id, "Записей пока нет.")
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

    bot.send_message(msg.chat.id, text)

# ---------------------------------------------------------------------------
# ЗАПУСК
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 MIRRORS FINANCE BOT УСПЕШНО ЗАПУЩЕН!")
    print(f"🤖 Bot: @mirrorsfinancebot (Token: {CONFIG['bot_token'][:15]}...)")
    print(f"📊 WebApp URL: {CONFIG.get('gsheet_url') or 'не задан (используйте /url)'}")
    print("=" * 60)
    bot.infinity_polling(skip_pending=True)
