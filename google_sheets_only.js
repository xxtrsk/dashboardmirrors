/**
 * =========================================================================
 * MIRRORS AGENCY — ПРЯМАЯ СВЯЗКА GOOGLE ТАБЛИЦЫ С ДАШБОРДОМ (БЕЗ БОТА)
 * =========================================================================
 * 
 * Этот скрипт вставляется в Google Таблицу (Расширения -> Apps Script).
 * 
 * Что он делает:
 * 1. Вы (или овнер/бухгалтер) можете вести учет прямо руками в Google Таблице 
 *    (Дата, Тип, Категория, Модель, Сумма, Описание).
 * 2. Дашборд на Vercel автоматически считывает все данные из таблицы через doGet.
 * 3. Если вы вносите операцию через сайт — она автоматически добавляется новой строкой в таблицу (doPost).
 * =========================================================================
 */

const SHEET_NAME = "Транзакции";

/**
 * Надежный парсер числовых сумм (поддерживает $4,200.00, 4 200,00, 400.000 и др.)
 */
function cleanAmount(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  let s = String(val).trim().replace(/[$€₽\s]/g, "");
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(".") > s.lastIndexOf(",")) {
      // Запятые — разделители тысяч: 400,000.00
      s = s.replace(/,/g, "");
    } else {
      // Точки — разделители тысяч, запятая — десятичная: 400.000,00
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
 * 1. ЧТЕНИЕ И УДАЛЕНИЕ: Отдает данные или удаляет по GET-запросу без CORS проблем
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();

    // 1. МГНОВЕННОЕ УДАЛЕНИЕ ОПЕРАЦИИ ЧЕРЕЗ GET (Браузер отправляет без блокировок CORS)
    if (e && e.parameter && e.parameter.action === "deleteTransaction") {
      return executeDelete(sheet, e.parameter);
    }

    // 2. ОЧИСТКА БАГНУТЫХ 100K ТРАНЗАКЦИЙ ЧЕРЕЗ GET
    if (e && e.parameter && e.parameter.action === "deleteBuggy100k") {
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
      return createJsonResponse({ status: "ok", message: `Deleted ${deleted} rows`, deletedCount: deleted });
    }

    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return createJsonResponse({ status: "ok", count: 0, transactions: [] });
    }

    const transactions = [];

    // Читаем строки со 2-й (пропуская заголовок)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[4]) continue; // Пропуск пустых строк

      // Форматирование даты в YYYY-MM-DD
      let dateStr = "";
      if (row[0] instanceof Date) {
        dateStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        dateStr = String(row[0] || "").trim();
      }

      let type = String(row[1] || "Расход").trim();
      if (type.toLowerCase() === "in" || type.toLowerCase() === "доход") type = "Доход";
      else type = "Расход";

      const category = String(row[2] || "Прочие операционные расходы").trim();
      const model = String(row[3] || "Agency Core (Общие)").trim();
      const amount = cleanAmount(row[4]);
      const desc = String(row[5] || "").trim();

      if (amount > 0) {
        transactions.push({
          id: i, // индекс строки data[i] (в таблице i+1)
          date: dateStr,
          type: type,
          category: category,
          model: model,
          amount: amount,
          desc: desc
        });
      }
    }

    // Свежие записи первыми
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
 * Надежная функция физического удаления строк из Google Таблицы
 */
function executeDelete(sheet, target) {
  const data = sheet.getDataRange().getValues();
  let deletedCount = 0;
  const targetAmount = cleanAmount(target.amount);
  const targetModel = String(target.model || "").trim().toLowerCase();
  const targetDate = String(target.date || "").trim();
  const targetRowIndex = Number(target.rowIndex || target.id || 0);
  const deleteAll = String(target.deleteAllDuplicates || target.deleteAll) === "true" || target.deleteAllDuplicates === true;

  // Удаляем строки снизу вверх, чтобы номера строк не сбивались
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
      (targetModel === "" || rModel.includes(targetModel) || targetModel.includes(rModel)) &&
      (targetDate === "" || rDate === targetDate || rDate.includes(targetDate) || targetDate.includes(rDate))
    );

    if (isExactIndex || isFieldMatch) {
      sheet.deleteRow(i + 1); // В Sheets нумерация строк с 1
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

/**
 * 2. ЗАПИСЬ / УДАЛЕНИЕ ЧЕРЕЗ POST
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("Empty POST");
    }

    const payload = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

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

    // 1. УДАЛЕНИЕ ОПЕРАЦИИ ЧЕРЕЗ POST
    if (payload.action === "deleteTransaction") {
      return executeDelete(sheet, payload.transaction || payload);
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

    // 3. УДАЛЕНИЕ ОПЕРАЦИЙ КОНКРЕТНОЙ МОДЕЛИ (например, для сброса бага)
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

    // 4. ДОБАВЛЕНИЕ ОПЕРАЦИИ (ТОЛЬКО ЕСЛИ ЯВНО ВЫЗВАН addTransaction)
    if (payload.action === "addTransaction") {
      const tx = payload.transaction || payload;
      const dateStr = tx.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
      const type = tx.type || "Расход";
      const category = tx.category || "Прочие операционные расходы";
      const model = tx.model || "Agency Core (Общие)";
      const amount = cleanAmount(tx.amount);
      const desc = tx.desc || "";

      sheet.appendRow([dateStr, type, category, model, amount, desc]);
      return createJsonResponse({ status: "ok", message: "Transaction added successfully" });
    }

    return createJsonResponse({ status: "ignored", message: "Unknown action" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Создает или находит лист "Транзакции" с правильными красивыми заголовками
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ["Дата", "Тип (Расход/Доход)", "Категория", "Модель / Проект", "Сумма ($)", "Описание / Комментарий"];
    sheet.appendRow(headers);
    sheet.getRange("A1:F1").setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 110);
    sheet.setColumnWidth(2, 140);
    sheet.setColumnWidth(3, 220);
    sheet.setColumnWidth(4, 180);
    sheet.setColumnWidth(5, 120);
    sheet.setColumnWidth(6, 300);

    applyDataValidation(sheet);
  }
  return sheet;
}

/**
 * Создает выпадающие списки для колонок Тип, Категория и Модель (защита от опечаток)
 */
function applyDataValidation(sheet) {
  const maxRows = 1000;

  // 1. Колонка B: Тип
  const ruleType = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Расход", "Доход"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 2, maxRows, 1).setDataValidation(ruleType);

  // 2. Колонка C: Категории
  const categories = [
    "Трафик: Reddit",
    "Трафик: TikTok",
    "Трафик: Twitter",
    "Зарплаты: Чаттеры",
    "Выплаты моделям",
    "Софт: OnlyMonster",
    "Комиссии и вывод",
    "Прочие расходы",
    "Выплаты OnlyFans",
    "Прочий доход"
  ];
  const ruleCat = SpreadsheetApp.newDataValidation()
    .requireValueInList(categories, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 3, maxRows, 1).setDataValidation(ruleCat);

  // 3. Колонка D: Модели
  const models = [
    "Eva Blush",
    "Lolly (Lollysunnery)",
    "Lolly (1lollyhere)",
    "Lila (angelkiss)",
    "Eva Pinky (Fansly)",
    "Agency Core (Общие)"
  ];
  const ruleModel = SpreadsheetApp.newDataValidation()
    .requireValueInList(models, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 4, maxRows, 1).setDataValidation(ruleModel);
}

/**
 * Можно запустить вручную в редакторе Apps Script, чтобы добавить выпадающие списки в существующую таблицу
 */
function setupDropdownsNow() {
  const sheet = getOrCreateSheet();
  applyDataValidation(sheet);
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
