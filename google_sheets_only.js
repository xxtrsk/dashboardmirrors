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
 * 1. ЧТЕНИЕ: Отдает все строки из таблицы в дашборд Vercel
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
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
      const amount = parseFloat(String(row[4]).replace("$", "").replace(",", ".")) || 0;
      const desc = String(row[5] || "").trim();

      if (amount > 0) {
        transactions.push({
          id: i,
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
 * 2. ЗАПИСЬ: Добавляет операцию из дашборда Vercel в Google Таблицу
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("Empty POST");
    }

    const payload = JSON.parse(e.postData.contents);
    const tx = payload.transaction || payload;

    const sheet = getOrCreateSheet();
    const dateStr = tx.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const type = tx.type || "Расход";
    const category = tx.category || "Прочие операционные расходы";
    const model = tx.model || "Agency Core (Общие)";
    const amount = parseFloat(tx.amount) || 0;
    const desc = tx.desc || "";

    sheet.appendRow([dateStr, type, category, model, amount, desc]);

    return createJsonResponse({ status: "ok", message: "Transaction added successfully" });
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
  }
  return sheet;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
