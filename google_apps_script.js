/**
 * =========================================================================
 * MIRRORS AGENCY — TELEGRAM BOT & GOOGLE SHEETS FINANCIAL BACKEND
 * =========================================================================
 * 
 * Данный скрипт разворачивается прямо внутри Google Таблицы (Расширения -> Apps Script).
 * Он выполняет 3 ключевые роли БЕЗ серверов и абсолютно БЕСПЛАТНО 24/7:
 * 
 * 1. TELEGRAM BOT (Webhook):
 *    - Принимает команды овнера и тимлидов со смартфона
 *    - Записывает доходы и расходы в один клик прямо из чата
 *    - Отправляет мгновенный отчет о балансе кассы, обязательствах и сплите вывода
 * 
 * 2. GOOGLE SHEETS DATABASE:
 *    - Ведет нестираемый реестр транзакций в таблице "Транзакции"
 *    - Строит автоматическую сводку P&L и баланса кассы
 * 
 * 3. REST API ДЛЯ VERCEL ДАШБОРДА:
 *    - doGet(e): Отдает актуальные транзакции в JSON для дашборда MIRRORS
 *    - doPost(e): Принимает новые операции из веба
 * =========================================================================
 */

// -------------------------------------------------------------------------
// НАСТРОЙКИ (Заполните перед развертыванием)
// -------------------------------------------------------------------------
const BOT_TOKEN = "9068998139:AAGV1moTeBpncUXTwgMJbYh5K0pKYlUrhm8"; // @mirrorsfinancebot
const SHEET_NAME_TX = "Транзакции";

// Список Telegram ID пользователей, которым разрешено вносить траты (пустой = разрешено всем)
// Чтобы узнать свой Telegram ID, напишите боту @userinfobot
const ALLOWED_USER_IDS = []; // Например: [123456789, 987654321]

// -------------------------------------------------------------------------
// ВЕБХУК: ОБРАБОТКА ЗАПРОСОВ ИЗ TELEGRAM И ВЕБ-ДАШБОРДА
// -------------------------------------------------------------------------

/**
 * Надежный парсер числовых сумм (поддерживает $4,200.00, 4 200,00, 400.000 и др.)
 */
function cleanAmount(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  let s = String(val).trim().replace(/[$€₽\s]/g, "");
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(".") > s.lastIndexOf(",")) {
      s = s.replace(/,/g, "");
    } else {
      s = s.replace(/\./g, "").replace(",", ".");
    }
  } else if (s.includes(",")) {
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length === 2) {
      s = s.replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  }
  return parseFloat(s) || 0;
}

/**
 * Обработка GET-запроса: Выгрузка транзакций в JSON для веб-дашборда Vercel
 */
function doGet(e) {
  try {
    const sheet = getOrCreateTransactionsSheet();
    const data = sheet.getDataRange().getValues();
    
    // Если таблица пустая или только заголовок
    if (data.length <= 1) {
      return createJsonResponse({ status: "ok", count: 0, transactions: [] });
    }

    const headers = data[0];
    const transactions = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[4]) continue; // Пропуск пустых строк

      // Форматируем дату
      let dateStr = "";
      if (row[0] instanceof Date) {
        dateStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        dateStr = String(row[0] || "");
      }

      transactions.push({
        id: i,
        date: dateStr,
        type: String(row[1] || "Расход"),
        category: String(row[2] || "Прочие операционные расходы"),
        model: String(row[3] || "Agency Core (Общие)"),
        amount: cleanAmount(row[4]),
        desc: String(row[5] || ""),
        author: String(row[6] || "Sheets")
      });
    }

    // Возвращаем в обратном порядке (самые свежие первыми)
    transactions.reverse();

    return createJsonResponse({
      status: "ok",
      count: transactions.length,
      transactions: transactions
    });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Обработка POST-запроса: Входящие сообщения от Telegram Webhook или веб-дашборда
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("Empty POST");
    }

    const payload = JSON.parse(e.postData.contents);
    const sheet = getOrCreateTransactionsSheet();

    // 0. УДАЛЕНИЕ ЦИКЛИЧНОЙ 100K ТРАНЗАКЦИИ
    if (payload.action === "deleteBuggy100k") {
      const data = sheet.getDataRange().getValues();
      let deleted = 0;
      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        const rAmount = cleanAmount(row[4]);
        const rModel = String(row[3] || "").toLowerCase();
        if (rAmount >= 90000 || (rModel.includes("lolly") && rAmount >= 50000)) {
          sheet.deleteRow(i + 1);
          deleted++;
        }
      }
      return createJsonResponse({ status: "ok", message: `Deleted ${deleted} buggy 100k rows`, deletedCount: deleted });
    }

    // 1. УДАЛЕНИЕ ОПЕРАЦИИ (из веб-дашборда)
    if (payload.action === "deleteTransaction") {
      const tx = payload.transaction || {};
      const data = sheet.getDataRange().getValues();
      let deletedCount = 0;
      const targetAmount = cleanAmount(tx.amount);
      const targetModel = String(tx.model || "").trim().toLowerCase();
      const targetDate = String(tx.date || "").trim();
      const targetRowIndex = Number(payload.rowIndex || tx.id);
      const deleteAll = payload.deleteAllDuplicates === true;

      // Удаляем строки снизу вверх
      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        const rDate = (row[0] instanceof Date) 
          ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), "yyyy-MM-dd") 
          : String(row[0] || "").trim();
        const rAmount = cleanAmount(row[4]);
        const rModel = String(row[3] || "").trim().toLowerCase();

        const isExactIndex = (targetRowIndex > 0 && targetRowIndex === i);
        const isFieldMatch = (
          Math.abs(rAmount - targetAmount) < 0.01 &&
          (targetModel === "" || rModel === targetModel || rModel.includes(targetModel) || targetModel.includes(rModel)) &&
          (targetDate === "" || rDate === targetDate || rDate.includes(targetDate) || targetDate.includes(rDate))
        );

        if (isExactIndex || isFieldMatch) {
          sheet.deleteRow(i + 1);
          deletedCount++;
          if (!deleteAll && !isExactIndex) break;
        }
      }

      return createJsonResponse({ 
        status: "ok", 
        message: `Deleted ${deletedCount} rows`, 
        deletedCount: deletedCount 
      });
    }

    // 2. ОЧИСТКА ДУБЛИКАТОВ
    if (payload.action === "cleanDuplicates") {
      const data = sheet.getDataRange().getValues();
      const seen = new Set();
      let removed = 0;
      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        const key = `${row[0]}_${row[1]}_${row[2]}_${row[3]}_${cleanAmount(row[4]).toFixed(2)}_${row[5]}`;
        if (seen.has(key)) {
          sheet.deleteRow(i + 1);
          removed++;
        } else {
          seen.add(key);
        }
      }
      return createJsonResponse({ status: "ok", message: `Cleaned ${removed} duplicates`, removedCount: removed });
    }

    // 3. УДАЛЕНИЕ ОПЕРАЦИЙ КОНКРЕТНОЙ МОДЕЛИ
    if (payload.action === "deleteModelTransactions") {
      const targetModel = String(payload.model || "").trim().toLowerCase();
      const targetType = payload.type ? String(payload.type).trim().toLowerCase() : null;
      const data = sheet.getDataRange().getValues();
      let deleted = 0;

      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        const rType = String(row[1] || "").trim().toLowerCase();
        const rModel = String(row[3] || "").trim().toLowerCase();

        const modelMatch = rModel.includes(targetModel) || targetModel.includes(rModel);
        const typeMatch = !targetType || rType.includes(targetType);

        if (modelMatch && typeMatch) {
          sheet.deleteRow(i + 1);
          deleted++;
        }
      }
      return createJsonResponse({ status: "ok", message: `Deleted ${deleted} rows for ${payload.model}`, deletedCount: deleted });
    }

    // 4. ДОБАВЛЕНИЕ ОПЕРАЦИИ ИЗ ДАШБОРДА
    if (payload.action === "addTransaction") {
      const tx = payload.transaction;
      addTransactionRow(
        tx.date || new Date(),
        tx.type || "Расход",
        tx.category || "Прочие операционные расходы",
        tx.model || "Agency Core (Общие)",
        cleanAmount(tx.amount),
        tx.desc || "",
        "Vercel Dashboard"
      );
      return createJsonResponse({ status: "ok", message: "Transaction added" });
    }

    // 5. Если это входящее сообщение от Telegram Webhook
    if (payload.message) {
      handleTelegramMessage(payload.message);
    } else if (payload.callback_query) {
      handleTelegramCallback(payload.callback_query);
    }

    return ContentService.createTextOutput("OK");
  } catch (err) {
    console.error("doPost error: ", err);
    return ContentService.createTextOutput("ERROR: " + err.toString());
  }
}

// -------------------------------------------------------------------------
// ЛОГИКА TELEGRAM БОТА
// -------------------------------------------------------------------------

function handleTelegramMessage(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username ? "@" + msg.from.username : (msg.from.first_name || "User");
  const text = (msg.text || "").trim();

  // Проверка прав доступа
  if (ALLOWED_USER_IDS.length > 0 && !ALLOWED_USER_IDS.includes(userId)) {
    sendTelegramMessage(chatId, `⛔ Доступ ограничен.\nВаш Telegram ID: <code>${userId}</code>\nПередайте его овнеру для добавления в ALLOWED_USER_IDS.`);
    return;
  }

  // Команда /start
  if (text.startsWith("/start")) {
    const welcome = `👑 <b>MIRRORS Agency Finance Bot</b>\n\n` +
      `Бот для оперативного учета кассы, P&L и контроля выплат прямо из Telegram.\n\n` +
      `<b>Быстрые команды внесения:</b>\n` +
      `• <code>/out 350 Оскар OFTV монтаж</code> — записать расход\n` +
      `• <code>/in 4200 Вывод OnlyFans Lolly</code> — записать доход\n` +
      `• <code>/balance</code> — состояние кассы\n` +
      `• <code>/split 8000</code> — понедельничный сплит вывода\n` +
      `• <code>/runway</code> — график обязательств\n\n` +
      `<i>Или используйте кнопки меню ниже:</i>`;

    const keyboard = {
      keyboard: [
        [{ text: "💰 Баланс Кассы" }, { text: "📅 Ближайшие Выплаты" }],
        [{ text: "🧮 Понедельничный Сплит" }, { text: "📊 Сводка P&L" }],
        [{ text: "ℹ️ Как вносить операции" }]
      ],
      resize_keyboard: true
    };

    sendTelegramMessage(chatId, welcome, keyboard);
    return;
  }

  // Кнопка "💰 Баланс Кассы" или /balance /касса
  if (text === "💰 Баланс Кассы" || text.toLowerCase() === "/balance" || text.toLowerCase() === "/касса") {
    sendCashBalanceReport(chatId);
    return;
  }

  // Кнопка "📅 Ближайшие Выплаты" или /runway /обязательства
  if (text === "📅 Ближайшие Выплаты" || text.toLowerCase() === "/runway" || text.toLowerCase() === "/план") {
    sendRunwayReport(chatId);
    return;
  }

  // Кнопка "🧮 Понедельничный Сплит"
  if (text === "🧮 Понедельничный Сплит") {
    sendTelegramMessage(chatId, `🧮 Отправьте команду в формате:\n<code>/split СУММА</code>\n\nНапример:\n<code>/split 8000</code>`);
    return;
  }

  // Обработка /split 8000
  if (text.toLowerCase().startsWith("/split")) {
    const parts = text.split(/\s+/);
    const amount = parseFloat(parts[1]);
    if (isNaN(amount) || amount <= 0) {
      sendTelegramMessage(chatId, `⚠️ Укажите корректную сумму: <code>/split 8000</code>`);
      return;
    }
    sendSplitCalculation(chatId, amount);
    return;
  }

  // Кнопка "📊 Сводка P&L"
  if (text === "📊 Сводка P&L" || text.toLowerCase() === "/report") {
    sendPLSummary(chatId);
    return;
  }

  // Инструкция
  if (text === "ℹ️ Как вносить операции") {
    const help = `📝 <b>Форматы быстрого внесения операций:</b>\n\n` +
      `<b>1. Расход (Любой вариант):</b>\n` +
      `• <code>/out 350 Оскар OFTV монтаж</code>\n` +
      `• <code>Расход 175 Анастасия аванс</code>\n` +
      `• <code>-500 Трафик Reddit Eva Blush</code>\n\n` +
      `<b>2. Доход:</b>\n` +
      `• <code>/in 4500 Вывод OF Lolly</code>\n` +
      `• <code>Доход 300 Чаевые кастом Eva Pinky</code>\n` +
      `• <code>+1200 PPV рассылка Lila</code>\n\n` +
      `<i>Бот автоматически определит категорию и модель из текста описания!</i>`;
    sendTelegramMessage(chatId, help);
    return;
  }

  // Внесение расхода через /out, Расход, -СУММА
  if (text.toLowerCase().startsWith("/out") || text.toLowerCase().startsWith("расход") || text.startsWith("-")) {
    parseAndSaveTransaction(chatId, text, "Расход", username);
    return;
  }

  // Внесение дохода через /in, Доход, +СУММА
  if (text.toLowerCase().startsWith("/in") || text.toLowerCase().startsWith("доход") || text.startsWith("+")) {
    parseAndSaveTransaction(chatId, text, "Доход", username);
    return;
  }

  // Если текст не распознан
  sendTelegramMessage(chatId, `❓ Не понял команду.\nНапишите, например: <code>/out 350 Оскар OFTV</code>\nИли нажмите <b>💰 Баланс Кассы</b>.`);
}

function handleTelegramCallback(query) {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  if (data === "btn_balance") {
    sendCashBalanceReport(chatId);
  } else if (data === "btn_runway") {
    sendRunwayReport(chatId);
  }
}

// -------------------------------------------------------------------------
// ПАРСИНГ И СОХРАНЕНИЕ ОПЕРАЦИИ
// -------------------------------------------------------------------------

function parseAndSaveTransaction(chatId, text, defaultType, author) {
  // Убираем префикс команды
  let cleaned = text.replace(/^\/(out|in)\s*/i, "")
                    .replace(/^(расход|доход)\s*/i, "")
                    .replace(/^[+-]\s*/, "")
                    .trim();

  // Ищем сумму (первое число)
  const match = cleaned.match(/^(\d+(?:[.,]\d+)?)/);
  if (!match) {
    sendTelegramMessage(chatId, `⚠️ Не удалось распознать сумму.\nПример: <code>/out 350 Оскар OFTV</code>`);
    return;
  }

  const amount = parseFloat(match[1].replace(",", "."));
  const desc = cleaned.substring(match[0].length).trim() || (defaultType === "Расход" ? "Операционный расход" : "Доход");

  // Автоопределение модели
  const model = detectModel(desc);

  // Автоопределение категории
  const category = detectCategory(desc, defaultType);

  // Запись в Google Таблицу
  const today = new Date();
  addTransactionRow(today, defaultType, category, model, amount, desc, author);

  // Считаем актуальный баланс
  const stats = calculateSheetStats();

  const isInc = defaultType === "Доход";
  const icon = isInc ? "💵" : "💸";
  const sign = isInc ? "+" : "-";

  const reply = `✅ <b>Операция успешно записана!</b>\n` +
    `${icon} <b>${defaultType}:</b> ${sign}$${amount.toFixed(2)}\n` +
    `📂 <b>Категория:</b> ${category}\n` +
    `👑 <b>Модель:</b> ${model}\n` +
    `📝 <b>Описание:</b> ${desc}\n` +
    `👤 <b>Автор:</b> ${author}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>АКТУАЛЬНЫЙ ОСТАТОК КАССЫ:</b> <code>$${stats.balance.toFixed(2)}</code>`;

  sendTelegramMessage(chatId, reply);
}

function detectModel(desc) {
  const d = desc.toLowerCase();
  if (d.includes("blush") || d.includes("ева блаш") || d.includes("eva blush")) return "Eva Blush";
  if (d.includes("pinky") || d.includes("fansly") || d.includes("eva pinky")) return "Eva Pinky (Fansly)";
  if (d.includes("lollysunnery") || d.includes("саннери") || d.includes("sunnery")) return "Lolly (Lollysunnery)";
  if (d.includes("1lolly") || d.includes("лолли")) return "Lolly (1lollyhere)";
  if (d.includes("lila") || d.includes("angelkiss") || d.includes("лила")) return "Lila (angelkiss)";
  return "Agency Core (Общие)";
}

function detectCategory(desc, type) {
  const d = desc.toLowerCase();
  if (type === "Доход") {
    return "Выплаты OnlyFans";
  }

  // Расходы
  if (d.includes("оскар") || d.includes("osckelly") || d.includes("oftv") || d.includes("сценари") || d.includes("монтаж")) return "Трафик: TikTok";
  if (d.includes("анастасия") || d.includes("aneskagency") || d.includes("fyp") || d.includes("reels") || d.includes("tiktok") || d.includes("shorts")) return "Трафик: TikTok";
  if (d.includes("реддит") || d.includes("reddit") || d.includes("дейтинг") || d.includes("dating")) return "Трафик: Reddit";
  if (d.includes("леон") || d.includes("killerle0n") || d.includes("sfs") || d.includes("twitter") || d.includes("твиттер")) return "Трафик: Twitter";
  if (d.includes("чаттер") || d.includes("оператор") || d.includes("смена") || d.includes("зп")) return "Зарплаты: Чаттеры";
  if (d.includes("модел") || d.includes("выплата модел") || d.includes("доля")) return "Выплаты моделям";
  if (d.includes("монстр") || d.includes("onlymonster") || d.includes("monster") || d.includes("crm") || d.includes("софт")) return "Софт: OnlyMonster";
  if (d.includes("паксум") || d.includes("paxum") || d.includes("комисси") || d.includes("обнал") || d.includes("вывод") || d.includes("байбит") || d.includes("bybit")) return "Комиссии и вывод";
  return "Прочие расходы";
}

// -------------------------------------------------------------------------
// ОТЧЕТЫ ДЛЯ TELEGRAM
// -------------------------------------------------------------------------

function sendCashBalanceReport(chatId) {
  const stats = calculateSheetStats();

  const msg = `🏦 <b>АКТУАЛЬНОЕ СОСТОЯНИЕ КАССЫ</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>Остаток в кассе:</b> <code>$${stats.balance.toFixed(2)}</code>\n` +
    `💵 <b>Всего доходов:</b> $${stats.income.toFixed(2)}\n` +
    `💸 <b>Всего расходов:</b> $${stats.expense.toFixed(2)}\n` +
    `📊 <b>Чистая маржа:</b> ${stats.margin.toFixed(1)}%\n\n` +
    `<i>Записей в реестре: ${stats.count}</i>`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📅 Ближайшие выплаты", callback_data: "btn_runway" }]
    ]
  };

  sendTelegramMessage(chatId, msg, keyboard);
}

function sendRunwayReport(chatId) {
  const msg = `📅 <b>ПЛАТЕЖНЫЙ КАЛЕНДАРЬ ОБЯЗАТЕЛЬСТВ</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `• <b>OnlyMonster CRM:</b> $220 USDT\n` +
    `  ⏳ <i>Срок: 2-е число каждого месяца (единственный софт)</i>\n\n` +
    `• <b>@osckelly (Оскар) — OFTV:</b> $350 USDT\n` +
    `  ⏳ <i>Условия: Аванс 175$ в начале + 175$ закрытие 31-го</i>\n\n` +
    `• <b>@aneskagency (Анастасия) — FYP:</b> $250 USDT\n` +
    `  ⏳ <i>Условия: Выплата по 125$ каждые 2 недели</i>\n\n` +
    `• <b>@KillerLe0n (Леон) — SFS:</b> $580 USDT\n` +
    `  ⏳ <i>Срок: 1–5 число месяца по сверке</i>\n\n` +
    `• <b>🔒 Модели (25%) & Чаттеры (20%):</b>\n` +
    `  ⏳ <i>Срок: 15-го (аванс) и 31-го (расчет)</i>\n\n` +
    `💡 <i>Выводы OnlyFans поступают каждый понедельник. Распределяйте транш через калькулятор сплита!</i>`;

  sendTelegramMessage(chatId, msg);
}

function sendSplitCalculation(chatId, payout) {
  const modelsFund = Math.round(payout * 0.25);
  const chattersFund = Math.round(payout * 0.20);
  const trafficWeek = 950;
  const profitBuffer = Math.max(0, payout - modelsFund - chattersFund - trafficWeek);

  const msg = `🧮 <b>ПОНЕДЕЛЬНИЧНЫЙ СПЛИТ ВЫВОДА OF</b>\n` +
    `📥 Сумма транша: <b>$${payout.toLocaleString()}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🔒 <b>Фонд Моделей (25%):</b> $${modelsFund.toLocaleString()}\n` +
    `<i>Копилка на 15 и 31 число</i>\n\n` +
    `🔒 <b>Фонд Чаттеров (20%):</b> $${chattersFund.toLocaleString()}\n` +
    `<i>Зарплатный фонд на 15 и 31 число</i>\n\n` +
    `⚡ <b>Трафик & Софт недели:</b> $${trafficWeek.toLocaleString()}\n` +
    `<i>Оскар, Леон, Анастасия, CRM Monster</i>\n\n` +
    `🟢 <b>Свободный буфер / Прибыль:</b> <b>$${profitBuffer.toLocaleString()}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💡 <i>Оставьте свободный буфер на счету кассы для покрытия непредвиденных трат.</i>`;

  sendTelegramMessage(chatId, msg);
}

function sendPLSummary(chatId) {
  const stats = calculateSheetStats();

  const msg = `📊 <b>СВОДКА P&L АГЕНТСТВА MIRRORS</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💵 <b>Выручка (Gross):</b> $${stats.income.toLocaleString()}\n` +
    `💸 <b>Расходы (OPEX):</b> $${stats.expense.toLocaleString()}\n` +
    `🏆 <b>Чистая Прибыль:</b> $${stats.balance.toLocaleString()}\n` +
    `📈 <b>Маржинальность:</b> ${stats.margin.toFixed(1)}%\n\n` +
    `Для детальной аналитики по анкетам откройте Vercel-дашборд.`;

  sendTelegramMessage(chatId, msg);
}

// -------------------------------------------------------------------------
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ GOOGLE ТАБЛИЦЫ
// -------------------------------------------------------------------------

function getOrCreateTransactionsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME_TX);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_TX);
    // Добавляем заголовки
    const headers = ["Дата", "Тип", "Категория", "Модель/Проект", "Сумма ($)", "Описание", "Автор"];
    sheet.appendRow(headers);
    sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#1e293b").setFontColor("#38bdf8");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 110);
    sheet.setColumnWidth(2, 90);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(4, 160);
    sheet.setColumnWidth(5, 110);
    sheet.setColumnWidth(6, 260);
    sheet.setColumnWidth(7, 130);
  }
  return sheet;
}

function addTransactionRow(date, type, category, model, amount, desc, author) {
  const sheet = getOrCreateTransactionsSheet();
  const dateFormatted = (date instanceof Date) ? Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd") : date;
  sheet.appendRow([dateFormatted, type, category, model, amount, desc, author]);
}

function calculateSheetStats() {
  const sheet = getOrCreateTransactionsSheet();
  const data = sheet.getDataRange().getValues();
  
  let income = 0;
  let expense = 0;
  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const type = String(row[1] || "").trim();
    const amount = parseFloat(row[4]) || 0;
    if (amount <= 0) continue;

    count++;
    if (type.toLowerCase() === "доход" || type.toLowerCase() === "in") {
      income += amount;
    } else {
      expense += amount;
    }
  }

  const balance = income - expense;
  const margin = income > 0 ? (balance / income) * 100 : 0;

  return { income, expense, balance, margin, count };
}

// -------------------------------------------------------------------------
// СЕТЕВЫЕ ЗАПРОСЫ К TELEGRAM API
// -------------------------------------------------------------------------

function sendTelegramMessage(chatId, text, replyMarkup) {
  if (!BOT_TOKEN || BOT_TOKEN === "ВАШ_ТОКЕН_ОТ_BOTFATHER") {
    console.warn("BOT_TOKEN не настроен!");
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };

  if (replyMarkup) {
    payload.reply_markup = JSON.stringify(replyMarkup);
  }

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    console.error("Failed to send TG message:", e);
  }
}

/**
 * Одноразовая функция установки вебхука Telegram:
 * Запустите эту функцию ОДИН РАЗ после развертывания веб-приложения!
 */
function setTelegramWebhook() {
  // Вставьте сюда URL вашего развернутого веб-приложения Google Apps Script:
  const WEB_APP_URL = "ВСТАВЬТЕ_СЮДА_URL_ВЕБ_ПРИЛОЖЕНИЯ";

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(WEB_APP_URL)}`;
  const response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
