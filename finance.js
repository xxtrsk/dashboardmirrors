// MIRRORS Financial P&L Engine & Budgeting System (Plan vs Fact)
// Compatible with Vercel Static Hosting & Client-side XLSX export/import
const initialModelWeekly = [];
const initialChatterWeekly = [];

const STORAGE_KEY_TX = 'mirrors_finance_transactions_v4';
const STORAGE_KEY_BUDGET = 'mirrors_finance_budgets_v4';
const STORAGE_KEY_GSHEET_URL = 'mirrors_finance_gsheet_url_v1';
const STORAGE_KEY_DELETED = 'mirrors_deleted_tx_signatures_v1';
const STORAGE_KEY_ACTUAL_WALLET = 'mirrors_actual_usdt_wallet_v4';
const STORAGE_KEY_IN_TRANSIT = 'mirrors_in_transit_amount_v4';

export const DEFAULT_GSHEET_URL = 'https://script.google.com/macros/s/AKfycbxoYKuPxOrq_L4LsoUrQCStPnzv3XqQpgLCjf7ICmoa103pSThavtHVPBihTbiFo8FA6Q/exec';

export const FINANCE_INCOME_CATS = [
  'Выплаты OnlyFans',
  'Вывод в пути (Транзит Paxum / OF)',
  'Прочий доход'
];

export const FINANCE_EXPENSE_CATS = [
  'Трафик: OFTV',
  'Трафик: Reddit',
  'Трафик: Twitter',
  'Выплаты: PayPal',
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
    role: 'Сценарии, монтаж, выгрузка контента на OFTV для Lollysunnery',
    terms: '350 USDT / месяц (4 сценария). Аванс 175$ в начале + 175$ закрытие в конце (Lollysunnery)',
    dueDateStr: '2-е число (175$) и 31-е (175$)',
    defaultAmount: 350,
    installments: 2,
    installmentAmount: 175,
    keywords: ['оскар', 'osckelly', 'oftv'],
    model: 'Lolly (Lollysunnery)',
    category: 'Трафик: OFTV',
    warning: '⚠️ Проверить отгрузку сценариев перед выплатой 2-й части (175 USDT)!',
    urgencyColor: 'var(--accent-amber)',
    urgencyBadge: '2 транша (175 + 175)'
  },
  {
    id: 'aneskagency',
    name: '@aneskagency (Анастасия) — FYP',
    role: 'FYP продвижение и закупка трафика для Fansly (Eva Pinky)',
    terms: '250 USDT / месяц на анкету Fansly. Выплата 2 раза в месяц (по 125$ каждые 2 недели)',
    dueDateStr: 'Каждые 2 недели вперед (по 125$)',
    defaultAmount: 250,
    installments: 2,
    installmentAmount: 125,
    keywords: ['анастасия', 'aneskagency', 'fyp', 'фуп'],
    model: 'Eva Pinky (Fansly)',
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
    role: 'SFS трафик (0.4$ / фанат) постфактум на страницах 1lollyhere и Eva Blush',
    terms: '0.4$ / фанат постфактум на 1lollyhere и Eva Blush. Оплата 1-5 числа по сверке',
    dueDateStr: '1–5 числа месяца',
    defaultAmount: 580,
    installments: 1,
    installmentAmount: 580,
    keywords: ['леон', 'killerle0n', 'sfs', 'сфс'],
    model: 'Eva Blush',
    category: 'Трафик: Twitter',
    warning: '🟢 Оплата по сверке после первого понедельничного вывода OF (1lolly & Eva Blush).',
    urgencyColor: 'var(--accent-green)',
    urgencyBadge: 'По сверке (1–5 число)'
  },
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
    // Удаленная анкета Polina
    if (t.model && t.model.toLowerCase().includes('polina')) return true;

    // 2. Черный список ранее удаленных операций
    const sig = `${t.date}_${t.type}_${t.category}_${t.model}_${amt.toFixed(2)}_${(t.desc || '').trim()}`;
    if (this.deletedSignatures && this.deletedSignatures.has(sig)) return true;

    return false;
  }

  loadTransactions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TX);
      if (stored !== null) {
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
      const stored = localStorage.getItem(STORAGE_KEY_GSHEET_URL);
      if (stored && stored.trim() !== '') return stored.trim();
      return DEFAULT_GSHEET_URL;
    } catch (e) {
      return DEFAULT_GSHEET_URL;
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
      localStorage.removeItem(STORAGE_KEY_ACTUAL_WALLET);
      localStorage.removeItem(STORAGE_KEY_IN_TRANSIT);
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([]));
    } catch (e) {
      console.warn('Reset failed:', e);
    }
  }

  calculateMetrics(txList = this.getFiltered()) {
    let income = 0;
    let cashExpenses = 0;
    let trafficExpense = 0;
    let chatterExpense = 0;
    let modelPayouts = 0;
    let withdrawalFees = 0;
    let otherOpex = 0;

    txList.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        income += amt;
      } else if (t.type === 'Расход') {
        cashExpenses += amt;
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
        } else {
          otherOpex += amt;
        }
      }
    });

    // P&L Accrual (Экономическая прибыль): себестоимость команды 45% (25% модель + 20% чаттеры)
    // зафиксирована сразу, чтобы фактические выплаты на 31-е и 15-е число НЕ задваивали расход!
    const modelsAccrued = income * 0.25;
    const chattersAccrued = income * 0.20;
    const economicOpex = modelsAccrued + chattersAccrued + trafficExpense + withdrawalFees + otherOpex;
    const netProfit = income - economicOpex;
    const netMargin = income > 0 ? (netProfit / income) * 100 : 0;
    const roas = trafficExpense > 0 ? (income / trafficExpense) : 0;
    const effectiveFeePct = income > 0 ? (withdrawalFees / income) * 100 : 0;

    return { 
      income, 
      expense: economicOpex, 
      cashExpenses, 
      netProfit, 
      netMargin, 
      trafficExpense, 
      chatterExpense, 
      modelsAccrued, 
      chattersAccrued, 
      modelPayouts, 
      withdrawalFees, 
      effectiveFeePct, 
      roas 
    };
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

    // Расчет начислений: для Eva Pinky (Fansly) отдельный процент модели (30%), для остальных 25%
    let p1ModelsDue = 0;
    let p2ModelsDue = 0;
    txList.forEach(t => {
      if (t.type === 'Доход') {
        const amt = Number(t.amount) || 0;
        const day = parseInt((t.date || '').split('-')[2], 10) || 1;
        const isFansly = (t.model || '').toLowerCase().includes('fansly') || (t.desc || '').toLowerCase().includes('fansly');
        const modelPct = isFansly ? 0.30 : 0.25;
        if (day <= 15) {
          p1ModelsDue += amt * modelPct;
        } else {
          p2ModelsDue += amt * modelPct;
        }
      }
    });

    const p1ChattersDue = p1Income * 0.20;
    const p1TotalDue = p1ModelsDue + p1ChattersDue;

    const p2ChattersDue = p2Income * 0.20;
    const p2TotalDue = p2ModelsDue + p2ChattersDue;

    // Списание выплат: сначала гасим обязательства Периода 1, затем Периода 2
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

    // Резерв обязательств к выплате
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

  // 1. Сверка кассы: приходы vs расходы = расчетный остаток vs фактический остаток
  calculateCashReconciliation(txList = this.getFiltered(), totalCashBalance = this.calculateCashBalance(), contractorsRemaining = 0, escrowRemaining = 0) {
    let inflow = 0;
    let outflow = 0;
    let ofInflow = 0;
    let otherInflow = 0;

    let trafficOutflow = 0;
    let payrollOutflow = 0;
    let softOutflow = 0;
    let feeOutflow = 0;
    let otherOutflow = 0;

    txList.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        inflow += amt;
        const cat = (t.category || '').toLowerCase();
        if (cat.includes('onlyfans') || cat.includes('fansly') || cat.includes('выплаты')) {
          ofInflow += amt;
        } else {
          otherInflow += amt;
        }
      } else if (t.type === 'Расход') {
        outflow += amt;
        const cat = (t.category || '').toLowerCase();
        if (cat.startsWith('трафик')) trafficOutflow += amt;
        else if (cat.startsWith('зарплаты') || cat.includes('модел') || cat.includes('чаттер')) payrollOutflow += amt;
        else if (cat.includes('софт') || cat.includes('monster') || cat.includes('монстр')) softOutflow += amt;
        else if (cat.includes('комисси') || cat.includes('вывод')) feeOutflow += amt;
        else otherOutflow += amt;
      }
    });

    const netPeriodCashflow = inflow - outflow;
    const expectedCashBalance = this.calculateCashBalance();
    const actualCashBalance = totalCashBalance;
    const delta = actualCashBalance - expectedCashBalance;
    const isBalanced = Math.abs(delta) < 0.05;

    const totalObligations = Number(contractorsRemaining) || 0;
    const safeCash = Math.max(0, actualCashBalance - totalObligations);

    return {
      inflow,
      ofInflow,
      otherInflow,
      outflow,
      trafficOutflow,
      payrollOutflow,
      softOutflow,
      feeOutflow,
      otherOutflow,
      netPeriodCashflow,
      expectedCashBalance,
      actualCashBalance,
      delta,
      isBalanced,
      totalObligations,
      contractorsRemaining,
      escrowRemaining,
      safeCash
    };
  }

  // 2. Сверка выручки и выплат по анкетам за выбранный период (CRM vs Выводы)
  calculateModelEarningsReconciliation(selectedPeriod = this.selectedPeriod, txList = this.getFiltered()) {
    const targetModels = [
      { id: 'sunnery', name: 'Lolly (Lollysunnery)', shortName: 'Lollysunnery', matchKeys: ['sunnery', 'lollysunnery', '39856'] },
      { id: 'blush', name: 'Eva Blush', shortName: 'Eva Blush', matchKeys: ['blush', 'eva blush', '48123'] },
      { id: '1lolly', name: 'Lolly (1lollyhere)', shortName: '1lollyhere', matchKeys: ['1lolly', '1lollyhere', '47892'] },
      { id: 'fansly', name: 'Eva Pinky (Fansly)', shortName: 'Eva Fansly', matchKeys: ['fansly', 'eva pinky'] },
      { id: 'lila', name: 'Lila (angelkiss)', shortName: 'Lila', matchKeys: ['lila', 'angelkiss', '49015'] }
    ];

    const crmRows = (initialModelWeekly || []).filter(r => {
      if (selectedPeriod === 'all') return true;
      return r.monthKey === selectedPeriod;
    });

    const paypalByMonthAndModel = {
      '2026-10': {
        'Lolly (Lollysunnery)': 987.63,
        'Eva Blush': 155.00,
        'Lolly (1lollyhere)': 91.61
      }
    };

    let totalGrossAll = 0;
    let totalNetAll = 0;
    let totalPaypalAll = 0;
    let totalEarnedAll = 0;
    let totalWithdrawnAll = 0;
    let totalHoldAll = 0;

    const modelsData = targetModels.map(m => {
      let grossRev = 0;
      let ppRev = 0;

      if (selectedPeriod === '2026-10') {
        if (m.id === 'sunnery') { grossRev = 7832.32; ppRev = 987.63; }
        else if (m.id === 'blush') { grossRev = 3851.31; ppRev = 155.00; }
        else if (m.id === '1lolly') { grossRev = 2594.03; ppRev = 91.61; }
        else if (m.id === 'fansly') { grossRev = 1645.26; ppRev = 0; }
        else if (m.id === 'lila') { grossRev = 1196.07; ppRev = 0; }
      } else {
        const matchingCrm = crmRows.filter(r => {
          if (r.modelName === m.name) return true;
          const low = (r.modelName || '').toLowerCase();
          return m.matchKeys.some(k => low.includes(k));
        });
        grossRev = matchingCrm.reduce((sum, r) => sum + (Number(r.totalRevenue) || 0), 0);

        if (selectedPeriod === 'all') {
          Object.values(paypalByMonthAndModel).forEach(monthMap => {
            ppRev += monthMap[m.name] || 0;
          });
        } else if (paypalByMonthAndModel[selectedPeriod]) {
          ppRev = paypalByMonthAndModel[selectedPeriod][m.name] || 0;
        }
      }

      const netRev = grossRev * 0.80;
      const totalEarned = netRev + ppRev;

      // Фактически выведено на счета/в кассу в рамках выбранного периода
      const modelIncomeTxs = txList.filter(t => {
        if (t.type !== 'Доход') return false;
        if (t.model === m.name) return true;
        const low = (t.model || '').toLowerCase();
        const descLow = (t.desc || '').toLowerCase();
        return m.matchKeys.some(k => low.includes(k) || descLow.includes(k));
      });
      const withdrawnToCash = modelIncomeTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      totalGrossAll += grossRev;
      totalNetAll += netRev;
      totalPaypalAll += ppRev;
      totalEarnedAll += totalEarned;
      totalWithdrawnAll += withdrawnToCash;

      return {
        ...m,
        grossRev,
        netRev,
        ppRev,
        totalEarned,
        withdrawnToCash,
        sharePct: 0
      };
    });

    // Распределение денег в пути (In-Transit) и остатка на балансе страницы (к следующему выводу)
    const savedInTransit = localStorage.getItem(STORAGE_KEY_IN_TRANSIT);
    const globalTransit = savedInTransit !== null ? parseFloat(savedInTransit) : 0.00;
    const totalRemaining = modelsData.reduce((sum, m) => sum + Math.max(0, m.totalEarned - m.withdrawnToCash), 0);
    let totalTransitAll = 0;

    modelsData.forEach(m => {
      m.sharePct = totalEarnedAll > 0 ? (m.totalEarned / totalEarnedAll) * 100 : 0;
      const rem = Math.max(0, m.totalEarned - m.withdrawnToCash);
      const mTransit = totalRemaining > 0 ? Math.round((rem / totalRemaining) * Math.min(globalTransit, totalRemaining) * 100) / 100 : 0;
      m.inTransit = mTransit;
      m.inHold = Math.max(0, rem - mTransit);
      totalTransitAll += mTransit;
    });

    totalHoldAll = modelsData.reduce((sum, m) => sum + m.inHold, 0);

    return {
      period: selectedPeriod,
      models: modelsData,
      totalGrossAll,
      totalNetAll,
      totalPaypalAll,
      totalEarnedAll,
      totalWithdrawnAll,
      totalTransitAll,
      totalHoldAll
    };
  }

  // 3. Детальный учет и группировка расходов
  calculateDetailedExpenses(txList = this.getFiltered()) {
    const expenseTxs = txList.filter(t => t.type === 'Расход');
    const totalExpenses = expenseTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const groups = {
      traffic: { id: 'traffic', label: '🎯 Трафик & Маркетинг', amount: 0, count: 0, color: '#ec4899' },
      soft: { id: 'soft', label: '🛠 Подрядчики & Софт', amount: 0, count: 0, color: '#38bdf8' },
      payroll: { id: 'payroll', label: '👥 Зарплаты & Команда', amount: 0, count: 0, color: '#a855f7' },
      fees: { id: 'fees', label: '💳 Комиссии & Вывод', amount: 0, count: 0, color: '#f59e0b' },
      other: { id: 'other', label: '📦 Прочие расходы', amount: 0, count: 0, color: '#94a3b8' }
    };

    const detailedMap = {};

    expenseTxs.forEach(t => {
      const amt = Number(t.amount) || 0;
      const cat = t.category || 'Прочие расходы';
      const catLow = cat.toLowerCase();
      const model = t.model || 'Agency Core (Общие)';

      let gKey = 'other';
      if (catLow.startsWith('трафик')) gKey = 'traffic';
      else if (catLow.includes('софт') || catLow.includes('monster') || catLow.includes('монстр') || catLow.includes('подрядчик')) gKey = 'soft';
      else if (catLow.startsWith('зарплаты') || catLow.includes('модел') || catLow.includes('чаттер')) gKey = 'payroll';
      else if (catLow.includes('комисси') || catLow.includes('вывод')) gKey = 'fees';

      groups[gKey].amount += amt;
      groups[gKey].count += 1;

      const detailKey = `${cat}___${model}`;
      if (!detailedMap[detailKey]) {
        detailedMap[detailKey] = {
          category: cat,
          groupKey: gKey,
          model: model,
          amount: 0,
          txCount: 0,
          latestDate: t.date,
          descs: []
        };
      }
      detailedMap[detailKey].amount += amt;
      detailedMap[detailKey].txCount += 1;
      if (t.date > detailedMap[detailKey].latestDate) {
        detailedMap[detailKey].latestDate = t.date;
      }
      if (t.desc && !detailedMap[detailKey].descs.includes(t.desc)) {
        detailedMap[detailKey].descs.push(t.desc);
      }
    });

    const detailedList = Object.values(detailedMap).map(item => ({
      ...item,
      sharePct: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalExpenses,
      groups,
      detailedList
    };
  }

  // 4. Сверка выплат: План vs Факт (Модели, Чаттеры, Агентство)
  calculatePayrollAudit(selectedPeriod = this.selectedPeriod, txList = this.getFiltered()) {
    const modelRec = this.calculateModelEarningsReconciliation(selectedPeriod, txList);

    let totalModelPlanAll = 0;
    let totalModelPaidAll = 0;
    let totalChatterPlanAll = 0;
    let totalChatterPaidAll = 0;
    let totalAgencyShareAll = 0;
    let overpaymentCount = 0;
    let totalOverpaidAmount = 0;

    const modelAuditList = modelRec.models.map(m => {
      const earned = m.totalEarned;
      // Для Eva Pinky (Fansly) отдельный процент модели (30%), для OnlyFans - 25%
      const isFansly = m.name.toLowerCase().includes('fansly') || m.name.toLowerCase().includes('eva pinky');
      const modelPct = isFansly ? 0.30 : 0.25;
      const chatterPct = 0.20;
      const modelPlan = earned * modelPct;
      const chatterPlan = earned * chatterPct;
      // Доля агентства рассчитывается динамически: заработано минус доля модели и чаттеров
      const agencyShare = Math.max(0, earned - modelPlan - chatterPlan);

      const modelPaidTxs = txList.filter(t => {
        if (t.type !== 'Расход') return false;
        const cat = (t.category || '').toLowerCase();
        const desc = (t.desc || '').toLowerCase();
        const isModelCat = cat.includes('модел');
        if (!isModelCat && !desc.includes('выплата модел')) return false;
        if (t.model === m.name) return true;
        const low = (t.model || '').toLowerCase();
        return m.matchKeys.some(k => low.includes(k) || desc.includes(k));
      });
      const modelPaid = modelPaidTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);

      const chatterPaidTxs = txList.filter(t => {
        if (t.type !== 'Расход') return false;
        const cat = (t.category || '').toLowerCase();
        const desc = (t.desc || '').toLowerCase();
        const isChatterCat = cat.includes('чаттер') || cat.includes('зарплат');
        if (!isChatterCat && !desc.includes('чаттер')) return false;
        if (t.model === m.name) return true;
        const low = (t.model || '').toLowerCase();
        return m.matchKeys.some(k => low.includes(k) || desc.includes(k));
      });
      const chatterPaid = chatterPaidTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);

      // 1. Дельта и остаток Модели (ОТДЕЛЬНО)
      const modelRemaining = Math.max(0, modelPlan - modelPaid);
      const modelDelta = modelPaid - modelPlan;
      if (modelDelta > 5) {
        overpaymentCount++;
        totalOverpaidAmount += modelDelta;
      }

      // 2. Дельта и остаток Чаттеров (ОТДЕЛЬНО)
      const chatterRemaining = Math.max(0, chatterPlan - chatterPaid);
      const chatterDelta = chatterPaid - chatterPlan;
      if (chatterDelta > 5) {
        overpaymentCount++;
        totalOverpaidAmount += chatterDelta;
      }

      totalModelPlanAll += modelPlan;
      totalModelPaidAll += modelPaid;
      totalChatterPlanAll += chatterPlan;
      totalChatterPaidAll += chatterPaid;
      totalAgencyShareAll += agencyShare;

      // Статус Модели (5 аудиторских статусов)
      let modelStatusBadge = '';
      if (modelDelta > 5) {
        modelStatusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; background: rgba(239, 68, 68, 0.15); color: var(--accent-rose); font-weight: 700; border: 1px solid var(--accent-rose);">🔴 Переплата +$${modelDelta.toFixed(0)}</span>`;
      } else if (modelPaid >= modelPlan - 5 && modelPlan > 0) {
        modelStatusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; background: rgba(52, 211, 153, 0.15); color: var(--accent-green); font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">🟢 Закрыто ($${modelPaid.toFixed(0)})</span>`;
      } else if (modelPaid > 0) {
        modelStatusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: var(--primary); font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3);">⚡ Частично (долг: $${modelRemaining.toFixed(0)})</span>`;
      } else if (modelPlan > 0) {
        modelStatusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); font-weight: 700; border: 1px solid rgba(245, 158, 11, 0.3);">🟡 К выплате $${modelPlan.toFixed(0)}</span>`;
      } else {
        modelStatusBadge = `<span style="font-size: 11px; color: var(--text-dim);">—</span>`;
      }

      // Статус Чаттеров (5 аудиторских статусов)
      let chatterStatusBadge = '';
      if (chatterDelta > 5) {
        chatterStatusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; background: rgba(239, 68, 68, 0.15); color: var(--accent-rose); font-weight: 700; border: 1px solid var(--accent-rose);">🔴 Переплата +$${chatterDelta.toFixed(0)}</span>`;
      } else if (chatterPaid >= chatterPlan - 5 && chatterPlan > 0) {
        chatterStatusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; background: rgba(52, 211, 153, 0.15); color: var(--accent-green); font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">🟢 Закрыто ($${chatterPaid.toFixed(0)})</span>`;
      } else if (chatterPaid > 0) {
        chatterStatusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: var(--primary); font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3);">⚡ Частично (долг: $${chatterRemaining.toFixed(0)})</span>`;
      } else if (chatterPlan > 0) {
        chatterStatusBadge = `<span style="font-size: 11px; padding: 2px 7px; border-radius: 6px; background: rgba(168, 85, 247, 0.15); color: #c084fc; font-weight: 700; border: 1px solid rgba(168, 85, 247, 0.3);">🟡 К выплате $${chatterPlan.toFixed(0)}</span>`;
      } else {
        chatterStatusBadge = `<span style="font-size: 11px; color: var(--text-dim);">—</span>`;
      }

      return {
        ...m,
        earned,
        modelPlan,
        modelPaid,
        modelRemaining,
        modelDelta,
        modelStatusBadge,
        chatterPlan,
        chatterPaid,
        chatterRemaining,
        chatterDelta,
        chatterStatusBadge,
        agencyShare
      };
    });

    // Персонально по чаттерам
    const chattersMap = {};
    const crmChatters = (initialChatterWeekly || []).filter(r => {
      if (selectedPeriod === 'all') return true;
      return r.monthKey === selectedPeriod;
    });

    crmChatters.forEach(r => {
      const name = r.chatter || 'Неизвестный чаттер';
      if (!chattersMap[name]) {
        chattersMap[name] = {
          name,
          accounts: new Set(),
          totalSales: 0
        };
      }
      if (r.accountId) chattersMap[name].accounts.add(r.accountId);
      chattersMap[name].totalSales += (Number(r.totalSales) || 0);
    });

    const chatterAuditList = Object.values(chattersMap).map(c => {
      const dueAmount = c.totalSales * 0.20;
      const normName = c.name.toLowerCase();

      const matchingTxs = txList.filter(t => {
        if (t.type !== 'Расход') return false;
        const desc = (t.desc || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();
        if (!cat.includes('чаттер') && !cat.includes('зарплат') && !desc.includes('чаттер')) return false;
        return desc.includes(normName) || (normName.includes('тимур') && desc.includes('тимур')) || (normName.includes('karina') && desc.includes('карин'));
      });

      const paidAmount = matchingTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const delta = paidAmount - dueAmount;

      let statusBadge = '';
      if (delta > 5) {
        statusBadge = `<span style="font-size: 11px; padding: 3px 8px; border-radius: 8px; background: rgba(239, 68, 68, 0.15); color: var(--accent-rose); font-weight: 700; border: 1px solid var(--accent-rose);">🔴 Переплата +$${delta.toFixed(2)}</span>`;
      } else if (paidAmount === 0 && dueAmount > 0) {
        statusBadge = `<span style="font-size: 11px; padding: 3px 8px; border-radius: 8px; background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); font-weight: 700; border: 1px solid rgba(245, 158, 11, 0.3);">🟡 К выплате $${Math.round(dueAmount)} (15-го)</span>`;
      } else if (paidAmount > 0 && paidAmount < dueAmount - 5) {
        statusBadge = `<span style="font-size: 11px; padding: 3px 8px; border-radius: 8px; background: rgba(56, 189, 248, 0.15); color: var(--primary); font-weight: 700;">⚡ Выплачено $${paidAmount.toFixed(0)} из $${dueAmount.toFixed(0)}</span>`;
      } else {
        statusBadge = `<span style="font-size: 11px; padding: 3px 8px; border-radius: 8px; background: rgba(52, 211, 153, 0.15); color: var(--accent-green); font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">🟢 Честно (Сходится)</span>`;
      }

      return {
        name: c.name,
        accountsList: Array.from(c.accounts),
        totalSales: c.totalSales,
        dueAmount,
        paidAmount,
        delta,
        statusBadge
      };
    }).sort((a, b) => b.totalSales - a.totalSales);

    const totalModelRemainingAll = modelAuditList.reduce((sum, m) => sum + m.modelRemaining, 0);
    const totalChatterRemainingAll = modelAuditList.reduce((sum, m) => sum + m.chatterRemaining, 0);
    const modelOverpaidAmount = modelAuditList.reduce((sum, m) => sum + (m.modelDelta > 5 ? m.modelDelta : 0), 0);
    const chatterOverpaidAmount = modelAuditList.reduce((sum, m) => sum + (m.chatterDelta > 5 ? m.chatterDelta : 0), 0);

    return {
      period: selectedPeriod,
      models: modelAuditList,
      chatters: chatterAuditList,
      totalModelPlanAll,
      totalModelPaidAll,
      totalModelRemainingAll,
      modelOverpaidAmount,
      totalChatterPlanAll,
      totalChatterPaidAll,
      totalChatterRemainingAll,
      chatterOverpaidAmount,
      totalAgencyShareAll,
      overpaymentCount,
      totalOverpaidAmount,
      isClean: overpaymentCount === 0
    };
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

  const filterCatSelect = document.getElementById('fin-filter-cat');
  filterCatSelect?.addEventListener('change', () => {
    renderTransactionsTable(manager.getFiltered());
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

  function renderKPIs(metrics, cashBalance = 0) {
    const elTopCash = document.getElementById('fin-top-cash-balance');
    const elTopTransit = document.getElementById('fin-top-transit');
    const elTopRev = document.getElementById('fin-top-rev');
    const elTopRevSub = document.getElementById('fin-top-rev-sub');
    const elTopProfit = document.getElementById('fin-top-profit');
    const elTopProfitSub = document.getElementById('fin-top-profit-sub');

    const elRev = document.getElementById('fin-kpi-rev');
    const elFees = document.getElementById('fin-kpi-fees');
    const elFeesSub = document.getElementById('fin-kpi-fees-sub');
    const elNet = document.getElementById('fin-kpi-net');
    const elMargin = document.getElementById('fin-kpi-margin');

    // 1. Топовая плашка: Фактически в кассе (на руках)
    if (elTopCash) {
      elTopCash.textContent = `$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      elTopCash.style.color = cashBalance >= 0 ? '#34d399' : 'var(--accent-rose)';
    }

    // 2. Деньги в пути (Транзит OnlyFans / Paxum -> Bybit)
    if (elTopTransit) {
      const savedInTransit = localStorage.getItem(STORAGE_KEY_IN_TRANSIT);
      const transitVal = savedInTransit !== null ? parseFloat(savedInTransit) : 0.00;
      elTopTransit.textContent = `$${transitVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // 3. Выручка Net OnlyFans & Fansly
    if (elTopRev) {
      elTopRev.textContent = `$${metrics.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (elTopRevSub) {
      elTopRevSub.textContent = 'Поступило с платформ за период';
    }

    // 4. Чистая прибыль агентства
    if (elTopProfit) {
      elTopProfit.textContent = `$${metrics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      elTopProfit.style.color = metrics.netProfit >= 0 ? '#fbbf24' : 'var(--accent-rose)';
    }
    if (elTopProfitSub) {
      elTopProfitSub.textContent = `Маржинальность: ${metrics.netMargin.toFixed(1)}%`;
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

    // 7. Выплаты PayPal
    const elPaypal = document.getElementById('fin-kpi-paypal');
    if (elPaypal) {
      const allTx = manager.getFiltered() || [];
      const paypalTotal = allTx.reduce((sum, t) => {
        if (t.type === 'Расход') {
          const c = (t.category || '').toLowerCase();
          const d = (t.desc || '').toLowerCase();
          if (c.includes('paypal') || d.includes('paypal') || d.includes('пейпал') || d.includes('пайпал')) {
            return sum + (Number(t.amount) || 0);
          }
        }
        return sum;
      }, 0);
      elPaypal.textContent = `$${paypalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            <div style="font-size: 13px; font-family: var(--font-mono); color: var(--text-muted); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>Факт: <strong style="color: var(--text-main);">$${b.fact.toLocaleString()}</strong></span>
              <span>/</span>
              <span style="color: var(--text-dim);">План $:</span>
              <input type="number" class="input-budget-plan" data-group="${b.group}" value="${b.plan}" step="50" min="0" style="width: 85px; padding: 3px 6px; font-size: 13px; font-family: var(--font-mono); font-weight: 700; background: #ffffff; color: var(--primary); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 4px; text-align: right;" title="Измените число и нажмите Enter или кликните вне поля" />
              (<span style="color: ${statusColor}; font-weight: 700;">${b.pct.toFixed(1)}%</span>)
            </div>
          </div>
          <div style="height: 7px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; position: relative;">
            <div style="width: ${progressWidth}%; height: 100%; background: ${statusColor}; border-radius: 4px; transition: width 0.4s ease;"></div>
          </div>
        </div>
      `;
    }).join('');

    // Интерактивное редактирование лимитов бюджетов пользователем
    container.querySelectorAll('.input-budget-plan').forEach(input => {
      input.addEventListener('change', (e) => {
        const group = e.target.dataset.group;
        const newPlan = parseFloat(e.target.value) || 0;
        manager.budgets[group] = newPlan;
        manager.saveBudgets();
        renderAll();
        showToast(`💾 План бюджета «${group}» обновлен: $${newPlan.toLocaleString()}`);
      });
    });
  }

  function renderUnitEconomics(txs, selectedPeriod = manager?.selectedPeriod || 'all') {
    const tbody = document.getElementById('fin-tbody-unit-economics');
    const matrixContainer = document.getElementById('fin-matrix-container');

    const matrixModels = [
      { id: 'sunnery', name: 'Lolly (Lollysunnery)', shortName: 'Lollysunnery', matchKeys: ['sunnery', 'lollysunnery', '39856'] },
      { id: 'blush', name: 'Eva Blush', shortName: 'Eva Blush', matchKeys: ['blush', 'eva blush', '48123'] },
      { id: '1lolly', name: 'Lolly (1lollyhere)', shortName: '1lollyhere', matchKeys: ['1lolly', '1lollyhere', '47892'] },
      { id: 'fansly', name: 'Eva Pinky (Fansly)', shortName: 'Eva Fansly', matchKeys: ['fansly', 'eva pinky'] },
      { id: 'lila', name: 'Lila (angelkiss)', shortName: 'Lila', matchKeys: ['lila', 'angelkiss', '49015'] }
    ];

    // Собираем прямые доходы и статьи расходов ИСКЛЮЧИТЕЛЬНО из реальных транзакций
    const stats = {};
    matrixModels.forEach(m => {
      stats[m.name] = {
        meta: m,
        earned: 0,
        costsModel: 0,
        costsOperators: 0,
        costsMarketing: 0,
        costsFees: 0,
        agencyCosts: 0,
        costsAll: 0,
        gmp: 0,
        gmpPct: 0
      };
    });

    let totalAgencyOverhead = 0;

    txs.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        const tModel = t.model || '';
        const target = matrixModels.find(m => m.name === tModel || m.matchKeys.some(k => tModel.toLowerCase().includes(k)));
        if (target) {
          stats[target.name].earned += amt;
        }
      } else if (t.type === 'Расход') {
        const cat = (t.category || '').toLowerCase();
        const desc = (t.desc || '').toLowerCase();
        const tModel = t.model || '';
        const target = matrixModels.find(m => m.name === tModel || m.matchKeys.some(k => tModel.toLowerCase().includes(k) || desc.includes(k)));

        if (cat.startsWith('трафик')) {
          if (target) {
            stats[target.name].costsMarketing += amt;
          } else {
            totalAgencyOverhead += amt;
          }
        } else if (cat.includes('комисси') || cat.includes('вывод') || desc.includes('комисси') || desc.includes('вывод') || desc.includes('paxum') || desc.includes('bybit')) {
          if (target) {
            stats[target.name].costsFees += amt;
          } else {
            totalAgencyOverhead += amt;
          }
        } else if (cat.includes('софт') || cat.includes('monster') || cat.includes('монстр') || cat.includes('прочие') || tModel.includes('Agency Core') || tModel.includes('Общие')) {
          totalAgencyOverhead += amt;
        } else if (target) {
          stats[target.name].costsMarketing += amt;
        } else {
          totalAgencyOverhead += amt;
        }
      }
    });

    // Начисление долей модели и операторов от заработанного (Fansly = 30%, OF = 25%, Чаттеры = 20%)
    matrixModels.forEach(m => {
      const s = stats[m.name];
      const isFansly = m.id === 'fansly';
      s.costsModel = s.earned * (isFansly ? 0.30 : 0.25);
      s.costsOperators = s.earned * 0.20;
    });

    // Сплит общих расходов агентства (Agency costs USDT) поровну на все активные анкеты (принцип из таблицы)
    const modelCount = matrixModels.length;
    const agencyPerModel = modelCount > 0 ? totalAgencyOverhead / modelCount : 0;

    // Итоговые расчеты по каждой анкете
    matrixModels.forEach(m => {
      const s = stats[m.name];
      s.agencyCosts = agencyPerModel;
      s.costsAll = s.costsModel + s.costsOperators + s.costsMarketing + s.costsFees + s.agencyCosts;
      s.gmp = s.earned - s.costsAll;
      s.costsAllPct = s.earned > 0 ? (s.costsAll / s.earned) * 100 : 0;
      s.gmpPct = s.earned > 0 ? (s.gmp / s.earned) * 100 : 0;
    });

    // Итого по всему агентству (TOTAL)
    const totalAgency = {
      earned: Object.values(stats).reduce((acc, s) => acc + s.earned, 0),
      costsModel: Object.values(stats).reduce((acc, s) => acc + s.costsModel, 0),
      costsOperators: Object.values(stats).reduce((acc, s) => acc + s.costsOperators, 0),
      costsMarketing: Object.values(stats).reduce((acc, s) => acc + s.costsMarketing, 0),
      costsFees: Object.values(stats).reduce((acc, s) => acc + s.costsFees, 0),
      agencyCosts: totalAgencyOverhead,
      costsAll: Object.values(stats).reduce((acc, s) => acc + s.costsAll, 0),
      gmp: 0,
      costsAllPct: 0,
      gmpPct: 0
    };
    totalAgency.gmp = totalAgency.earned - totalAgency.costsAll;
    totalAgency.costsAllPct = totalAgency.earned > 0 ? (totalAgency.costsAll / totalAgency.earned) * 100 : 0;
    totalAgency.gmpPct = totalAgency.earned > 0 ? (totalAgency.gmp / totalAgency.earned) * 100 : 0;

    // 1. РЕНДЕРИНГ СВОДНОЙ МАТРИЦЫ (Скриншот 3 - 1-в-1 как в старой таблице!)
    if (matrixContainer) {
      const formatUsd = (num, digits = 2) => `$${Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
      
      const renderRow = (label, agencyVal, modelExtractor, options = {}) => {
        const isBold = options.isBold || false;
        const isHighlight = options.isHighlight || false;
        const isGmp = options.isGmp || false;
        const isPct = options.isPct || false;
        const customColor = options.color || 'var(--text-main)';
        const bg = isGmp ? 'rgba(16, 185, 129, 0.08)' : (isHighlight ? 'rgba(244, 63, 94, 0.05)' : 'transparent');
        const borderTop = isGmp ? '2px solid #475569' : (isHighlight ? '1px solid #475569' : '1px solid #353e52');

        return `
          <tr style="background: ${bg}; border-top: ${borderTop};">
            <td style="position: sticky; left: 0; background: #222734; z-index: 2; border-right: 1px solid #353e52; font-weight: ${isBold ? '800' : '600'}; color: ${isBold ? '#f8fafc' : '#cbd5e1'}; font-size: 13px; padding: 11px 16px; white-space: nowrap;">
              ${label}
            </td>
            <td style="background: rgba(56, 189, 248, 0.12); border-left: 2px solid var(--primary); border-right: 2px solid var(--primary); font-family: var(--font-mono); font-weight: 800; font-size: ${isGmp ? '15px' : '13px'}; text-align: right; color: ${isGmp ? (agencyVal >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)') : customColor}; padding: 11px 16px;">
              ${isPct ? `${agencyVal.toFixed(1)}%` : formatUsd(agencyVal, isGmp ? 0 : 2)}
            </td>
            ${matrixModels.map(m => {
              const val = modelExtractor(stats[m.name]);
              let cellColor = customColor;
              if (isGmp) {
                cellColor = val >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)';
              }
              return `
                <td style="font-family: var(--font-mono); font-weight: ${isBold ? '800' : '500'}; font-size: ${isGmp ? '14px' : '13px'}; text-align: right; color: ${cellColor}; padding: 11px 16px;">
                  ${isPct ? (stats[m.name].earned > 0 ? `${val.toFixed(1)}%` : '—') : formatUsd(val, isGmp ? 0 : 2)}
                </td>
              `;
            }).join('')}
          </tr>
        `;
      };

      matrixContainer.innerHTML = `
        <table class="data-table" style="min-width: 960px; border-collapse: separate; border-spacing: 0;">
          <thead>
            <tr style="background: #2a3142;">
              <th style="position: sticky; left: 0; background: #2a3142; z-index: 3; min-width: 250px; font-size: 13px; font-weight: 800; color: #f8fafc; border-right: 1px solid #353e52; padding: 13px 16px;">
                Статья затрат / Метрика
              </th>
              <th style="min-width: 170px; background: rgba(56, 189, 248, 0.18); color: var(--primary); font-weight: 800; font-size: 13px; border-left: 2px solid var(--primary); border-right: 2px solid var(--primary); text-align: right; padding: 13px 16px;">
                🏢 ВСЕ АГЕНТСТВО
              </th>
              ${matrixModels.map(m => `
                <th style="min-width: 140px; text-align: right; font-size: 13px; color: #f8fafc; font-weight: 700; padding: 13px 16px;">
                  ${m.shortName}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${renderRow('💵 Заработано на странице', totalAgency.earned, s => s.earned, { isBold: true, color: 'var(--accent-green)' })}
            ${renderRow('👑 Costs model (Выплата 25% / Fansly 30%)', totalAgency.costsModel, s => s.costsModel, { color: '#ec4899' })}
            ${renderRow('💬 Costs operators (Чаттеры 20%)', totalAgency.costsOperators, s => s.costsOperators, { color: '#a855f7' })}
            ${renderRow('🎯 Costs marketing (Трафик)', totalAgency.costsMarketing, s => s.costsMarketing, { color: 'var(--accent-rose)' })}
            ${renderRow('💳 Costs withdraw fee (Комиссия вывода)', totalAgency.costsFees, s => s.costsFees, { color: 'var(--accent-amber)' })}
            ${renderRow('🏢 Agency costs USDT (Опекс/софт сплит)', totalAgency.agencyCosts, s => s.agencyCosts, { color: 'var(--text-muted)' })}
            ${renderRow('📉 Costs all $ (ИТОГО РАСХОДОВ)', totalAgency.costsAll, s => s.costsAll, { isBold: true, isHighlight: true, color: 'var(--text-main)' })}
            ${renderRow('📊 Costs all % (Доля расходов)', totalAgency.costsAllPct, s => s.costsAllPct, { isBold: true, isPct: true, color: 'var(--text-muted)' })}
            ${renderRow('🏆 GMP $ (Gross Margin Profit)', totalAgency.gmp, s => s.gmp, { isBold: true, isGmp: true })}
            ${renderRow('📈 GMP % (Маржинальность)', totalAgency.gmpPct, s => s.gmpPct, { isBold: true, isPct: true, color: totalAgency.gmpPct >= 30 ? 'var(--accent-green)' : 'var(--accent-amber)' })}
          </tbody>
        </table>
      `;
    }
  }

  let selectedCategoryFilter = 'all';

  function renderTransactionsTable(txs) {
    const tbody = document.getElementById('fin-tbody-transactions');
    const countBadge = document.getElementById('fin-tx-count-badge');
    const filterCatSelect = document.getElementById('fin-filter-cat');
    if (filterCatSelect) {
      selectedCategoryFilter = filterCatSelect.value;
    }

    let filteredTxs = txs;
    if (selectedCategoryFilter === 'paypal') {
      filteredTxs = txs.filter(t => {
        const c = (t.category || '').toLowerCase();
        const d = (t.desc || '').toLowerCase();
        return c.includes('paypal') || d.includes('paypal') || d.includes('пейпал') || d.includes('пайпал');
      });
    } else if (selectedCategoryFilter !== 'all') {
      filteredTxs = txs.filter(t => (t.category || '').toLowerCase().includes(selectedCategoryFilter.toLowerCase()));
    }

    if (countBadge) countBadge.textContent = `${filteredTxs.length} записей`;
    if (!tbody) return;

    if (filteredTxs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-dim);">Операций за выбранный фильтр не найдено</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredTxs.map(t => {
      const isInc = t.type === 'Доход';
      const badgeStyle = isInc ? 'background: rgba(52, 211, 153, 0.15); color: var(--accent-green);' : 'background: rgba(248, 113, 113, 0.15); color: var(--accent-rose);';
      const isPaypal = (t.category || '').toLowerCase().includes('paypal') || (t.desc || '').toLowerCase().includes('paypal') || (t.desc || '').toLowerCase().includes('пейпал');
      const catBadge = isPaypal 
        ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 700; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">🅿️ PayPal</span>` 
        : t.category;

      return `
        <tr>
          <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">${t.date}</td>
          <td><span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; ${badgeStyle}">${t.type}</span></td>
          <td style="font-weight: 600; font-size: 13px;">${catBadge}</td>
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
              <button class="btn-action btn-pay-contractor" data-id="${c.id}" data-suggest="${suggestAmount}" style="padding: 4px 10px; font-size: 11px; white-space: nowrap;">
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
          let targetModel = c.model;
          if (c.id === 'killerleon') {
            const chooseEva = confirm(`Оплата Леону (SFS):\nНажмите OK — отнести расход на Eva Blush\nОтмена — отнести на Lolly (1lollyhere)`);
            targetModel = chooseEva ? 'Eva Blush' : 'Lolly (1lollyhere)';
          }

          manager.addTransaction({
            date: new Date().toISOString().split('T')[0],
            type: 'Расход',
            category: c.category,
            amount: amt,
            model: targetModel,
            desc: `Выплата: ${c.name} (${amt >= c.defaultAmount ? 'Полная оплата' : 'Транш/Аванс'})`
          });
          renderAll();
          showToast(`✅ Выплата ${c.name} ($${amt}) внесена в расход (${targetModel})!`);
        }
      });
    });

    return { totalContractorsRemaining };
  }

  let userOverrodePayout = false;

  function renderRunwayAlert(cashBalance, totalObligations = 0, contractorsDue = 0, modelRem = 0, chatterRem = 0) {
    const alertContainer = document.getElementById('fin-runway-alert');
    if (!alertContainer) return;

    // Спокойное нейтральное состояние при нулевой кассе
    if (cashBalance <= 0) {
      alertContainer.innerHTML = `
        <div style="background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: var(--radius-sm); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 22px;">⚖️</span>
            <div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">
                Касса ожидает пополнения: внесите остаток Bybit или первый вывод OnlyFans
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                Запланировано обязательств по графику на месяц: <strong style="color: var(--primary); font-family: var(--font-mono);">$${contractorsDue.toLocaleString()}</strong> (Оскар, Анастасия, софт, Леон)
              </div>
            </div>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">
            Баланс кассы: <strong style="color: var(--text-main);">$0.00</strong>
          </div>
        </div>
      `;
      return;
    }

    const safeCash = cashBalance - totalObligations;

    alertContainer.innerHTML = `
      <div style="background: ${safeCash >= 0 ? 'rgba(52, 211, 153, 0.08)' : 'rgba(239, 68, 68, 0.12)'}; border: 1px solid ${safeCash >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)'}; border-radius: var(--radius-sm); padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 26px;">${safeCash >= 0 ? '🟢' : '🚨'}</span>
            <div>
              <div style="font-weight: 800; color: ${safeCash >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)'}; font-size: 15px;">
                ${safeCash >= 0 ? 'Безопасный Runway: Касса полностью покрывает все зарплаты и обязательства' : 'Внимание: Риск кассового разрыва перед ближайшими выплатами!'}
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
                В кассе на Bybit: <strong style="color: var(--text-main); font-family: var(--font-mono);">$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> | 
                Все обязательства: <strong style="color: #fbbf24; font-family: var(--font-mono);">$${totalObligations.toLocaleString()}</strong> 
                (Модели: $${Math.round(modelRem).toLocaleString()}, Чаттеры: $${Math.round(chatterRem).toLocaleString()}, Подрядчики: $${Math.round(contractorsDue).toLocaleString()})
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-weight: 800; font-size: 18px; color: ${safeCash >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)'};">
              Свободная касса: ${safeCash >= 0 ? '+' : '-'}$${Math.abs(safeCash).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">
              ${safeCash >= 0 ? 'Чистые дивиденды овнера без риска разрыва' : 'Не выводить дивиденды до закрытия выплат!'}
            </div>
          </div>
        </div>

        <!-- Cash Flow Bar -->
        <div style="background: rgba(0, 0, 0, 0.25); border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); flex-wrap: wrap; gap: 8px;">
          <span>📈 <strong>Cash Flow:</strong> График выплат команде (15 и 31 числа)</span>
          <span>📅 Ближайшая выплата: 15-го числа</span>
        </div>
      </div>
    `;
  }

  // === НОВЫЕ БЛОКИ ДЛЯ ОВНЕРА: СВЕРКИ И АНАЛИТИКА ТРАТ ===

  // 1. Сверка кассы (Proof of Cash)
  function renderCashReconciliation(rec) {
    const badge = document.getElementById('fin-reconcile-badge');
    const deltaEl = document.getElementById('fin-reconcile-delta');
    const container = document.getElementById('fin-cash-reconciliation-container');

    // Баланс, сохраненный овнером/Владом для сверки
    const savedActualVal = localStorage.getItem(STORAGE_KEY_ACTUAL_WALLET);
    const actualWalletVal = savedActualVal !== null ? parseFloat(savedActualVal) : rec.expectedCashBalance;
    const deltaUsdt = actualWalletVal - rec.expectedCashBalance;
    const isUsdtBalanced = Math.abs(deltaUsdt) < 0.01;

    // Деньги в пути (In-Transit: OnlyFans / Paxum / P2P транзит)
    const savedTransitVal = localStorage.getItem(STORAGE_KEY_IN_TRANSIT);
    const transitVal = savedTransitVal !== null ? parseFloat(savedTransitVal) : 0.00;
    const totalLiquidity = actualWalletVal + transitVal;

    if (badge) {
      if (isUsdtBalanced) {
        badge.textContent = '🟢 Сходится 100%';
        badge.style.background = 'rgba(52, 211, 153, 0.15)';
        badge.style.color = 'var(--accent-green)';
        badge.style.border = '1px solid rgba(52, 211, 153, 0.3)';
      } else {
        badge.textContent = `🔴 Расхождение: ${deltaUsdt > 0 ? '+' : ''}$${deltaUsdt.toFixed(2)}`;
        badge.style.background = 'rgba(239, 68, 68, 0.15)';
        badge.style.color = 'var(--accent-rose)';
        badge.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      }
    }

    if (deltaEl) {
      deltaEl.textContent = `${deltaUsdt > 0 ? '+' : ''}$${deltaUsdt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      deltaEl.style.color = isUsdtBalanced ? 'var(--accent-green)' : 'var(--accent-rose)';
    }

    if (container) {
      container.innerHTML = `
        <!-- Таблица Сверки Кассы USDT & Деньги в Пути -->
        <div class="table-container scrollable-slider" style="margin-bottom: 16px; border: 1px solid #353e52; border-radius: 8px;">
          <table class="data-table" style="min-width: 760px;">
            <thead>
              <tr style="background: #2a3142;">
                <th style="font-size: 13px;">Счет / Статус активов</th>
                <th style="color: var(--accent-green); text-align: right; font-size: 13px;">Input (Зашло)</th>
                <th style="color: var(--accent-rose); text-align: right; font-size: 13px;">Output (Ушло)</th>
                <th style="color: var(--primary); text-align: right; font-size: 13px;">Расчетный баланс $</th>
                <th style="text-align: right; font-size: 13px;">Факт в кошельке $</th>
                <th style="text-align: right; font-size: 13px;">Дельта / В пути</th>
                <th style="font-size: 13px;">Контроль сходимости</th>
              </tr>
            </thead>
            <tbody>
              <!-- Строка 1: Касса Bybit факт -->
              <tr>
                <td style="font-weight: 800; color: #f8fafc; font-size: 13px;">💎 USDT (Касса Bybit на руках)</td>
                <td style="font-family: var(--font-mono); color: var(--accent-green); font-weight: 700; text-align: right;">+$${rec.inflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="font-family: var(--font-mono); color: var(--accent-rose); font-weight: 700; text-align: right;">-$${rec.outflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="font-family: var(--font-mono); color: var(--primary); font-weight: 800; font-size: 14px; text-align: right;">$${rec.expectedCashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; align-items: center; gap: 6px;">
                    <input id="fin-input-actual-usdt" type="number" step="0.01" value="${actualWalletVal.toFixed(2)}" style="width: 105px; padding: 4px 8px; font-family: var(--font-mono); font-weight: 700; background: #283042; border: 1px solid #414c62; color: #f8fafc; border-radius: 4px; text-align: right;" />
                    <button id="fin-btn-save-actual-usdt" class="btn-action btn-pay-contractor" style="padding: 4px 8px; font-size: 11px;" title="Сохранить факт Bybit">💾</button>
                  </div>
                </td>
                <td style="font-family: var(--font-mono); font-weight: 800; font-size: 13px; color: ${isUsdtBalanced ? 'var(--accent-green)' : 'var(--accent-rose)'}; text-align: right;">
                  ${deltaUsdt > 0 ? '+' : ''}$${deltaUsdt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <span style="padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: ${isUsdtBalanced ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isUsdtBalanced ? 'var(--accent-green)' : 'var(--accent-rose)'}; border: 1px solid ${isUsdtBalanced ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)'};">
                    ${isUsdtBalanced ? '🟢 Сходимость 100%' : `🔴 Расхождение $${deltaUsdt.toFixed(2)}`}
                  </span>
                </td>
              </tr>

              <!-- Строка 2: Деньги в пути (Транзит Paxum / OF / P2P) -->
              <tr style="background: rgba(56, 189, 248, 0.05); border-top: 1px solid #353e52;">
                <td style="font-weight: 700; color: #38bdf8; font-size: 13px;">🚀 Деньги в пути (Транзит OnlyFans / Paxum)</td>
                <td colspan="3" style="font-size: 12px; color: #cbd5e1; font-style: italic;">
                  Выводы с платформ в обработке, ожидается зачисление на кошелек (ETA: 1-2 дня)
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; align-items: center; gap: 6px;">
                    <input id="fin-input-transit-usdt" type="number" step="0.01" value="${transitVal.toFixed(2)}" style="width: 105px; padding: 4px 8px; font-family: var(--font-mono); font-weight: 700; background: #283042; border: 1px solid #38bdf8; color: #38bdf8; border-radius: 4px; text-align: right;" />
                    <button id="fin-btn-save-transit-usdt" class="btn-action btn-pay-contractor" style="padding: 4px 8px; font-size: 11px;" title="Сохранить сумму в пути">💾</button>
                  </div>
                </td>
                <td style="font-family: var(--font-mono); font-weight: 800; font-size: 13px; color: #38bdf8; text-align: right;">
                  +$${transitVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <span style="padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                    ⚡ Ожидает зачисления
                  </span>
                </td>
              </tr>

              <!-- Строка 3: ИТОГО СОВОКУПНЫЙ КАПИТАЛ -->
              <tr style="background: rgba(16, 185, 129, 0.08); border-top: 2px solid #353e52; font-weight: 800;">
                <td style="color: #f8fafc; font-size: 13px;">🏦 СОВОКУПНЫЙ КАПИТАЛ АГЕНТСТВА</td>
                <td colspan="3" style="font-size: 12px; color: #cbd5e1;">
                  Касса Bybit ($${actualWalletVal.toFixed(0)}) + Деньги в пути ($${transitVal.toFixed(0)})
                </td>
                <td colspan="2" style="font-family: var(--font-mono); font-size: 15px; color: var(--accent-green); text-align: right; padding-right: 12px;">
                  $${totalLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <span style="padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: rgba(52, 211, 153, 0.15); color: var(--accent-green); border: 1px solid rgba(52, 211, 153, 0.3);">
                    🛡️ Полное покрытие
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 14px;">
          <!-- 1. Поступления -->
          <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-sm); padding: 14px 16px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-green); font-weight: 700; margin-bottom: 4px;">
              ⬇️ Поступления (Inflow)
            </div>
            <div style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: var(--accent-green);">
              +$${rec.inflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
              Зачислено в кассу
            </div>
          </div>

          <!-- 2. Списания -->
          <div style="background: rgba(248, 113, 113, 0.05); border: 1px solid rgba(248, 113, 113, 0.25); border-radius: var(--radius-sm); padding: 14px 16px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-rose); font-weight: 700; margin-bottom: 4px;">
              ⬆️ Списания (Outflow)
            </div>
            <div style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: var(--accent-rose);">
              -$${rec.outflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
              Трафик, выплаты, софт
            </div>
          </div>

          <!-- 3. Деньги в пути -->
          <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-sm); padding: 14px 16px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; font-weight: 700; margin-bottom: 4px;">
              🚀 Деньги в пути (In Transit)
            </div>
            <div style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: #38bdf8;">
              +$${transitVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
              OnlyFans / Paxum → Bybit
            </div>
          </div>

          <!-- 4. Свободная касса -->
          <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-sm); padding: 14px 16px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-amber); font-weight: 700; margin-bottom: 4px;">
              🛡 Свободная Касса (Safe Cash)
            </div>
            <div style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: var(--accent-amber);">
              $${rec.safeCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
              Касса минус обязательства
            </div>
          </div>

          <!-- 5. Совокупный капитал -->
          <div style="background: rgba(168, 85, 247, 0.06); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: var(--radius-sm); padding: 14px 16px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #c084fc; font-weight: 700; margin-bottom: 4px;">
              💎 Совокупный Капитал
            </div>
            <div style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: #c084fc;">
              $${totalLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
              Касса Bybit + Транзит
            </div>
          </div>
        </div>

        <!-- Formula Audit Strip -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #283042; border: 1px solid #353e52; border-radius: 8px; font-size: 12px; font-family: var(--font-mono); color: #cbd5e1; flex-wrap: wrap; gap: 8px;">
          <div>
            <span>Расчетная касса: </span>
            <span style="color: var(--accent-green); font-weight: 700;">+$${rec.inflow.toFixed(2)}</span>
            <span> − </span>
            <span style="color: var(--accent-rose); font-weight: 700;">$${rec.outflow.toFixed(2)}</span>
            <span> = </span>
            <strong style="color: #f8fafc; font-weight: 800;">$${rec.expectedCashBalance.toFixed(2)}</strong>
          </div>
          <div>
            <span>Факт Bybit: </span>
            <strong style="color: #38bdf8; font-weight: 800;">$${actualWalletVal.toFixed(2)}</strong>
            <span> | В пути: </span>
            <strong style="color: #c084fc; font-weight: 800;">+$${transitVal.toFixed(2)}</strong>
            <span style="margin-left: 8px; font-weight: 700; color: ${isUsdtBalanced ? 'var(--accent-green)' : 'var(--accent-rose)'};">
              ${isUsdtBalanced ? '✓ Расхождений нет ($0.00)' : `⚠️ Расхождение ${deltaUsdt > 0 ? '+' : ''}$${deltaUsdt.toFixed(2)}`}
            </span>
          </div>
        </div>
      `;

      // Привязка кнопки сохранения баланса кошелька
      const btnSaveActual = document.getElementById('fin-btn-save-actual-usdt');
      const inputActual = document.getElementById('fin-input-actual-usdt');
      if (btnSaveActual && inputActual) {
        btnSaveActual.onclick = () => {
          const val = parseFloat(inputActual.value) || 0;
          localStorage.setItem(STORAGE_KEY_ACTUAL_WALLET, val.toString());
          showToast(`💾 Фактический баланс кошелька Bybit сохранен: $${val.toLocaleString()}`);
          renderAll();
        };
      }

      // Привязка кнопки сохранения суммы в пути
      const btnSaveTransit = document.getElementById('fin-btn-save-transit-usdt');
      const inputTransit = document.getElementById('fin-input-transit-usdt');
      if (btnSaveTransit && inputTransit) {
        btnSaveTransit.onclick = () => {
          const val = parseFloat(inputTransit.value) || 0;
          localStorage.setItem(STORAGE_KEY_IN_TRANSIT, val.toString());
          showToast(`🚀 Сумма «В пути» обновлена: $${val.toLocaleString()}`);
          renderAll();
        };
      }
    }
  }

  // 2. Сверка заработка по анкетам (CRM vs Выводы)
  function renderModelEarningsReconciliation(modelData, selectedPeriod) {
    const periodBadge = document.getElementById('fin-model-period-badge');
    const totalEarnedEl = document.getElementById('fin-model-total-earned');
    const tbody = document.getElementById('fin-tbody-model-reconciliation');

    if (periodBadge) {
      let label = 'Все периоды';
      if (selectedPeriod === '2026-11') label = 'Ноябрь 2026 (1–15 Ноя)';
      else if (selectedPeriod === '2026-10') label = 'Октябрь 2026 (1–31 Окт)';
      else if (selectedPeriod === '2026-09') label = 'Сентябрь 2026';
      periodBadge.textContent = label;
    }

    if (totalEarnedEl) {
      totalEarnedEl.textContent = `$${modelData.totalEarnedAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    if (tbody) {
      if (!modelData.models || modelData.models.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-dim); padding: 18px;">Нет данных по анкетам за выбранный период</td></tr>`;
        return;
      }

      const rowsHtml = modelData.models.map(m => {
        let statusBadge = '';
        if (m.withdrawnToCash >= m.totalEarned && m.totalEarned > 0) {
          statusBadge = '<span style="font-size: 11px; padding: 3px 8px; border-radius: 8px; background: rgba(52, 211, 153, 0.15); color: var(--accent-green); font-weight: 700;">🟢 Выведено в кассу</span>';
        } else if (m.inTransit > 0) {
          statusBadge = '<span style="font-size: 11px; padding: 3px 8px; border-radius: 8px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700;">🚀 В пути на кошелек</span>';
        } else {
          statusBadge = '<span style="font-size: 11px; color: var(--text-dim);">—</span>';
        }

        return `
          <tr>
            <td style="font-weight: 700; color: #f8fafc; font-size: 13px;">${m.name}</td>
            <td style="font-family: var(--font-mono); font-size: 13px;">$${m.grossRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); font-size: 13px; color: #cbd5e1;">$${m.netRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); font-size: 13px; color: ${m.ppRev > 0 ? 'var(--primary)' : 'var(--text-dim)'};">${m.ppRev > 0 ? '$' + m.ppRev.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-green); font-size: 14px;">$${m.totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary); font-size: 14px;">$${m.withdrawnToCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: #38bdf8; font-size: 13px;">${m.inTransit > 0 ? '$' + m.inTransit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-family: var(--font-mono); font-weight: 700; font-size: 12px; min-width: 42px;">${m.sharePct.toFixed(1)}%</span>
                <div style="flex: 1; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; min-width: 50px;">
                  <div style="width: ${Math.min(100, m.sharePct)}%; height: 100%; background: var(--primary); border-radius: 4px;"></div>
                </div>
              </div>
            </td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');

      const totalRowHtml = `
        <tr style="border-top: 2px solid #353e52; background: rgba(255, 255, 255, 0.03); font-weight: 800;">
          <td style="color: #f8fafc; font-size: 13px;">ИТОГО АГЕНТСТВО</td>
          <td style="font-family: var(--font-mono); font-size: 13px;">$${modelData.totalGrossAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); font-size: 13px; color: #cbd5e1;">$${modelData.totalNetAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); font-size: 13px; color: var(--primary);">$${modelData.totalPaypalAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); color: var(--accent-green); font-size: 15px;">$${modelData.totalEarnedAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); color: var(--primary); font-size: 15px;">$${modelData.totalWithdrawnAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); color: #38bdf8; font-size: 14px;">$${(modelData.totalTransitAll || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); font-size: 12px;">100.0%</td>
          <td><span style="font-size: 11px; color: #cbd5e1;">Сверка периода</span></td>
        </tr>
      `;

      tbody.innerHTML = rowsHtml + totalRowHtml;
    }
  }

  // 3. Детальная аналитика и таблица расходов
  let currentExpenseFilter = 'all';

  function renderDetailedExpenses(expData) {
    const badge = document.getElementById('fin-expenses-total-badge');
    const filterPillsContainer = document.getElementById('fin-expense-filter-pills');
    const kpiGrid = document.getElementById('fin-expense-kpi-grid');
    const tbody = document.getElementById('fin-tbody-detailed-expenses');

    if (badge) {
      badge.textContent = `Расход: $${expData.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    // KPI Grid cards
    if (kpiGrid) {
      const gList = [
        { key: 'traffic', ...expData.groups.traffic, icon: '🎯' },
        { key: 'soft', ...expData.groups.soft, icon: '🛠' },
        { key: 'payroll', ...expData.groups.payroll, icon: '👥' },
        { key: 'fees', ...expData.groups.fees, icon: '💳' },
        { key: 'other', ...expData.groups.other, icon: '📦' }
      ];

      kpiGrid.innerHTML = gList.map(g => {
        const share = expData.totalExpenses > 0 ? (g.amount / expData.totalExpenses) * 100 : 0;
        return `
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; border-left: 3px solid ${g.color};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">${g.label}</span>
              <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-dim);">${g.count} оп.</span>
            </div>
            <div style="font-size: 17px; font-weight: 800; font-family: var(--font-heading); color: var(--text-main);">
              $${g.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 11px; font-family: var(--font-mono); color: ${g.color}; margin-top: 3px;">
              ${share.toFixed(1)}% от всех трат
            </div>
          </div>
        `;
      }).join('');
    }

    // Filter pills
    if (filterPillsContainer) {
      const pills = [
        { id: 'all', label: `Все (${expData.detailedList.length})` },
        { id: 'traffic', label: `🎯 Трафик ($${expData.groups.traffic.amount.toFixed(0)})` },
        { id: 'soft', label: `🛠 Подрядчики/Софт ($${expData.groups.soft.amount.toFixed(0)})` },
        { id: 'payroll', label: `👥 Зарплаты ($${expData.groups.payroll.amount.toFixed(0)})` },
        { id: 'fees', label: `💳 Комиссии ($${expData.groups.fees.amount.toFixed(0)})` },
        { id: 'other', label: `📦 Прочее ($${expData.groups.other.amount.toFixed(0)})` }
      ];

      filterPillsContainer.innerHTML = pills.map(p => {
        const isActive = currentExpenseFilter === p.id;
        return `
          <button class="btn-expense-pill" data-filter="${p.id}" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}; background: ${isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)'}; color: ${isActive ? 'var(--primary)' : 'var(--text-muted)'}; cursor: pointer; transition: all 0.2s;">
            ${p.label}
          </button>
        `;
      }).join('');

      filterPillsContainer.querySelectorAll('.btn-expense-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          currentExpenseFilter = btn.dataset.filter;
          renderDetailedExpenses(expData);
        });
      });
    }

    // Tbody detailed items
    if (tbody) {
      let filtered = expData.detailedList;
      if (currentExpenseFilter !== 'all') {
        filtered = filtered.filter(item => item.groupKey === currentExpenseFilter);
      }

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 18px;">Нет расходов по выбранной категории</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(item => {
        const descPreview = item.descs.length > 0 ? item.descs.join('; ') : '—';
        return `
          <tr>
            <td style="font-weight: 700; font-size: 13px; color: var(--text-main);">${item.category}</td>
            <td style="font-size: 12px; color: var(--primary);">${item.model}</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-rose); font-size: 14px;">$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-family: var(--font-mono); font-weight: 700; font-size: 12px; min-width: 42px;">${item.sharePct.toFixed(1)}%</span>
                <div style="flex: 1; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; min-width: 50px;">
                  <div style="width: ${Math.min(100, item.sharePct)}%; height: 100%; background: var(--accent-rose); border-radius: 4px;"></div>
                </div>
              </div>
            </td>
            <td style="font-family: var(--font-mono); font-size: 12px; text-align: center;">${item.txCount}</td>
            <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">${item.latestDate}</td>
            <td style="font-size: 11px; color: var(--text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${descPreview}">${descPreview}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // 4. Сверка выплат: План vs Факт
  function renderPayrollAudit(auditData) {
    const badge = document.getElementById('fin-audit-badge');
    const kpiGrid = document.getElementById('fin-audit-kpi-grid');
    const tbodyModels = document.getElementById('fin-tbody-audit-models');
    const tbodyChatters = document.getElementById('fin-tbody-audit-chatters');

    if (badge) {
      if (auditData.isClean) {
        badge.textContent = '🟢 Выплаты сходятся (Переплат нет)';
        badge.style.background = 'rgba(52, 211, 153, 0.15)';
        badge.style.color = 'var(--accent-green)';
        badge.style.border = '1px solid rgba(52, 211, 153, 0.3)';
      } else {
        badge.textContent = `🚨 Обнаружено переплат: +$${auditData.totalOverpaidAmount.toFixed(2)}!`;
        badge.style.background = 'rgba(239, 68, 68, 0.15)';
        badge.style.color = 'var(--accent-rose)';
        badge.style.border = '1px solid var(--accent-rose)';
      }
    }

    if (kpiGrid) {
      kpiGrid.innerHTML = `
        <div style="background: rgba(236, 72, 153, 0.05); border: 1px solid rgba(236, 72, 153, 0.25); border-radius: var(--radius-sm); padding: 14px 16px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #ec4899; font-weight: 700; margin-bottom: 4px;">
            👑 Фонд Моделей (25%)
          </div>
          <div style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: #ec4899;">
            $${auditData.totalModelPlanAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            Выплачено: <strong style="color: var(--text-main); font-family: var(--font-mono);">$${auditData.totalModelPaidAll.toFixed(2)}</strong> | Строго 25% от Net
          </div>
        </div>

        <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: var(--radius-sm); padding: 14px 16px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #a855f7; font-weight: 700; margin-bottom: 4px;">
            👥 Фонд Чаттеров (20%)
          </div>
          <div style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: #a855f7;">
            $${auditData.totalChatterPlanAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            Выплачено: <strong style="color: var(--text-main); font-family: var(--font-mono);">$${auditData.totalChatterPaidAll.toFixed(2)}</strong> | Зарплатный пул
          </div>
        </div>

        <div style="background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: var(--radius-sm); padding: 14px 16px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); font-weight: 700; margin-bottom: 4px;">
            💼 Доля Агентства ($)
          </div>
          <div style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: var(--primary);">
            $${auditData.totalAgencyShareAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            Доля агентства после доли модели и пула чаттеров
          </div>
        </div>

        <div style="background: ${auditData.isClean ? 'rgba(52, 211, 153, 0.05)' : 'rgba(239, 68, 68, 0.08)'}; border: 1px solid ${auditData.isClean ? 'rgba(52, 211, 153, 0.25)' : 'var(--accent-rose)'}; border-radius: var(--radius-sm); padding: 14px 16px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: ${auditData.isClean ? 'var(--accent-green)' : 'var(--accent-rose)'}; font-weight: 700; margin-bottom: 4px;">
            ⚖️ Сверка Выплат
          </div>
          <div style="font-size: 18px; font-weight: 800; font-family: var(--font-heading); color: ${auditData.isClean ? 'var(--accent-green)' : 'var(--accent-rose)'};">
            ${auditData.isClean ? '0 нарушений (Чисто)' : `⚠️ Переплата +$${auditData.totalOverpaidAmount.toFixed(2)}`}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            ${auditData.isClean ? 'Все начисления строго соответствуют заработанному' : 'Обнаружено превышение бюджета!'}
          </div>
        </div>
      `;
    }

    // Таблица по Анкетам: Модели и Чаттеры проверяются РАЗДЕЛЬНО
    if (tbodyModels) {
      const rowsHtml = auditData.models.map(m => `
        <tr>
          <td style="font-weight: 700; color: var(--text-main); font-size: 13px;">${m.name}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-green); font-size: 13px;">$${m.earned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); font-size: 13px; color: #ec4899;">$${m.modelPlan.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); font-size: 13px; color: ${m.modelPaid > 0 ? 'var(--text-main)' : 'var(--text-dim)'};">$${m.modelPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td>${m.modelStatusBadge}</td>
          <td style="font-family: var(--font-mono); font-size: 13px; color: #a855f7;">$${m.chatterPlan.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); font-size: 13px; color: ${m.chatterPaid > 0 ? 'var(--text-main)' : 'var(--text-dim)'};">$${m.chatterPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td>${m.chatterStatusBadge}</td>
          <td style="font-family: var(--font-mono); font-size: 13px; color: var(--primary);">$${m.agencyShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('');

      const totalEarnedAll = auditData.models.reduce((s, m) => s + m.earned, 0);

      const totalRowHtml = `
        <tr style="border-top: 2px solid var(--border-color); background: rgba(255, 255, 255, 0.03); font-weight: 800;">
          <td style="color: var(--text-main); font-size: 13px;">ИТОГО АГЕНТСТВО</td>
          <td style="font-family: var(--font-mono); color: var(--accent-green); font-size: 14px;">$${totalEarnedAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); color: #ec4899; font-size: 14px;">$${auditData.totalModelPlanAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); font-size: 14px;">$${auditData.totalModelPaidAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td>${auditData.modelOverpaidAmount > 0 ? `<span style="font-size: 11px; color: var(--accent-rose); font-weight: 700;">🔴 Переплата +$${auditData.modelOverpaidAmount.toFixed(0)}</span>` : `<span style="font-size: 11px; color: var(--accent-green); font-weight: 700;">🟢 Сходится</span>`}</td>
          <td style="font-family: var(--font-mono); color: #a855f7; font-size: 14px;">$${auditData.totalChatterPlanAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: var(--font-mono); font-size: 14px;">$${auditData.totalChatterPaidAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td>${auditData.chatterOverpaidAmount > 0 ? `<span style="font-size: 11px; color: var(--accent-rose); font-weight: 700;">🔴 Переплата +$${auditData.chatterOverpaidAmount.toFixed(0)}</span>` : `<span style="font-size: 11px; color: var(--accent-green); font-weight: 700;">🟢 Сходится</span>`}</td>
          <td style="font-family: var(--font-mono); color: var(--primary); font-size: 14px;">$${auditData.totalAgencyShareAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;

      tbodyModels.innerHTML = rowsHtml + totalRowHtml;
    }

    // Таблица по Чаттерам
    if (tbodyChatters) {
      if (!auditData.chatters || auditData.chatters.length === 0) {
        tbodyChatters.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 18px;">Нет данных по продажам чаттеров за выбранный период</td></tr>`;
      } else {
        const chatterRowsHtml = auditData.chatters.map(c => `
          <tr>
            <td style="font-weight: 700; color: var(--text-main); font-size: 13px;">${c.name}</td>
            <td style="font-size: 12px; color: var(--primary);">
              ${c.accountsList.length > 0 ? c.accountsList.map(a => `<span style="display: inline-block; padding: 2px 6px; border-radius: 6px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); margin-right: 4px; font-size: 11px; font-family: var(--font-mono);">ID: ${a}</span>`).join('') : '—'}
            </td>
            <td style="font-family: var(--font-mono); font-size: 13px;">$${c.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: #a855f7; font-size: 13px;">$${c.dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary); font-size: 13px;">$${c.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: ${c.delta > 5 ? 'var(--accent-rose)' : 'var(--text-muted)'};">
              ${c.delta > 0 ? '+' : ''}$${c.delta.toFixed(2)}
            </td>
            <td>${c.statusBadge}</td>
          </tr>
        `).join('');

        const totalSalesChatters = auditData.chatters.reduce((s, c) => s + c.totalSales, 0);
        const totalDueChatters = auditData.chatters.reduce((s, c) => s + c.dueAmount, 0);
        const totalPaidChatters = auditData.chatters.reduce((s, c) => s + c.paidAmount, 0);
        const totalDeltaChatters = totalPaidChatters - totalDueChatters;

        const totalChatterRowHtml = `
          <tr style="border-top: 2px solid var(--border-color); background: rgba(255, 255, 255, 0.03); font-weight: 800;">
            <td style="color: var(--text-main); font-size: 13px;">ИТОГО ЧАТТЕРЫ</td>
            <td style="font-size: 12px; color: var(--text-muted);">${auditData.chatters.length} сотрудников</td>
            <td style="font-family: var(--font-mono); font-size: 14px;">$${totalSalesChatters.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); color: #a855f7; font-size: 14px;">$${totalDueChatters.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); color: var(--primary); font-size: 14px;">$${totalPaidChatters.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: var(--font-mono); font-size: 12px; color: ${totalDeltaChatters > 5 ? 'var(--accent-rose)' : 'var(--accent-green)'};">
              ${totalDeltaChatters > 0 ? '+' : ''}$${totalDeltaChatters.toFixed(2)}
            </td>
            <td><span style="font-size: 11px; color: var(--accent-green); font-weight: 700;">🟢 Сверка 20%</span></td>
          </tr>
        `;

        tbodyChatters.innerHTML = chatterRowsHtml + totalChatterRowHtml;
      }
    }
  }

  // Setup tab switcher for Anti-Fraud section
  const btnAuditTabModels = document.getElementById('fin-audit-tab-models');
  const btnAuditTabChatters = document.getElementById('fin-audit-tab-chatters');
  const containerAuditModels = document.getElementById('fin-audit-container-models');
  const containerAuditChatters = document.getElementById('fin-audit-container-chatters');

  if (btnAuditTabModels && btnAuditTabChatters && containerAuditModels && containerAuditChatters) {
    btnAuditTabModels.addEventListener('click', () => {
      btnAuditTabModels.style.background = 'rgba(168, 85, 247, 0.25)';
      btnAuditTabModels.style.color = '#c084fc';
      btnAuditTabModels.style.borderColor = '#a855f7';
      btnAuditTabChatters.style.background = 'transparent';
      btnAuditTabChatters.style.color = 'var(--text-muted)';
      btnAuditTabChatters.style.borderColor = 'transparent';
      containerAuditModels.style.display = 'block';
      containerAuditChatters.style.display = 'none';
    });

    btnAuditTabChatters.addEventListener('click', () => {
      btnAuditTabChatters.style.background = 'rgba(168, 85, 247, 0.25)';
      btnAuditTabChatters.style.color = '#c084fc';
      btnAuditTabChatters.style.borderColor = '#a855f7';
      btnAuditTabModels.style.background = 'transparent';
      btnAuditTabModels.style.color = 'var(--text-muted)';
      btnAuditTabModels.style.borderColor = 'transparent';
      containerAuditModels.style.display = 'none';
      containerAuditChatters.style.display = 'block';
    });
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

    // Сверка выплат: План vs Факт (расчет долгов моделям и чаттерам)
    const payrollAudit = manager.calculatePayrollAudit(manager.selectedPeriod, txs);
    renderPayrollAudit(payrollAudit);

    // ЕДИНЫЙ РАСЧЕТ ВСЕХ ОБЯЗАТЕЛЬСТВ (Модели + Чаттеры + Подрядчики)
    const modelRem = payrollAudit?.totalModelRemainingAll || 0;
    const chatterRem = payrollAudit?.totalChatterRemainingAll || 0;
    const contractorsRem = contractorsStatus?.totalContractorsRemaining || 0;
    const totalObligations = modelRem + chatterRem + contractorsRem;
    const safeCash = cashBalance - totalObligations;

    // Рендерим топ-бар с подсвеченной кассой
    renderKPIs(metrics, cashBalance);

    renderBudgets(budgets);
    renderUnitEconomics(txs, manager.selectedPeriod);
    renderTransactionsTable(txs);
    renderCharts(txs);
    
    // Сверка Кассы и Аналитика Расходов
    const cashReconciliation = manager.calculateCashReconciliation(
      txs, 
      cashBalance, 
      totalObligations,
      0
    );
    const modelReconciliation = manager.calculateModelEarningsReconciliation(manager.selectedPeriod, txs);
    const detailedExpenses = manager.calculateDetailedExpenses(txs);

    renderCashReconciliation(cashReconciliation);
    renderModelEarningsReconciliation(modelReconciliation, manager.selectedPeriod);
    renderDetailedExpenses(detailedExpenses);

    // Показ индикатора кассового разрыва и безопасного Runway
    renderRunwayAlert(cashBalance, totalObligations, contractorsRem, modelRem, chatterRem);
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

  // Автосинхронизация при старте
  const initialGsheetUrl = manager.loadGSheetUrl();
  if (initialGsheetUrl) {
    if (badgeGsheet && manager.transactions.length === 0) {
      badgeGsheet.textContent = '⏳ Загрузка данных из Google Таблицы...';
      badgeGsheet.style.background = 'rgba(56, 189, 248, 0.15)';
      badgeGsheet.style.color = 'var(--primary)';
    }
    manager.syncWithGoogleSheets().then(res => {
      if (res.success) {
        renderAll();
        updateGsheetUI();
      }
    });
  }

  // 🔄 Live Auto-Sync: автоматическое обновление при переключении на вкладку
  async function triggerAutoSync(force = false) {
    const now = Date.now();
    if (!force && (now - lastSyncTime < 10000)) return; // Не чаще чем раз в 10 секунд
    if (manager.loadGSheetUrl()) {
      lastSyncTime = now;
      const res = await manager.syncWithGoogleSheets();
      if (res.success) {
        renderAll();
        updateGsheetUI();
      }
    }
  }

  // Мгновенная синхронизация и перерисовка при клике на вкладку "P&L & Чистая Прибыль"
  const tabFinanceBtn = document.querySelector('.tab-btn[data-tab="tab-finance"]');
  if (tabFinanceBtn) {
    tabFinanceBtn.addEventListener('click', () => {
      renderAll();
      triggerAutoSync(true);
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      triggerAutoSync();
    }
  });
  window.addEventListener('focus', triggerAutoSync);
  setInterval(triggerAutoSync, 90000); // Регулярный поллинг каждые 90 секунд
}
