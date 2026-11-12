// MIRRORS Financial P&L Engine & Budgeting System (Plan vs Fact)
// Compatible with Vercel Static Hosting & Client-side XLSX export/import

const STORAGE_KEY_TX = 'mirrors_finance_transactions_v2';
const STORAGE_KEY_BUDGET = 'mirrors_finance_budgets_v2';
const STORAGE_KEY_GSHEET_URL = 'mirrors_finance_gsheet_url_v1';
const STORAGE_KEY_DELETED = 'mirrors_deleted_tx_signatures_v1';

export const FINANCE_INCOME_CATS = [
  'Выплаты OnlyFans',
  'Прочий доход'
];

export const FINANCE_EXPENSE_CATS = [
  'Трафик: Reddit',
  'Трафик: TikTok',
  'Трафик: Twitter',
  'Зарплаты: Чаттеры',
  'Выплаты моделям',
  'Софт: OnlyMonster',
  'Комиссии и вывод',
  'Прочие расходы'
];

export const FINANCE_MODELS = [
  'Lolly (Lollysunnery)',
  'Lolly (1lollyhere)',
  'Eva Blush',
  'Lila (angelkiss)',
  'Eva Pinky (Fansly)',
  'Polina',
  'Agency Core (Общие)'
];

const DEFAULT_BUDGETS = {
  'Трафик и Маркетинг': 8500,
  'Зарплаты Чаттеров & Команды': 6000,
  'Софт: OnlyMonster CRM': 220,
  'Комиссии и Обнал': 900
};

export const CONTRACTOR_SCHEDULE = [
  {
    id: 'osckelly',
    name: '@osckelly (Оскар) — OFTV',
    role: 'Сценарии, монтаж, выгрузка контента на платформу',
    terms: '350 USDT / месяц (4 сценария). Аванс 175$ в начале + 175$ закрытие в конце',
    dueDateStr: '2-е число (175$) и 31-е (175$)',
    defaultAmount: 350,
    installments: 2,
    installmentAmount: 175,
    keywords: ['оскар', 'osckelly', 'oftv'],
    model: 'Agency Core (Общие)',
    category: 'Трафик: TikTok',
    warning: '⚠️ Проверить отгрузку сценариев перед выплатой 2-й части (175 USDT)!',
    urgencyColor: 'var(--accent-amber)',
    urgencyBadge: '2 транша (175 + 175)'
  },
  {
    id: 'aneskagency',
    name: '@aneskagency (Анастасия) — FYP',
    role: 'FYP продвижение и закупка трафика',
    terms: '250 USDT / месяц на анкету. Выплата 2 раза в месяц (по 125$ каждые 2 недели)',
    dueDateStr: 'Каждые 2 недели вперед (по 125$)',
    defaultAmount: 250,
    installments: 2,
    installmentAmount: 125,
    keywords: ['анастасия', 'aneskagency', 'fyp'],
    model: 'Agency Core (Общие)',
    category: 'Трафик: TikTok',
    warning: '🔵 Предоплата на 2 недели вперед. Оплачивать после понедельничного вывода.',
    urgencyColor: 'var(--primary)',
    urgencyBadge: '2 транша (125 + 125)'
  },
  {
    id: 'crm_monster',
    name: 'OnlyMonster CRM',
    role: 'Единственный софт агентства (учет смен, чаттеров, фанов)',
    terms: '220 USDT / месяц (единственный софт агентства). Оплата 2-го числа',
    dueDateStr: '2 число каждого месяца',
    defaultAmount: 220,
    installments: 1,
    installmentAmount: 220,
    keywords: ['монстр', 'onlymonster', 'crm'],
    model: 'Agency Core (Общие)',
    category: 'Софт: OnlyMonster',
    warning: '🟣 Единственная подписка агентства ($220). Оплачивать 2-го числа каждого месяца.',
    urgencyColor: 'var(--accent-purple)',
    urgencyBadge: '220$ / 2-го числа'
  },
  {
    id: 'killerleon',
    name: '@KillerLe0n (Леон) — SFS',
    role: 'SFS трафик на всех анкетах с SFS',
    terms: '0.4$ / фанат. Оплата по факту месяца в первых числах (1-5) по сверке',
    dueDateStr: '1–5 числа месяца',
    defaultAmount: 580,
    installments: 1,
    installmentAmount: 580,
    keywords: ['леон', 'killerle0n', 'sfs'],
    model: 'Agency Core (Общие)',
    category: 'Трафик: Twitter',
    warning: '🟢 Оплата по сверке после первого понедельничного вывода OF.',
    urgencyColor: 'var(--accent-green)',
    urgencyBadge: 'По сверке (1–5 число)'
  }
];

const SEED_TRANSACTIONS = [];

class FinanceManager {
  constructor() {
    this.deletedSignatures = this.loadDeletedSignatures();
    this.transactions = this.loadTransactions().filter(t => !this.isBuggyTransaction(t));
    this.saveTransactions();
    this.budgets = this.loadBudgets();
    this.selectedPeriod = 'all'; // 'all', '2026-11', '2026-10', '2026-09'
    this.selectedModel = 'all';
  }

  loadDeletedSignatures() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DELETED);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {}
    return new Set();
  }

  addDeletedSignature(sig) {
    if (!sig) return;
    this.deletedSignatures.add(sig);
    try {
      localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(Array.from(this.deletedSignatures)));
    } catch (e) {}
  }

  isBuggyTransaction(t) {
    if (!t) return true;
    const amt = Number(t.amount) || 0;
    // 1. Блокируем любую аномальную 100k / >=90k транзакцию навсегда
    if (amt >= 90000) return true;
    if (t.model && t.model.toLowerCase().includes('lolly') && t.type === 'Доход' && amt >= 50000) return true;

    // 2. Черный список ранее удаленных операций
    const sig = `${t.date}_${t.type}_${t.category}_${t.model}_${amt.toFixed(2)}_${(t.desc || '').trim()}`;
    if (this.deletedSignatures && this.deletedSignatures.has(sig)) return true;

    return false;
  }

  loadTransactions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TX);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(t => !this.isBuggyTransaction(t));
        }
      }
    } catch (e) {
      console.warn('LocalStorage load failed, using seed data:', e);
    }
    return [...SEED_TRANSACTIONS];
  }

  saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(this.transactions));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  loadBudgets() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BUDGET);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage load failed for budgets:', e);
    }
    return { ...DEFAULT_BUDGETS };
  }

  saveBudgets() {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(this.budgets));
    } catch (e) {
      console.warn('Failed to save budgets:', e);
    }
  }

  loadGSheetUrl() {
    try {
      return localStorage.getItem(STORAGE_KEY_GSHEET_URL) || '';
    } catch (e) {
      return '';
    }
  }

  saveGSheetUrl(url) {
    try {
      if (url) {
        localStorage.setItem(STORAGE_KEY_GSHEET_URL, url.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_GSHEET_URL);
      }
    } catch (e) {
      console.warn('Failed to save GSheet URL:', e);
    }
  }

  async syncWithGoogleSheets(url) {
    const targetUrl = url || this.loadGSheetUrl();
    if (!targetUrl) return { success: false, message: 'URL не указан' };

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.transactions)) {
        // Защита от размножения дубликатов и цикличных 100k операций:
        const seen = new Set();
        const uniqueTx = [];
        data.transactions.forEach(t => {
          if (this.isBuggyTransaction(t)) return; // ПОЛНОСТЬЮ ИГНОРИРУЕМ 100k И УДАЛЕННЫЕ
          const key = `${t.date}_${t.type}_${t.category}_${t.model}_${Number(t.amount).toFixed(2)}_${(t.desc || '').trim()}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueTx.push(t);
          }
        });

        this.transactions = uniqueTx;
        this.saveTransactions();
        return { success: true, count: uniqueTx.length, totalRaw: data.transactions.length };
      } else {
        throw new Error('Некорректный формат данных от скрипта Google Sheets');
      }
    } catch (err) {
      console.warn('Sync with Google Sheets failed:', err);
      return { success: false, message: err.message };
    }
  }

  addTransaction(tx) {
    const newTx = {
      id: Date.now(),
      date: tx.date || new Date().toISOString().split('T')[0],
      type: tx.type || 'Расход',
      category: tx.category || 'Прочие операционные расходы',
      amount: parseFloat(tx.amount) || 0,
      model: tx.model || 'Agency Core (Общие)',
      desc: (tx.desc || '').trim()
    };
    this.transactions.unshift(newTx);
    this.saveTransactions();

    // Фоновая синхронизация с Google Sheets, если подключен Webhook
    const gsheetUrl = this.loadGSheetUrl();
    if (gsheetUrl) {
      try {
        fetch(gsheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'addTransaction', transaction: newTx })
        }).catch(e => console.warn('Background sync to Google Sheets failed:', e));
      } catch (e) {
        console.warn('Fetch error:', e);
      }
    }

    return newTx;
  }

  deleteTransaction(id, deleteAllDuplicates = true) {
    const targetTx = this.transactions.find(t => String(t.id) === String(id));
    if (!targetTx) return;

    // Запоминаем удаленную операцию в черном списке, чтобы автосинк никогда не вернул её
    const amt = Number(targetTx.amount) || 0;
    const sig = `${targetTx.date}_${targetTx.type}_${targetTx.category}_${targetTx.model}_${amt.toFixed(2)}_${(targetTx.desc || '').trim()}`;
    this.addDeletedSignature(sig);

    if (deleteAllDuplicates) {
      // Удаляем саму операцию и все её идентичные дубликаты
      this.transactions = this.transactions.filter(t => !(
        String(t.id) === String(id) ||
        (t.date === targetTx.date &&
         t.type === targetTx.type &&
         t.model === targetTx.model &&
         Math.abs(Number(t.amount) - Number(targetTx.amount)) < 0.01 &&
         (t.desc || '') === (targetTx.desc || ''))
      ));
    } else {
      this.transactions = this.transactions.filter(t => String(t.id) !== String(id));
    }
    this.saveTransactions();

    // Отправляем команду удаления в Google Sheets (одновременно GET и POST для 100% гарантии доставки)
    const gsheetUrl = this.loadGSheetUrl();
    if (gsheetUrl && targetTx) {
      const getDelUrl = `${gsheetUrl}${gsheetUrl.includes('?') ? '&' : '?'}action=deleteTransaction&amount=${encodeURIComponent(targetTx.amount)}&model=${encodeURIComponent(targetTx.model || '')}&date=${encodeURIComponent(targetTx.date || '')}&desc=${encodeURIComponent(targetTx.desc || '')}&deleteAll=${deleteAllDuplicates}&rowIndex=${encodeURIComponent(targetTx.id || 0)}&t=${Date.now()}`;
      
      // 1. Надежный GET-запрос (обходит CORS и preflight)
      try {
        fetch(getDelUrl, { mode: 'no-cors' }).catch(() => {});
      } catch (e) {}

      // 2. POST-запрос с полным телом
      try {
        fetch(gsheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ 
            action: 'deleteTransaction', 
            transaction: targetTx,
            amount: targetTx.amount,
            model: targetTx.model,
            date: targetTx.date,
            desc: targetTx.desc,
            rowIndex: targetTx.id,
            deleteAllDuplicates: deleteAllDuplicates
          })
        }).catch(e => console.warn('Background delete in Google Sheets failed:', e));
      } catch (e) {
        console.warn('Fetch error:', e);
      }
    }
  }

  cleanDuplicates() {
    const seen = new Set();
    const initialLen = this.transactions.length;
    this.transactions = this.transactions.filter(t => {
      const key = `${t.date}_${t.type}_${t.category}_${t.model}_${Number(t.amount).toFixed(2)}_${t.desc || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    this.saveTransactions();

    const gsheetUrl = this.loadGSheetUrl();
    if (gsheetUrl) {
      try {
        fetch(gsheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'cleanDuplicates' })
        }).catch(e => console.warn('Clean duplicates in Google Sheets failed:', e));
      } catch (e) {}
    }

    return initialLen - this.transactions.length;
  }

  resetModelIncome(modelName) {
    const beforeCount = this.transactions.length;
    this.transactions = this.transactions.filter(t => !(t.model === modelName && t.type === 'Доход'));
    this.saveTransactions();

    const gsheetUrl = this.loadGSheetUrl();
    if (gsheetUrl) {
      try {
        fetch(gsheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'deleteModelTransactions', model: modelName, type: 'Доход' })
        }).catch(e => console.warn('Reset model income in Google Sheets failed:', e));
      } catch (e) {}
    }
    return beforeCount - this.transactions.length;
  }

  getFiltered() {
    return this.transactions.filter(tx => {
      if (this.selectedPeriod !== 'all' && !tx.date.startsWith(this.selectedPeriod)) {
        return false;
      }
      if (this.selectedModel !== 'all' && tx.model !== this.selectedModel) {
        return false;
      }
      return true;
    });
  }

  // Баланс кассы — считает ВСЕ транзакции (не фильтрованные), чтобы показывать актуальный остаток
  calculateCashBalance() {
    let balance = 0;
    this.transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        balance += amt;
      } else if (t.type === 'Расход') {
        balance -= amt;
      }
    });
    return balance;
  }

  // Полный сброс кассы (удаляет все данные)
  resetAll() {
    this.transactions = [];
    this.budgets = { ...DEFAULT_BUDGETS };
    try {
      localStorage.removeItem(STORAGE_KEY_TX);
      localStorage.removeItem(STORAGE_KEY_BUDGET);
    } catch (e) {
      console.warn('Reset failed:', e);
    }
  }

  calculateMetrics(txList = this.getFiltered()) {
    let income = 0;
    let expense = 0;
    let trafficExpense = 0;
    let chatterExpense = 0;
    let modelPayouts = 0;
    let withdrawalFees = 0;

    txList.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        income += amt;
      } else if (t.type === 'Расход') {
        expense += amt;
        const cat = (t.category || '').toLowerCase();
        const desc = (t.desc || '').toLowerCase();
        if (cat.startsWith('трафик')) {
          trafficExpense += amt;
        } else if (cat.includes('чаттер') || cat.includes('оператор')) {
          chatterExpense += amt;
        } else if (cat.includes('модел')) {
          modelPayouts += amt;
        } else if (cat.includes('комисси') || cat.includes('вывод') || desc.includes('комисси') || desc.includes('вывод') || desc.includes('paxum') || desc.includes('bybit')) {
          withdrawalFees += amt;
        }
      }
    });

    const netProfit = income - expense;
    const netMargin = income > 0 ? (netProfit / income) * 100 : 0;
    const roas = trafficExpense > 0 ? (income / trafficExpense) : 0;
    const effectiveFeePct = income > 0 ? (withdrawalFees / income) * 100 : 0;

    return { income, expense, netProfit, netMargin, trafficExpense, chatterExpense, modelPayouts, withdrawalFees, effectiveFeePct, roas };
  }

  // Расчет зарплатного резерва (Эскроу) по периодам:
  // Период 1 (1-15 число): выплата 31-го числа
  // Период 2 (16-31 число): выплата 15-го числа след. месяца
  // Ставки: Модели 25%, Чаттеры 20% (Итого 45%)
  calculatePayrollEscrow(txList = this.getFiltered()) {
    let p1Income = 0;
    let p2Income = 0;
    let modelsPaid = 0;
    let chattersPaid = 0;

    txList.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        const day = parseInt((t.date || '').split('-')[2], 10) || 1;
        if (day <= 15) {
          p1Income += amt;
        } else {
          p2Income += amt;
        }
      } else if (t.type === 'Расход') {
        const cat = (t.category || '').toLowerCase();
        if (cat.includes('модел')) {
          modelsPaid += amt;
        } else if (cat.includes('чаттер') || cat.includes('оператор')) {
          chattersPaid += amt;
        }
      }
    });

    // Начисления Период 1 (1-15) к выплате 31-го
    const p1ModelsDue = p1Income * 0.25;
    const p1ChattersDue = p1Income * 0.20;
    const p1TotalDue = p1ModelsDue + p1ChattersDue;

    // Начисления Период 2 (16-31) к выплате 15-го след. месяца
    const p2ModelsDue = p2Income * 0.25;
    const p2ChattersDue = p2Income * 0.20;
    const p2TotalDue = p2ModelsDue + p2ChattersDue;

    // Списание фактических выплат: сначала гасим Период 1, затем Период 2
    const p1ModelsPaidApplied = Math.min(p1ModelsDue, modelsPaid);
    const p2ModelsPaidApplied = Math.min(p2ModelsDue, Math.max(0, modelsPaid - p1ModelsDue));

    const p1ChattersPaidApplied = Math.min(p1ChattersDue, chattersPaid);
    const p2ChattersPaidApplied = Math.min(p2ChattersDue, Math.max(0, chattersPaid - p1ChattersDue));

    const p1ModelsRemaining = Math.max(0, p1ModelsDue - p1ModelsPaidApplied);
    const p1ChattersRemaining = Math.max(0, p1ChattersDue - p1ChattersPaidApplied);
    const p1Remaining = p1ModelsRemaining + p1ChattersRemaining;

    const p2ModelsRemaining = Math.max(0, p2ModelsDue - p2ModelsPaidApplied);
    const p2ChattersRemaining = Math.max(0, p2ChattersDue - p2ChattersPaidApplied);
    const p2Remaining = p2ModelsRemaining + p2ChattersRemaining;

    const totalEscrowRemaining = p1Remaining + p2Remaining;

    return {
      p1Income,
      p2Income,
      p1ModelsDue,
      p1ChattersDue,
      p1TotalDue,
      p1Remaining,
      p2ModelsDue,
      p2ChattersDue,
      p2TotalDue,
      p2Remaining,
      modelsPaid,
      chattersPaid,
      totalEscrowRemaining
    };
  }

  mapCategoryToBudgetGroup(cat) {
    if (cat.startsWith('Трафик')) return 'Трафик и Маркетинг';
    if (cat.startsWith('Зарплаты')) return 'Зарплаты Чаттеров & Команды';
    if (cat.includes('Софт') || cat.includes('Инфраструктура') || cat.toLowerCase().includes('monster') || cat.toLowerCase().includes('монстр')) return 'Софт: OnlyMonster CRM';
    if (cat.includes('Комиссии')) return 'Комиссии и Обнал';
    return null;
  }

  calculateBudgetsProgress(txList = this.getFiltered()) {
    const actuals = {
      'Трафик и Маркетинг': 0,
      'Зарплаты Чаттеров & Команды': 0,
      'Софт: OnlyMonster CRM': 0,
      'Комиссии и Обнал': 0
    };

    txList.forEach(t => {
      if (t.type === 'Расход') {
        const group = this.mapCategoryToBudgetGroup(t.category);
        if (group && actuals[group] !== undefined) {
          actuals[group] += Number(t.amount) || 0;
        }
      }
    });

    const result = [];
    for (const [group, plan] of Object.entries(this.budgets)) {
      const fact = actuals[group] || 0;
      const pct = plan > 0 ? (fact / plan) * 100 : 0;
      const remaining = plan - fact;
      result.push({ group, plan, fact, pct, remaining });
    }
    return result;
  }
}

export function initFinanceModule() {
  const manager = new FinanceManager();
  let lastSyncTime = 0;

  // DOM Elements
  const periodSelect = document.getElementById('finance-period-select');
  const modelSelect = document.getElementById('finance-model-select');
  const btnExportExcel = document.getElementById('btn-finance-export-excel');
  const fileImportInput = document.getElementById('finance-file-import');
  const btnReset = document.getElementById('btn-finance-reset');
  const btnToggleGsheet = document.getElementById('btn-toggle-gsheet-panel');
  const btnCloseGsheet = document.getElementById('btn-close-gsheet-panel');
  const gsheetPanel = document.getElementById('fin-gsheet-panel');
  const inputGsheetUrl = document.getElementById('input-gsheet-url');
  const btnGsheetSaveSync = document.getElementById('btn-gsheet-save-sync');
  const btnGsheetDisconnect = document.getElementById('btn-gsheet-disconnect');
  const badgeGsheet = document.getElementById('gsheet-status-badge');
  const formAddTx = document.getElementById('form-add-finance-tx');
  const txTypeRadios = document.querySelectorAll('input[name="finance-tx-type"]');
  const txCatSelect = document.getElementById('finance-tx-category');

  // Populate dynamic selects
  if (txCatSelect) {
    updateCategoryDropdown('Расход');
  }

  function updateCategoryDropdown(type) {
    if (!txCatSelect) return;
    const cats = type === 'Доход' ? FINANCE_INCOME_CATS : FINANCE_EXPENSE_CATS;
    txCatSelect.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');

    const feeGroup = document.getElementById('finance-fee-group');
    if (feeGroup) {
      feeGroup.style.display = type === 'Доход' ? 'block' : 'none';
    }
  }

  txTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateCategoryDropdown(e.target.value);
    });
  });

  // Filter Listeners
  periodSelect?.addEventListener('change', (e) => {
    manager.selectedPeriod = e.target.value;
    renderAll();
  });

  modelSelect?.addEventListener('change', (e) => {
    manager.selectedModel = e.target.value;
    renderAll();
  });

  // Add Transaction
  formAddTx?.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="finance-tx-type"]:checked')?.value || 'Расход';
    const date = document.getElementById('finance-tx-date')?.value;
    const category = document.getElementById('finance-tx-category')?.value;
    const amount = document.getElementById('finance-tx-amount')?.value;
    const model = document.getElementById('finance-tx-model')?.value;
    const desc = document.getElementById('finance-tx-desc')?.value;
    const feeInput = document.getElementById('finance-tx-fee');
    const fee = feeInput ? parseFloat(feeInput.value) || 0 : 0;

    if (!amount || Number(amount) <= 0) {
      alert('Укажите корректную сумму операции.');
      return;
    }

    manager.addTransaction({ date, type, category, amount, model, desc });

    // Автоматическая фиксация комиссии вывода/обнала при внесении дохода
    if (type === 'Доход' && fee > 0) {
      manager.addTransaction({
        date,
        type: 'Расход',
        category: 'Комиссии и вывод',
        amount: fee,
        model,
        desc: `Комиссия вывода / обнала (${desc || model})`
      });
    }

    formAddTx.reset();
    if (feeInput) feeInput.value = '';
    updateCategoryDropdown('Расход');
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('finance-tx-date');
    if (dateInput) dateInput.value = today;

    renderAll();
    showToast(fee > 0 ? `✅ Доход ($${amount}) и комиссия ($${fee}) записаны!` : '✅ Финансовая операция добавлена!');
  });

  // Excel Export via SheetJS
  btnExportExcel?.addEventListener('click', () => {
    if (typeof XLSX === 'undefined') {
      alert('Библиотека XLSX не загружена.');
      return;
    }

    const txs = manager.getFiltered();
    const metrics = manager.calculateMetrics(txs);
    const budgets = manager.calculateBudgetsProgress(txs);

    // Sheet 1: Транзакции
    const wsTxData = [
      ['Дата', 'Тип', 'Категория', 'Модель/Проект', 'Сумма ($)', 'Комментарий']
    ];
    txs.forEach(t => {
      wsTxData.push([t.date, t.type, t.category, t.model, t.amount, t.desc]);
    });
    const wsTx = XLSX.utils.aoa_to_sheet(wsTxData);

    // Sheet 2: План vs Факт
    const wsBudgetData = [
      ['Статья расходов', 'План ($)', 'Факт ($)', 'Остаток ($)', 'Освоение (%)']
    ];
    budgets.forEach(b => {
      wsBudgetData.push([b.group, b.plan, b.fact, b.remaining, `${b.pct.toFixed(1)}%`]);
    });
    const wsBudget = XLSX.utils.aoa_to_sheet(wsBudgetData);

    // Sheet 3: Сводка P&L
    const wsSummaryData = [
      ['Показатель P&L', 'Значение'],
      ['Общая Выручка (Gross Revenue)', metrics.income],
      ['Общие Расходы (Total OPEX)', metrics.expense],
      ['Чистая Прибыль Агентства', metrics.netProfit],
      ['Чистая Маржинальность', `${metrics.netMargin.toFixed(1)}%`],
      ['Затраты на Трафик', metrics.trafficExpense],
      ['ROAS на трафик', `${metrics.roas.toFixed(2)}x`]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(wsSummaryData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, 'P&L Сводка');
    XLSX.utils.book_append_sheet(wb, wsBudget, 'План vs Факт');
    XLSX.utils.book_append_sheet(wb, wsTx, 'Реестр Транзакций');

    const fileName = `MIRRORS_Finance_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast(`📥 Файл ${fileName} успешно сохранен!`);
  });

  // Excel Import
  fileImportInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        
        let sheetName = wb.SheetNames.find(n => n.includes('Транзакци') || n.includes('Sheet1')) || wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws);

        let importedCount = 0;
        rows.forEach(r => {
          const date = r['Дата'] || r['Date'] || new Date().toISOString().split('T')[0];
          let type = r['Тип'] || r['Type'] || 'Расход';
          // Поддержка формата овнера: out → Расход, in → Доход
          if (type.toLowerCase() === 'out' || type.toLowerCase() === 'расход') type = 'Расход';
          else if (type.toLowerCase() === 'in' || type.toLowerCase() === 'доход') type = 'Доход';

          let category = r['Категория'] || r['Category'] || 'Прочие операционные расходы';
          // Маппинг английских категорий овнера на русские
          const catMap = {
            'operations': 'Прочие операционные расходы',
            'traffic': 'Трафик: Reddit & Dating Apps',
            'traffic reddit': 'Трафик: Reddit & Dating Apps',
            'traffic tiktok': 'Трафик: TikTok / Reels / Shorts',
            'traffic twitter': 'Трафик: Twitter / X Promo',
            'chatters': 'Зарплаты: Чаттеры / Операторы',
            'salaries': 'Зарплаты: Тимлиды / Баеры',
            'model share': 'Выплаты моделям (Model Share %)',
            'software': 'Софт: Infloww / CreatorHero / CRM',
            'infra': 'Инфраструктура: Прокси, Dolphin, SIM',
            'commissions': 'Комиссии: Платежки / Paxum / Вывод',
            'payout': 'OnlyFans Payouts (Выплаты платформы)',
            'tips': 'Чаевые (Tips) & Кастомы',
            'ppv': 'Платные сообщения (PPV / Chatting)',
            'income': 'OnlyFans Payouts (Выплаты платформы)'
          };
          const catLower = category.toLowerCase().trim();
          if (catMap[catLower]) {
            category = catMap[catLower];
          }

          const amount = parseFloat(r['Сумма ($)'] || r['Сумма'] || r['Amount'] || 0);
          const model = r['Модель/Проект'] || r['Модель'] || r['Проект'] || r['Model'] || r['Project'] || 'Agency Core (Общие)';
          const desc = r['Комментарий'] || r['Описание'] || r['Description'] || '';

          if (amount > 0) {
            manager.addTransaction({ date, type, category, amount, model, desc });
            importedCount++;
          }
        });

        renderAll();
        showToast(`✅ Успешно импортировано ${importedCount} операций из Excel!`);
      } catch (err) {
        alert('Ошибка при чтении Excel: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  });

  // Reset Cash (Clear all data)
  btnReset?.addEventListener('click', () => {
    const confirmation = confirm('⚠️ Внимание! Вы уверены, что хотите полностью ОБНУЛИТЬ кассу?\n\nВсе финансовые операции будут удалены, а баланс станет $0.00.\n(Это действие нельзя отменить)');
    if (confirmation) {
      manager.resetAll();
      renderAll();
      showToast('🔄 Касса успешно обнулена! Баланс: $0.00');
    }
  });

  // Clean Duplicates
  const btnCleanDuplicates = document.getElementById('btn-fin-clean-duplicates');
  btnCleanDuplicates?.addEventListener('click', () => {
    if (confirm('🧹 Удалить все повторяющиеся строки-дубликаты в реестре и таблице Google?')) {
      lastSyncTime = Date.now() + 15000;
      const removed = manager.cleanDuplicates();
      renderAll();
      showToast(`🧹 Удалено дубликатов: ${removed}`);
    }
  });

  function renderKPIs(metrics, cashBalance = 0, escrowData = null, totalContractorsRemaining = 0) {
    const elCash = document.getElementById('fin-kpi-cash-balance');
    const elSafeCash = document.getElementById('fin-kpi-safe-cash');
    const elSafeCashSub = document.getElementById('fin-kpi-safe-cash-sub');
    const elEscrow = document.getElementById('fin-kpi-escrow');
    const elEscrowSub = document.getElementById('fin-kpi-escrow-sub');
    const elRev = document.getElementById('fin-kpi-rev');
    const elFees = document.getElementById('fin-kpi-fees');
    const elFeesSub = document.getElementById('fin-kpi-fees-sub');
    const elNet = document.getElementById('fin-kpi-net');
    const elMargin = document.getElementById('fin-kpi-margin');

    // 1. Физическая касса (на руках)
    if (elCash) {
      elCash.textContent = `$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      elCash.style.color = cashBalance >= 0 ? '#34d399' : 'var(--accent-rose)';
    }

    // 2. Зарплатный резерв (Эскроу к 31-му и к 15-му)
    const escrowDue = escrowData ? escrowData.totalEscrowRemaining : 0;
    const p1Due = escrowData ? escrowData.p1Remaining : 0;
    const p2Due = escrowData ? escrowData.p2Remaining : 0;

    if (elEscrow) {
      elEscrow.textContent = `$${escrowDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      elEscrow.style.color = escrowDue > 0 ? '#fbbf24' : 'var(--accent-green)';
    }
    if (elEscrowSub) {
      elEscrowSub.textContent = `К 31-му: $${Math.round(p1Due).toLocaleString()} | К 15-му: $${Math.round(p2Due).toLocaleString()}`;
    }

    // 3. Свободная касса овнера (Safe Cash)
    const contractorsDue = totalContractorsRemaining || 0;
    const safeCash = cashBalance - escrowDue - contractorsDue;
    if (elSafeCash) {
      elSafeCash.textContent = `$${safeCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      elSafeCash.style.color = safeCash >= 0 ? '#34d399' : 'var(--accent-rose)';
    }
    if (elSafeCashSub) {
      elSafeCashSub.textContent = safeCash >= 0 
        ? 'Доступно к выводу без риска разрыва' 
        : `Дефицит -$${Math.abs(Math.round(safeCash)).toLocaleString()}! Не выводить дивиденды`;
      elSafeCashSub.style.color = safeCash >= 0 ? 'var(--text-muted)' : 'var(--accent-rose)';
    }

    // 4. Выручка Net OnlyFans
    if (elRev) elRev.textContent = `$${metrics.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 5. Комиссии вывода & обнала
    if (elFees) {
      elFees.textContent = `$${metrics.withdrawalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (elFeesSub) {
      elFeesSub.textContent = `Paxum / P2P | Эфф. комса: ${metrics.effectiveFeePct.toFixed(1)}%`;
    }

    // 6. Чистая прибыль агентства
    if (elNet) {
      elNet.textContent = `$${metrics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      elNet.style.color = metrics.netProfit >= 0 ? 'var(--primary)' : 'var(--accent-rose)';
    }

    if (elMargin) {
      elMargin.textContent = `${metrics.netMargin.toFixed(1)}%`;
      elMargin.style.color = metrics.netMargin >= 30 ? 'var(--accent-green)' : (metrics.netMargin > 0 ? 'var(--accent-amber)' : 'var(--accent-rose)');
    }
  }

  function renderBudgets(budgets) {
    const container = document.getElementById('fin-budgets-list');
    if (!container) return;

    container.innerHTML = budgets.map(b => {
      const isOver = b.remaining < 0;
      const statusColor = isOver ? 'var(--accent-rose)' : (b.pct > 85 ? 'var(--accent-amber)' : 'var(--accent-green)');
      const badgeText = isOver ? `🔴 Перерасход $${Math.abs(b.remaining).toLocaleString()}` : `🟢 Доступно $${b.remaining.toLocaleString()}`;
      const progressWidth = Math.min(b.pct, 100);

      return `
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px 18px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-weight: 700; font-size: 14px; color: var(--text-main);">${b.group}</span>
              <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: ${isOver ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.15)'}; color: ${statusColor}; border: 1px solid ${statusColor};">
                ${badgeText}
              </span>
            </div>
            <div style="font-size: 13px; font-family: var(--font-mono); color: var(--text-muted);">
              Факт: <strong style="color: var(--text-main);">$${b.fact.toLocaleString()}</strong> / План: <strong style="color: var(--primary);">$${b.plan.toLocaleString()}</strong>
              (<span style="color: ${statusColor}; font-weight: 700;">${b.pct.toFixed(1)}%</span>)
            </div>
          </div>
          <div style="height: 7px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; position: relative;">
            <div style="width: ${progressWidth}%; height: 100%; background: ${statusColor}; border-radius: 4px; transition: width 0.4s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderUnitEconomics(txs) {
    const tbody = document.getElementById('fin-tbody-unit-economics');
    if (!tbody) return;

    const stats = {};
    FINANCE_MODELS.forEach(m => {
      stats[m] = { income: 0, traffic: 0, chatters: 0, payouts: 0, opex: 0 };
    });

    txs.forEach(t => {
      if (!stats[t.model]) {
        stats[t.model] = { income: 0, traffic: 0, chatters: 0, payouts: 0, opex: 0 };
      }
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        stats[t.model].income += amt;
      } else {
        if (t.category.startsWith('Трафик')) {
          stats[t.model].traffic += amt;
        } else if (t.category.includes('Чаттеры') || t.category.includes('Операторы')) {
          stats[t.model].chatters += amt;
        } else if (t.category.includes('Выплаты моделям')) {
          stats[t.model].payouts += amt;
        } else {
          stats[t.model].opex += amt;
        }
      }
    });

    tbody.innerHTML = Object.entries(stats).map(([model, data]) => {
      const net = data.income - (data.traffic + data.chatters + data.payouts + data.opex);
      const margin = data.income > 0 ? (net / data.income) * 100 : 0;
      const netColor = net >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)';

      return `
        <tr>
          <td style="font-weight: 700; color: var(--text-main);">${model}</td>
          <td style="font-family: var(--font-mono); color: var(--accent-green);">$${data.income.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); color: var(--accent-rose);">$${data.traffic.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); color: #38bdf8;">$${data.chatters.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); color: #fbbf24;">$${data.payouts.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); color: var(--text-muted);">$${data.opex.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${netColor};">$${net.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${margin >= 30 ? 'var(--accent-green)' : (margin > 0 ? 'var(--accent-amber)' : 'var(--accent-rose)')};">${margin.toFixed(1)}%</td>
        </tr>
      `;
    }).join('');
  }

  function renderTransactionsTable(txs) {
    const tbody = document.getElementById('fin-tbody-transactions');
    const countBadge = document.getElementById('fin-tx-count-badge');
    if (countBadge) countBadge.textContent = `${txs.length} записей`;
    if (!tbody) return;

    if (txs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-dim);">Операций за выбранный период не найдено</td></tr>`;
      return;
    }

    tbody.innerHTML = txs.map(t => {
      const isInc = t.type === 'Доход';
      const badgeStyle = isInc ? 'background: rgba(52, 211, 153, 0.15); color: var(--accent-green);' : 'background: rgba(248, 113, 113, 0.15); color: var(--accent-rose);';

      return `
        <tr>
          <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">${t.date}</td>
          <td><span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; ${badgeStyle}">${t.type}</span></td>
          <td style="font-weight: 600; font-size: 13px;">${t.category}</td>
          <td style="font-size: 12px; color: var(--primary);">${t.model}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${isInc ? 'var(--accent-green)' : 'var(--text-main)'};">$${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-size: 12px; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.desc || '—'}</td>
          <td style="text-align: right;">
            <button class="btn-delete-tx" data-id="${t.id}" style="background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 14px;" title="Удалить">🗑</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const tx = manager.transactions.find(t => String(t.id) === String(id));
        const txTitle = tx ? `${tx.type} $${Number(tx.amount).toLocaleString()} (${tx.model})` : 'эту операцию';
        if (confirm(`Удалить ${txTitle}?\n(Если в таблице есть повторяющиеся дубликаты, они будут удалены вместе с ней)`)) {
          lastSyncTime = Date.now() + 15000; // Пауза автосинхронизации на 15 сек, чтобы дать Sheets удалить строку
          manager.deleteTransaction(id, true);
          renderAll();
          showToast('🗑 Операция удалена');
        }
      });
    });
  }

  function renderCharts(txs) {
    const timelineContainer = document.getElementById('fin-chart-timeline');
    const donutContainer = document.getElementById('fin-chart-donut');

    // Monthly Dynamics SVG Bar & Line Chart
    if (timelineContainer) {
      const months = ['2026-09', '2026-10', '2026-11'];
      const dataByMonth = months.map(m => {
        const mList = manager.transactions.filter(t => t.date.startsWith(m));
        const inc = mList.filter(t => t.type === 'Доход').reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const exp = mList.filter(t => t.type === 'Расход').reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const net = inc - exp;
        return { month: m, inc, exp, net };
      });

      const maxVal = Math.max(...dataByMonth.map(d => Math.max(d.inc, d.exp)), 30000);

      timelineContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 180px; padding-top: 20px; border-bottom: 1px solid var(--border-color); gap: 20px;">
          ${dataByMonth.map(d => {
            const incH = Math.round((d.inc / maxVal) * 140);
            const expH = Math.round((d.exp / maxVal) * 140);
            const netColor = d.net >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)';

            return `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: ${netColor};">
                  Net: $${Math.round(d.net / 1000)}k
                </div>
                <div style="display: flex; gap: 6px; align-items: flex-end; height: 140px; width: 100%; justify-content: center;">
                  <div style="width: 24px; height: ${incH}px; background: var(--accent-green); border-radius: 4px 4px 0 0;" title="Доход: $${d.inc.toLocaleString()}"></div>
                  <div style="width: 24px; height: ${expH}px; background: var(--accent-rose); border-radius: 4px 4px 0 0;" title="Расход: $${d.exp.toLocaleString()}"></div>
                </div>
                <div style="font-size: 12px; font-family: var(--font-mono); color: var(--text-muted);">${d.month}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 12px; font-size: 12px; color: var(--text-muted);">
          <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: var(--accent-green); border-radius: 2px;"></span> Выручка</span>
          <span style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: var(--accent-rose); border-radius: 2px;"></span> Расходы</span>
        </div>
      `;
    }

    // Expense Breakdown
    if (donutContainer) {
      const expenses = txs.filter(t => t.type === 'Расход');
      const catTotals = {};
      let totalExp = 0;
      expenses.forEach(e => {
        const cat = e.category;
        catTotals[cat] = (catTotals[cat] || 0) + Number(e.amount);
        totalExp += Number(e.amount);
      });

      const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

      donutContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px 0;">
          ${sortedCats.slice(0, 5).map(([cat, val], idx) => {
            const pct = totalExp > 0 ? (val / totalExp * 100).toFixed(1) : 0;
            const colors = ['#38bdf8', '#f87171', '#fbbf24', '#34d399', '#c084fc'];
            const c = colors[idx % colors.length];

            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                  <span style="color: var(--text-main); font-weight: 500;">${cat}</span>
                  <span style="font-family: var(--font-mono); color: var(--text-muted);">$${val.toLocaleString()} (${pct}%)</span>
                </div>
                <div style="height: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: ${c}; border-radius: 3px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }

  function renderContractorsRunway(txs) {
    const container = document.getElementById('fin-contractors-runway');
    if (!container) return { totalContractorsRemaining: 0 };

    let totalContractorsRemaining = 0;

    container.innerHTML = CONTRACTOR_SCHEDULE.map(c => {
      // Ищем все выплаты этому подрядчику за текущий выбранный период
      const matchingTxs = (txs || []).filter(t => {
        if (t.type !== 'Расход') return false;
        const desc = (t.desc || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();
        return (c.keywords || []).some(k => desc.includes(k) || cat.includes(k));
      });

      const paidSoFar = matchingTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const remaining = Math.max(0, c.defaultAmount - paidSoFar);
      totalContractorsRemaining += remaining;

      const pct = c.defaultAmount > 0 ? Math.min(100, Math.round((paidSoFar / c.defaultAmount) * 100)) : 0;

      let statusBadge = '';
      let statusColor = '';
      let nextActionLabel = '';
      let suggestAmount = c.defaultAmount;

      if (paidSoFar >= c.defaultAmount) {
        statusColor = 'var(--accent-green)';
        statusBadge = `🟢 Оплачено 100% ($${paidSoFar} / $${c.defaultAmount})`;
        nextActionLabel = '✓ Оплачено (добавить еще)';
        suggestAmount = c.installmentAmount || c.defaultAmount;
      } else if (paidSoFar > 0) {
        statusColor = 'var(--accent-amber)';
        statusBadge = `🟡 Оплачена 1-я часть ($${paidSoFar} из $${c.defaultAmount})`;
        nextActionLabel = `⚡ Доплатить 2-ю часть ($${remaining})`;
        suggestAmount = remaining;
      } else {
        statusColor = 'var(--accent-rose)';
        statusBadge = `🔴 Не оплачено ($0 / $${c.defaultAmount})`;
        nextActionLabel = (c.installments === 2) ? `⚡ Оплатить 1-ю часть ($${c.installmentAmount})` : `⚡ Оплатить ($${c.defaultAmount})`;
        suggestAmount = (c.installments === 2) ? c.installmentAmount : c.defaultAmount;
      }

      return `
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px 16px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; font-size: 14px; color: var(--text-main);">${c.name}</span>
              <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; background: rgba(255, 255, 255, 0.06); color: ${c.urgencyColor}; border: 1px solid ${c.urgencyColor};">
                ${c.urgencyBadge}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: var(--font-mono); font-weight: 700; font-size: 11px; padding: 3px 8px; border-radius: 8px; background: rgba(255, 255, 255, 0.04); color: ${statusColor}; border: 1px solid ${statusColor};">
                ${statusBadge}
              </span>
              <button class="btn-action btn-primary btn-pay-contractor" data-id="${c.id}" data-suggest="${suggestAmount}" style="padding: 4px 10px; font-size: 11px; white-space: nowrap;">
                ${nextActionLabel}
              </button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="height: 5px; background: rgba(255, 255, 255, 0.06); border-radius: 3px; overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; background: ${statusColor}; border-radius: 3px; transition: width 0.3s ease;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); flex-wrap: wrap; gap: 6px;">
            <span><strong>Условия:</strong> ${c.terms}</span>
            <span style="font-family: var(--font-mono);">
              ${remaining > 0 ? `<strong style="color: ${statusColor};">Остаток к доплате: $${remaining}</strong>` : `<strong style="color: var(--accent-green);">Месяц закрыт ✓</strong>`}
            </span>
          </div>

          <div style="font-size: 11px; color: ${c.urgencyColor}; line-height: 1.3; background: rgba(0, 0, 0, 0.2); padding: 4px 8px; border-radius: 4px;">
            ${c.warning}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-pay-contractor').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const suggest = btn.dataset.suggest || 175;
        const c = CONTRACTOR_SCHEDULE.find(item => item.id === id);
        if (!c) return;

        const inputVal = prompt(`Внести выплату для ${c.name}\nУкажите сумму ($):`, suggest);
        if (inputVal && parseFloat(inputVal) > 0) {
          const amt = parseFloat(inputVal);
          manager.addTransaction({
            date: new Date().toISOString().split('T')[0],
            type: 'Расход',
            category: c.category,
            amount: amt,
            model: c.model,
            desc: `Выплата: ${c.name} (${amt >= c.defaultAmount ? 'Полная оплата' : 'Транш/Аванс'})`
          });
          renderAll();
          showToast(`✅ Выплата ${c.name} ($${amt}) внесена в расход!`);
        }
      });
    });

    return { totalContractorsRemaining };
  }

  let userOverrodePayout = false;

  function renderRunwayAlert(cashBalance, escrowData, totalContractorsRemaining) {
    const alertContainer = document.getElementById('fin-runway-alert');
    if (!alertContainer) return;

    // Реальный остаток к выплате подрядчикам с учетом уже внесенных авансов/траншей
    const contractorsDue = totalContractorsRemaining !== undefined ? totalContractorsRemaining : 0;
    const p1Due = escrowData ? (escrowData.p1Remaining !== undefined ? escrowData.p1Remaining : 0) : 0;
    const p2Due = escrowData ? (escrowData.p2Remaining !== undefined ? escrowData.p2Remaining : 0) : 0;
    const totalEscrow = escrowData 
      ? (escrowData.totalEscrowRemaining !== undefined ? escrowData.totalEscrowRemaining : ((escrowData.modelsRemaining || 0) + (escrowData.chattersRemaining || 0))) 
      : 0;
    const totalObligations = contractorsDue + totalEscrow;
    const safeCash = cashBalance - totalObligations;

    if (safeCash >= 0) {
      alertContainer.innerHTML = `
        <div style="background: rgba(52, 211, 153, 0.08); border: 1px solid var(--accent-green); border-radius: var(--radius-sm); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🟢</span>
            <div>
              <div style="font-weight: 700; color: var(--accent-green); font-size: 14px;">Безопасный Runway: Касса полностью покрывает все зарплаты и обязательства</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                В кассе: <strong style="color: var(--text-main);">$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> | 
                Резерв к 31-му: <strong style="color: #fbbf24;">$${Math.round(p1Due).toLocaleString()}</strong> | 
                Резерв к 15-му: <strong style="color: #fbbf24;">$${Math.round(p2Due).toLocaleString()}</strong> | 
                Подрядчики: <strong style="color: var(--primary);">$${contractorsDue.toLocaleString()}</strong>
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-weight: 800; font-size: 16px; color: var(--accent-green);">
              Свободная касса: +$${safeCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Доступно к выводу овнером без риска разрыва</div>
          </div>
        </div>
      `;
    } else {
      alertContainer.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--accent-rose); border-radius: var(--radius-sm); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🚨</span>
            <div>
              <div style="font-weight: 700; color: var(--accent-rose); font-size: 14px;">Внимание: Риск кассового разрыва перед ближайшими выплатами!</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                В кассе: <strong style="color: var(--text-main);">$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> | 
                Обязательства к выплате: <strong style="color: var(--accent-rose);">$${totalObligations.toLocaleString()}</strong> 
                (Резерв зарплат: $${totalEscrow.toLocaleString()} [к 31-му: $${Math.round(p1Due).toLocaleString()}, к 15-му: $${Math.round(p2Due).toLocaleString()}], Подрядчики: $${contractorsDue.toLocaleString()})
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-weight: 800; font-size: 16px; color: var(--accent-rose);">
              Дефицит: -$${Math.abs(safeCash).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Не выводите дивиденды до закрытия выплат!</div>
          </div>
        </div>
      `;
    }
  }

  // Google Sheets UI & Sync handlers
  function updateGsheetUI() {
    const savedUrl = manager.loadGSheetUrl();
    if (inputGsheetUrl) inputGsheetUrl.value = savedUrl;
    if (savedUrl) {
      if (badgeGsheet) {
        badgeGsheet.textContent = `🟢 Подключено (${manager.transactions.length} записей)`;
        badgeGsheet.style.background = 'rgba(52, 211, 153, 0.15)';
        badgeGsheet.style.color = 'var(--accent-green)';
        badgeGsheet.style.border = '1px solid var(--accent-green)';
      }
      if (btnGsheetDisconnect) btnGsheetDisconnect.style.display = 'inline-block';
      if (btnToggleGsheet) btnToggleGsheet.style.borderColor = 'var(--accent-green)';
    } else {
      if (badgeGsheet) {
        badgeGsheet.textContent = '⚪ Не подключено (Локальный режим)';
        badgeGsheet.style.background = 'rgba(255, 255, 255, 0.08)';
        badgeGsheet.style.color = 'var(--text-muted)';
        badgeGsheet.style.border = 'none';
      }
      if (btnGsheetDisconnect) btnGsheetDisconnect.style.display = 'none';
      if (btnToggleGsheet) btnToggleGsheet.style.borderColor = 'var(--primary)';
    }
  }

  btnToggleGsheet?.addEventListener('click', () => {
    if (gsheetPanel) {
      const isVisible = gsheetPanel.style.display === 'block';
      gsheetPanel.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) updateGsheetUI();
    }
  });

  btnCloseGsheet?.addEventListener('click', () => {
    if (gsheetPanel) gsheetPanel.style.display = 'none';
  });

  btnGsheetSaveSync?.addEventListener('click', async () => {
    const url = inputGsheetUrl?.value.trim();
    if (!url) {
      alert('Пожалуйста, вставьте URL развернутого веб-приложения Google Apps Script.');
      return;
    }
    btnGsheetSaveSync.textContent = '⏳ Синхронизация...';
    btnGsheetSaveSync.disabled = true;

    manager.saveGSheetUrl(url);
    const result = await manager.syncWithGoogleSheets(url);

    btnGsheetSaveSync.textContent = '🔄 Синхронизировать';
    btnGsheetSaveSync.disabled = false;

    if (result.success) {
      renderAll();
      updateGsheetUI();
      showToast(`☁️ Синхронизировано ${result.count} операций из Google Таблицы!`);
    } else {
      alert(`Ошибка синхронизации: ${result.message}\n\nУбедитесь, что веб-приложение Google Apps Script развернуто с доступом "Anyone" (Все).`);
    }
  });

  btnGsheetDisconnect?.addEventListener('click', () => {
    if (confirm('Отключить синхронизацию с Google Sheets? (Данные в таблице останутся сохранены)')) {
      manager.saveGSheetUrl('');
      updateGsheetUI();
      showToast('Синхронизация отключена (локальный режим)');
    }
  });

  function renderAll() {
    const txs = manager.getFiltered();
    const metrics = manager.calculateMetrics(txs);
    const budgets = manager.calculateBudgetsProgress(txs);
    const cashBalance = manager.calculateCashBalance();
    const escrowData = manager.calculatePayrollEscrow(txs);

    // Подрядчики: расчет статуса оплат (100% / 50% / 0%)
    const contractorsStatus = renderContractorsRunway(txs);

    renderKPIs(metrics, cashBalance, escrowData, contractorsStatus?.totalContractorsRemaining);
    renderBudgets(budgets);
    renderUnitEconomics(txs);
    renderTransactionsTable(txs);
    renderCharts(txs);
    
    // Показ индикатора кассового разрыва и безопасного Runway
    renderRunwayAlert(cashBalance, escrowData, contractorsStatus?.totalContractorsRemaining);
  }

  // Initial Run
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('finance-tx-date');
  if (dateInput) dateInput.value = today;

  updateGsheetUI();
  renderAll();

  // Принудительное удаление цикличной 100k транзы из Google Sheets при старте
  const currentGsheetUrl = manager.loadGSheetUrl();
  if (currentGsheetUrl) {
    try {
      fetch(currentGsheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteBuggy100k' })
      }).catch(() => {});
    } catch (e) {}
  }

  // Автосинхронизация при старте, если URL был сохранен ранее
  if (manager.loadGSheetUrl()) {
    manager.syncWithGoogleSheets().then(res => {
      if (res.success) {
        renderAll();
        updateGsheetUI();
      }
    });
  }

  // 🔄 Live Auto-Sync: автоматическое обновление при переключении на вкладку
  async function triggerAutoSync() {
    const now = Date.now();
    if (now - lastSyncTime < 15000) return; // Не чаще чем раз в 15 секунд
    if (manager.loadGSheetUrl()) {
      lastSyncTime = now;
      const res = await manager.syncWithGoogleSheets();
      if (res.success) {
        renderAll();
        updateGsheetUI();
      }
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      triggerAutoSync();
    }
  });
  window.addEventListener('focus', triggerAutoSync);
  setInterval(triggerAutoSync, 90000); // Регулярный поллинг каждые 90 секунд
}
