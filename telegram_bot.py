"""
=============================================================================
MIRRORS AGENCY — TELEGRAM FINANCIAL BOT (PYTHON VERSION)
=============================================================================
Используется, если вы хотите запускать бота на собственном сервере / VPS
или локально через Python.

Библиотеки:
  pip install pyTelegramBotAPI gspread oauth2client

Бот умеет:
- Принимать команды /out, /in, /balance, /split, /runway
- Записывать расходы и доходы в Google Таблицу через Google Sheets API
- Отправлять интерактивные клавиатуры и мгновенные отчеты о кассе
=============================================================================
"""

import os
import sys
import re
import datetime
import telebot
from telebot import types

# ---------------------------------------------------------------------------
# КОНФИГУРАЦИЯ
# ---------------------------------------------------------------------------
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "ВАШ_ТОКЕН_ОТ_BOTFATHER")
GOOGLE_CREDS_FILE = os.getenv("GOOGLE_CREDS_FILE", "credentials.json")
SPREADSHEET_NAME = os.getenv("SPREADSHEET_NAME", "MIRRORS_Finance")

# Telegram IDs пользователей с доступом (пустой список = доступ открыт всем)
ALLOWED_USER_IDS = []

bot = telebot.TeleBot(BOT_TOKEN, parse_mode="HTML")

# Попытка подключиться к Google Sheets (если есть credentials.json)
sheet = None
try:
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials

    if os.path.exists(GOOGLE_CREDS_FILE):
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive"
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name(GOOGLE_CREDS_FILE, scope)
        client = gspread.authorize(creds)
        ss = client.open(SPREADSHEET_NAME)
        try:
            sheet = ss.worksheet("Транзакции")
        except gspread.WorksheetNotFound:
            sheet = ss.add_worksheet(title="Транзакции", rows=1000, cols=10)
            sheet.append_row(["Дата", "Тип", "Категория", "Модель/Проект", "Сумма ($)", "Описание", "Автор"])
        print("✅ Успешно подключено к Google Sheets:", SPREADSHEET_NAME)
    else:
        print("ℹ️ credentials.json не найден — бот запустится в локальном режиме")
except Exception as e:
    print(f"⚠️ Ошибка инициализации Google Sheets: {e}")

# ---------------------------------------------------------------------------
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# ---------------------------------------------------------------------------

def detect_model(desc: str) -> str:
    d = desc.lower()
    if "blush" in d or "блаш" in d or "eva blush" in d:
        return "Eva Blush"
    if "pinky" in d or "fansly" in d or "eva pinky" in d:
        return "Eva Pinky (Fansly)"
    if "lollysunnery" in d or "саннери" in d or "sunnery" in d:
        return "Lolly (Lollysunnery)"
    if "1lolly" in d or "лолли" in d:
        return "Lolly (1lollyhere)"
    if "lila" in d or "angelkiss" in d or "лила" in d:
        return "Lila (angelkiss)"
    return "Agency Core (Общие)"

def detect_category(desc: str, tx_type: str) -> str:
    d = desc.lower()
    if tx_type == "Доход":
        if "ppv" in d or "чат" in d:
            return "Платные сообщения (PPV / Chatting)"
        if "тип" in d or "tip" in d or "чаев" in d or "кастом" in d:
            return "Чаевые (Tips) & Кастомы"
        if "реклам" in d or "спонсор" in d:
            return "Внешняя реклама / Sponsorships"
        return "OnlyFans Payouts (Выплаты платформы)"

    if "оскар" in d or "oftv" in d or "сценари" in d or "монтаж" in d:
        return "Трафик: Reddit & Dating Apps"
    if "леон" in d or "sfs" in d or "share" in d:
        return "Трафик: Twitter / X Promo"
    if "анастасия" in d or "fyp" in d or "reels" in d or "tiktok" in d:
        return "Трафик: TikTok / Reels / Shorts"
    if "реддит" in d or "reddit" in d or "дейтинг" in d or "dating" in d or "трафик" in d:
        return "Трафик: Reddit & Dating Apps"
    if "чаттер" in d or "оператор" in d or "смена" in d or "зп" in d:
        return "Зарплаты: Чаттеры / Операторы"
    if "тимлид" in d or "баер" in d or "бонус" in d:
        return "Зарплаты: Тимлиды / Баеры"
    if "модел" in d or "доля" in d:
        return "Выплаты моделям (Model Share %)"
    if "монстр" in d or "onlymonster" in d or "infloww" in d or "crm" in d or "софт" in d:
        return "Софт: Infloww / CreatorHero / CRM"
    if "прокси" in d or "proxy" in d or "dolphin" in d or "sim" in d:
        return "Инфраструктура: Прокси, Dolphin, SIM"
    if "паксум" in d or "paxum" in d or "комисси" in d or "обнал" in d or "вывод" in d:
        return "Комиссии: Платежки / Paxum / Вывод"
    return "Прочие операционные расходы"

def get_sheet_balance() -> dict:
    if not sheet:
        return {"balance": 0.0, "income": 0.0, "expense": 0.0, "count": 0}
    try:
        rows = sheet.get_all_values()
        if len(rows) <= 1:
            return {"balance": 0.0, "income": 0.0, "expense": 0.0, "count": 0}
        
        income = 0.0
        expense = 0.0
        count = 0
        for r in rows[1:]:
            if len(r) >= 5 and r[4]:
                try:
                    val = float(str(r[4]).replace("$", "").replace(",", "").strip())
                    tx_type = str(r[1]).strip().lower()
                    if tx_type in ["доход", "in"]:
                        income += val
                    else:
                        expense += val
                    count += 1
                except ValueError:
                    continue
        return {"balance": income - expense, "income": income, "expense": expense, "count": count}
    except Exception as e:
        print("Error reading balance:", e)
        return {"balance": 0.0, "income": 0.0, "expense": 0.0, "count": 0}

# ---------------------------------------------------------------------------
# ОБРАБОТЧИКИ КОМАНД TELEGRAM
# ---------------------------------------------------------------------------

@bot.message_handler(commands=["start"])
def cmd_start(msg):
    welcome = (
        "👑 <b>MIRRORS Agency Finance Bot</b>\n\n"
        "Оперативный учет кассы, P&L и контроль платежей прямо из Telegram.\n\n"
        "<b>Быстрые команды:</b>\n"
        "• <code>/out 350 Оскар OFTV монтаж</code> — записать расход\n"
        "• <code>/in 4200 Вывод OnlyFans Lolly</code> — записать доход\n"
        "• <code>/balance</code> — актуальное состояние кассы\n"
        "• <code>/split 8000</code> — понедельничный сплит транша\n"
        "• <code>/runway</code> — график выплат\n\n"
        "<i>Используйте кнопки меню ниже:</i>"
    )
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    markup.row("💰 Баланс Кассы", "📅 Ближайшие Выплаты")
    markup.row("🧮 Понедельничный Сплит", "📊 Сводка P&L")
    bot.send_message(msg.chat.id, welcome, reply_markup=markup)

@bot.message_handler(func=lambda m: m.text in ["💰 Баланс Кассы", "/balance", "/касса"])
def cmd_balance(msg):
    stats = get_sheet_balance()
    margin = (stats["balance"] / stats["income"] * 100) if stats["income"] > 0 else 0.0
    text = (
        "🏦 <b>АКТУАЛЬНОЕ СОСТОЯНИЕ КАССЫ</b>\n"
        "━━━━━━━━━━━━━━━━━━━━\n"
        f"💰 <b>Остаток в кассе:</b> <code>${stats['balance']:,.2f}</code>\n"
        f"💵 <b>Всего доходов:</b> ${stats['income']:,.2f}\n"
        f"💸 <b>Всего расходов:</b> ${stats['expense']:,.2f}\n"
        f"📊 <b>Чистая маржинальность:</b> {margin:.1f}%\n\n"
        f"<i>Всего записей в Google Таблице: {stats['count']}</i>"
    )
    bot.send_message(msg.chat.id, text)

@bot.message_handler(func=lambda m: m.text in ["📅 Ближайшие Выплаты", "/runway", "/план"])
def cmd_runway(msg):
    text = (
        "📅 <b>ПЛАТЕЖНЫЙ КАЛЕНДАРЬ ОБЯЗАТЕЛЬСТВ</b>\n"
        "━━━━━━━━━━━━━━━━━━━━\n\n"
        "• <b>CRM OnlyMonster:</b> $135 USDT\n"
        "  ⏳ <i>Срок: 2-е число каждого месяца</i>\n\n"
        "• <b>@osckelly (Оскар) — OFTV:</b> $175 USDT (Аванс)\n"
        "  ⏳ <i>Срок: 2-е число (остаток 175$ 31-го)</i>\n\n"
        "• <b>Анастасия (FYP-менеджер):</b> $250 USDT\n"
        "  ⏳ <i>Срок: Каждые 2 недели (аванс)</i>\n\n"
        "• <b>Леон — SFS-трафик:</b> ~$1,200 USDT\n"
        "  ⏳ <i>Срок: 1–5 число по сверке</i>\n\n"
        "• <b>🔒 Модели (25%) & Чаттеры (20%):</b>\n"
        "  ⏳ <i>Срок: 15-го (аванс) и 31-го (расчет)</i>\n\n"
        "💡 <i>Выводы OnlyFans поступают каждый понедельник.</i>"
    )
    bot.send_message(msg.chat.id, text)

@bot.message_handler(func=lambda m: m.text.startswith("/split") or m.text == "🧮 Понедельничный Сплит")
def cmd_split(msg):
    parts = msg.text.split()
    if len(parts) < 2:
        bot.send_message(msg.chat.id, "🧮 Отправьте команду в формате: <code>/split 8000</code>")
        return
    try:
        payout = float(parts[1])
    except ValueError:
        bot.send_message(msg.chat.id, "⚠️ Укажите число: <code>/split 8000</code>")
        return

    models = round(payout * 0.25)
    chatters = round(payout * 0.20)
    traffic = 950
    profit = max(0, round(payout - models - chatters - traffic))

    text = (
        f"🧮 <b>ПОНЕДЕЛЬНИЧНЫЙ СПЛИТ ВЫВОДА OF</b>\n"
        f"📥 Сумма транша: <b>${payout:,.0f}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━\n\n"
        f"🔒 <b>Фонд Моделей (25%):</b> ${models:,.0f}\n"
        f"<i>Копилка на 15 и 31 число</i>\n\n"
        f"🔒 <b>Фонд Чаттеров (20%):</b> ${chatters:,.0f}\n"
        f"<i>Зарплатный фонд на 15 и 31 число</i>\n\n"
        f"⚡ <b>Трафик & Софт недели:</b> ${traffic:,.0f}\n"
        f"<i>Оскар, Леон, Анастасия, CRM Monster</i>\n\n"
        f"🟢 <b>Свободный буфер / Профит:</b> <b>${profit:,.0f}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"💡 <i>Оставьте свободный буфер на счету кассы для непредвиденных трат.</i>"
    )
    bot.send_message(msg.chat.id, text)

@bot.message_handler(func=lambda m: m.text.lower().startswith(("/out", "расход", "-")))
def handle_expense(msg):
    save_tx(msg, "Расход")

@bot.message_handler(func=lambda m: m.text.lower().startswith(("/in", "доход", "+")))
def handle_income(msg):
    save_tx(msg, "Доход")

def save_tx(msg, default_type):
    text = msg.text
    # Удаляем ключевое слово
    cleaned = re.sub(r"^(/\w+|расход|доход|[+-])\s*", "", text, flags=re.IGNORECASE).strip()
    match = re.match(r"^(\d+(?:[.,]\d+)?)", cleaned)
    if not match:
        bot.send_message(msg.chat.id, f"⚠️ Не удалось определить сумму.\nПример: <code>/{default_type.lower()[:3]} 350 Оскар OFTV</code>")
        return

    amount = float(match.group(1).replace(",", "."))
    desc = cleaned[match.end():].strip() or ("Операционный расход" if default_type == "Расход" else "Доход")
    author = f"@{msg.from_user.username}" if msg.from_user.username else msg.from_user.first_name

    model = detect_model(desc)
    cat = detect_category(desc, default_type)
    today = datetime.date.today().isoformat()

    if sheet:
        try:
            sheet.append_row([today, default_type, cat, model, amount, desc, author])
        except Exception as e:
            bot.send_message(msg.chat.id, f"⚠️ Ошибка записи в Google Sheets: {e}")
            return

    stats = get_sheet_balance()
    icon = "💵" if default_type == "Доход" else "💸"
    sign = "+" if default_type == "Доход" else "-"

    reply = (
        f"✅ <b>Операция успешно записана в Google Таблицу!</b>\n"
        f"{icon} <b>{default_type}:</b> {sign}${amount:,.2f}\n"
        f"📂 <b>Категория:</b> {cat}\n"
        f"👑 <b>Модель:</b> {model}\n"
        f"📝 <b>Описание:</b> {desc}\n"
        f"👤 <b>Автор:</b> {author}\n\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"💰 <b>АКТУАЛЬНЫЙ ОСТАТОК КАССЫ:</b> <code>${stats['balance']:,.2f}</code>"
    )
    bot.send_message(msg.chat.id, reply)

if __name__ == "__main__":
    print("🚀 MIRRORS Finance Telegram Bot запускается...")
    bot.infinity_polling()
