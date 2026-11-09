// MIRRORS Financial P&L Engine & Budgeting System (Plan vs Fact)
// Compatible with Vercel Static Hosting & Client-side XLSX export/import

const STORAGE_KEY_TX = 'mirrors_finance_transactions_v2';
const STORAGE_KEY_BUDGET = 'mirrors_finance_budgets_v2';
const STORAGE_KEY_GSHEET_URL = 'mirrors_finance_gsheet_url_v1';

export const FINANCE_INCOME_CATS = [
  'OnlyFans Payouts (Выплаты платформы)',
  'Платные сообщения (PPV / Chatting)',
  'Чаевые (Tips) & Кастомы',
  'Внешняя реклама / Sponsorships',
  'Прочий доход'
];

export const FINANCE_EXPENSE_CATS = [
  'Трафик: Reddit & Dating Apps',
  'Трафик: TikTok / Reels / Shorts',
  'Трафик: Twitter / X Promo',
  'Зарплаты: Чаттеры / Операторы',
  'Зарплаты: Тимлиды / Баеры',
  'Выплаты моделям (Model Share %)',
  'Софт: Infloww / CreatorHero / CRM',
  'Инфраструктура: Прокси, Dolphin, SIM',
  'Комиссии: Платежки / Paxum / Вывод',
  'Прочие операционные расходы'
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
  'Софт и Инфраструктура': 1200,
  'Комиссии и Обнал': 900,
  'Выплаты Моделям': 18000
};

export const CONTRACTOR_SCHEDULE = [
  {
    id: 'osckelly',
    name: '@osckelly (Оскар) — OFTV',
    role: 'Сценарии, монтаж, выгрузка контента на платформу',
    terms: '350 USDT / месяц (4 сценария). Аванс 175 в начале + 175 закрытие с авансом след. круга',
    dueDateStr: '28 ноября 2026',
    defaultAmount: 350,
    model: 'Agency Core (Общие)',
    category: 'Трафик: TikTok / Reels / Shorts',
    warning: '⚠️ Проверить отгрузку 4 сценариев перед выплатой вторых 175 USDT! (Посл. выплата: 28.10.2026)',
    urgencyColor: 'var(--accent-rose)',
    urgencyBadge: 'Обязательство 28-го'
  },
  {
    id: 'killerleon',
    name: '@KillerLe0n (Леон) — SFS',
    role: 'SFS трафик на всех анкетах с SFS',
    terms: '0.4$ / фанат. Оплата по факту месяца в первых числах (1-5) по сверке',
    dueDateStr: '1–5 числа месяца',
    defaultAmount: 580,
    model: 'Agency Core (Общие)',
    category: 'Трафик: Reddit & Dating Apps',
    warning: '🟢 Окупаемость хорошая. Оплачивать строго после первого понедельничного вывода OF!',
    urgencyColor: 'var(--accent-green)',
    urgencyBadge: 'По сверке (1–5 число)'
  },
  {
    id: 'aneskagency',
    name: '@aneskagency (Анастасия) — FYP',
    role: 'FYP продвижение и закупка трафика',
    terms: '250 USDT / месяц на анкету. Оплата раз в две недели вперед',
    dueDateStr: 'Раз в 2 недели вперед',
    defaultAmount: 250,
    model: 'Agency Core (Общие)',
    category: 'Трафик: TikTok / Reels / Shorts',
    warning: '🔵 Предоплата вперед на 2 недели. Оплачивать сразу после понедельничного вывода.',
    urgencyColor: 'var(--primary)',
    urgencyBadge: 'Предоплата 2 недели'
  },
  {
    id: 'crm_monster',
    name: 'OnlyMonster CRM',
    role: 'Основная CRM-система учета смен, чаттеров и фанов',
    terms: 'Ежемесячная подписка на софт агентства',
    dueDateStr: '2 число каждого месяца',
    defaultAmount: 180,
    model: 'Agency Core (Общие)',
    category: 'Софт: Infloww / CreatorHero / CRM',
    warning: '🟣 Критическая подписка. Оплачивать с последнего понедельника прошлого месяца.',
    urgencyColor: 'var(--accent-purple)',
    urgencyBadge: 'Подписка 2-го числа'
  },
  {
    id: 'payouts_15_31',
    name: 'Модели & Чаттеры (Аванс / Итог)',
    role: 'Доля моделей (25%) и зарплаты чаттеров/операторов (20%)',
    terms: 'Модели: 25% | Чаттеры: 20% (Аванс 15-го числа | Окончательный расчет 31-го числа)',
    dueDateStr: '15 и 31 числа каждого месяца',
    defaultAmount: 0,
    model: 'Все модели',
    category: 'Выплаты моделям (Model Share %)',
    warning: '🔒 Неприкасаемый фонд (суммарно 45% от вала). Накапливается из еженедельных понедельничных выводов.',
    urgencyColor: 'var(--accent-amber)',
    urgencyBadge: '15 и 31 числа'
  }
];

const SEED_TRANSACTIONS = [];

class FinanceManager {
  constructor() {
    this.transactions = this.loadTransactions();
    this.budgets = this.loadBudgets();
    this.selectedPeriod = 'all'; // 'all', '2026-11', '2026-10', '2026-09'
    this.selectedModel = 'all';
  }

  loadTransactions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TX);
      if (stored) {
        return JSON.parse(stored);
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
        this.transactions = data.transactions;
        this.saveTransactions();
        return { success: true, count: data.transactions.length };
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

  deleteTransaction(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.saveTransactions();
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

    txList.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        income += amt;
      } else if (t.type === 'Расход') {
        expense += amt;
        if (t.category.startsWith('Трафик')) {
          trafficExpense += amt;
        }
        if (t.category.includes('Чаттеры') || t.category.includes('Операторы')) {
          chatterExpense += amt;
        }
      }
    });

    const netProfit = income - expense;
    const netMargin = income > 0 ? (netProfit / income) * 100 : 0;
    const roas = trafficExpense > 0 ? (income / trafficExpense) : 0;

    return { income, expense, netProfit, netMargin, trafficExpense, chatterExpense, roas };
  }

  mapCategoryToBudgetGroup(cat) {
    if (cat.startsWith('Трафик')) return 'Трафик и Маркетинг';
    if (cat.startsWith('Зарплаты')) return 'Зарплаты Чаттеров & Команды';
    if (cat.includes('Софт') || cat.includes('Инфраструктура')) return 'Софт и Инфраструктура';
    if (cat.includes('Комиссии')) return 'Комиссии и Обнал';
    if (cat.includes('Выплаты моделям')) return 'Выплаты Моделям';
    return null;
  }

  calculateBudgetsProgress(txList = this.getFiltered()) {
    const actuals = {
      'Трафик и Маркетинг': 0,
      'Зарплаты Чаттеров & Команды': 0,
      'Софт и Инфраструктура': 0,
      'Комиссии и Обнал': 0,
      'Выплаты Моделям': 0
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

    if (!amount || Number(amount) <= 0) {
      alert('Укажите корректную сумму операции.');
      return;
    }

    manager.addTransaction({ date, type, category, amount, model, desc });
    formAddTx.reset();
    updateCategoryDropdown('Расход');
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('finance-tx-date');
    if (dateInput) dateInput.value = today;

    renderAll();
    showToast('✅ Финансовая операция добавлена!');
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

  function renderKPIs(metrics, cashBalance = 0) {
    const elCash = document.getElementById('fin-kpi-cash-balance');
    const elRev = document.getElementById('fin-kpi-rev');
    const elExp = document.getElementById('fin-kpi-exp');
    const elNet = document.getElementById('fin-kpi-net');
    const elMargin = document.getElementById('fin-kpi-margin');
    const elRoas = document.getElementById('fin-kpi-roas');

    if (elCash) {
      elCash.textContent = `$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      elCash.style.color = cashBalance >= 0 ? '#34d399' : 'var(--accent-rose)';
    }

    if (elRev) elRev.textContent = `$${metrics.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elExp) elExp.textContent = `$${metrics.expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    if (elNet) {
      elNet.textContent = `$${metrics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      elNet.style.color = metrics.netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)';
    }

    if (elMargin) {
      elMargin.textContent = `${metrics.netMargin.toFixed(1)}%`;
      elMargin.style.color = metrics.netMargin >= 30 ? 'var(--accent-green)' : (metrics.netMargin > 0 ? 'var(--accent-amber)' : 'var(--accent-rose)');
    }

    if (elRoas) {
      elRoas.textContent = `${metrics.roas.toFixed(2)}x`;
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
        const id = Number(btn.dataset.id);
        if (confirm('Удалить эту операцию?')) {
          manager.deleteTransaction(id);
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

  function renderContractorsRunway() {
    const container = document.getElementById('fin-contractors-runway');
    if (!container) return;

    container.innerHTML = CONTRACTOR_SCHEDULE.map(c => {
      const isAuto = c.defaultAmount === 0;
      const amountStr = isAuto ? 'По факту продаж' : `$${c.defaultAmount.toLocaleString()} USDT`;

      return `
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; font-size: 14px; color: var(--text-main);">${c.name}</span>
              <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; background: rgba(255, 255, 255, 0.06); color: ${c.urgencyColor}; border: 1px solid ${c.urgencyColor};">
                ${c.urgencyBadge}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-main); font-size: 13px;">${amountStr}</span>
              <button class="btn-action btn-primary btn-pay-contractor" data-id="${c.id}" style="padding: 4px 10px; font-size: 11px;">
                ⚡ Оплатить
              </button>
            </div>
          </div>

          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">
            <strong>Условия:</strong> ${c.terms}
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
        const c = CONTRACTOR_SCHEDULE.find(item => item.id === id);
        if (!c) return;

        const defaultVal = c.defaultAmount > 0 ? c.defaultAmount : 1500;
        const inputVal = prompt(`Внести выплату для ${c.name}\nУкажите сумму ($):`, defaultVal);
        if (inputVal && parseFloat(inputVal) > 0) {
          const amt = parseFloat(inputVal);
          manager.addTransaction({
            date: new Date().toISOString().split('T')[0],
            type: 'Расход',
            category: c.category,
            amount: amt,
            model: c.model,
            desc: `Выплата: ${c.name} (${c.dueDateStr})`
          });
          renderAll();
          showToast(`✅ Выплата ${c.name} ($${amt}) внесена в расход!`);
        }
      });
    });
  }

  let userOverrodePayout = false;

  function renderRunwayAlert(cashBalance, remainingLiabilities) {
    const alertContainer = document.getElementById('fin-runway-alert');
    if (!alertContainer) return;

    // Подрядчики фикс (Оскар 350 + Анастасия 250 + CRM 135 + Леон ~1200)
    const contractorsDue = 350 + 250 + 135 + 1200; // $1,935
    const modelsRem = remainingLiabilities?.modelsRemaining || 0;
    const chattersRem = remainingLiabilities?.chattersRemaining || 0;
    const totalShortTermDue = contractorsDue + modelsRem + chattersRem;
    const gap = cashBalance - totalShortTermDue;

    if (gap >= 0) {
      alertContainer.innerHTML = `
        <div style="background: rgba(52, 211, 153, 0.08); border: 1px solid var(--accent-green); border-radius: var(--radius-sm); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🟢</span>
            <div>
              <div style="font-weight: 700; color: var(--accent-green); font-size: 14px;">Безопасный Runway: Касса полностью покрывает все ближайшие обязательства</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                В кассе: <strong style="color: var(--text-main);">$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> | Обязательства недели (Подрядчики: $${contractorsDue.toLocaleString()}, Долг моделям: $${modelsRem.toLocaleString()}, Чаттерам: $${chattersRem.toLocaleString()}): <strong style="color: var(--primary);">$${totalShortTermDue.toLocaleString()}</strong>
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-weight: 800; font-size: 16px; color: var(--accent-green);">
              Запас кассы: +$${gap.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Риска кассового разрыва нет</div>
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
                В кассе: <strong style="color: var(--text-main);">$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> | Обязательства: <strong style="color: var(--accent-rose);">$${totalShortTermDue.toLocaleString()}</strong> (Подрядчики: $${contractorsDue.toLocaleString()}, Долг моделям/чаттерам: $${(modelsRem + chattersRem).toLocaleString()})
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-weight: 800; font-size: 16px; color: var(--accent-rose);">
              Дефицит: -$${Math.abs(gap).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">Дождитесь понедельничного вывода OnlyFans!</div>
          </div>
        </div>
      `;
    }
  }

  function calculateAndRenderSplit(txs, metrics) {
    const inputPayout = document.getElementById('split-input-payout');
    const inputTrafficPlan = document.getElementById('split-traffic-plan-input');
    const elModels = document.getElementById('split-res-models');
    const elModelsPaid = document.getElementById('split-models-paid');
    const elModelsRemaining = document.getElementById('split-models-remaining');
    const elChatters = document.getElementById('split-res-chatters');
    const elChattersPaid = document.getElementById('split-chatters-paid');
    const elChattersRemaining = document.getElementById('split-chatters-remaining');
    const elTraffic = document.getElementById('split-res-traffic');
    const elTrafficVariance = document.getElementById('split-traffic-variance');
    const elProfit = document.getElementById('split-res-profit');
    const syncBadge = document.getElementById('split-sync-badge');

    if (!inputPayout) return { modelsRemaining: 0, chattersRemaining: 0 };

    // Если пользователь вручную не вводил прогнозную сумму, синхронизируем с реальной выручкой из кассы
    if (!userOverrodePayout) {
      inputPayout.value = Math.round(metrics.income) || 0;
      if (syncBadge) {
        syncBadge.textContent = '● Синхронизировано';
        syncBadge.style.color = 'var(--accent-green)';
        syncBadge.style.background = 'rgba(52, 211, 153, 0.12)';
      }
    } else {
      if (syncBadge) {
        syncBadge.textContent = '✎ Ручной ввод (прогноз)';
        syncBadge.style.color = 'var(--accent-amber)';
        syncBadge.style.background = 'rgba(251, 191, 36, 0.12)';
      }
    }

    const payout = parseFloat(inputPayout.value) || 0;

    // Подсчитываем реальные выплаты из транзакций
    let modelsPaid = 0;
    let chattersPaid = 0;
    let trafficFact = 0;
    let otherOpex = 0;

    txs.forEach(t => {
      if (t.type === 'Расход') {
        const amt = Number(t.amount) || 0;
        if (t.category.includes('Выплаты моделям')) {
          modelsPaid += amt;
        } else if (t.category.includes('Чаттеры') || t.category.includes('Операторы')) {
          chattersPaid += amt;
        } else if (t.category.startsWith('Трафик')) {
          trafficFact += amt;
        } else {
          otherOpex += amt;
        }
      }
    });

    // Начисления по финансовой модели: Модели 25%, Чаттеры 20%
    const modelsDueTotal = Math.round(payout * 0.25);
    const modelsRemaining = Math.max(0, modelsDueTotal - modelsPaid);

    const chattersDueTotal = Math.round(payout * 0.20);
    const chattersRemaining = Math.max(0, chattersDueTotal - chattersPaid);

    // Бюджет по трафику (+- 0)
    const trafficPlan = parseFloat(inputTrafficPlan?.value) || 8500;
    const trafficDelta = trafficPlan - trafficFact;

    let trafficVarianceText = '⚖️ ±$0 (В нуле)';
    let trafficVarianceColor = 'var(--text-main)';

    if (Math.abs(trafficDelta) < 10) {
      trafficVarianceText = '⚖️ ±$0 (В нуле — бюджет освоен точно)';
      trafficVarianceColor = 'var(--text-main)';
    } else if (trafficDelta > 0) {
      trafficVarianceText = `🟢 В запасе: +$${Math.round(trafficDelta).toLocaleString()} (из $${trafficPlan.toLocaleString()})`;
      trafficVarianceColor = 'var(--accent-green)';
    } else {
      trafficVarianceText = `🔴 Перерасход: превышение на -$${Math.round(Math.abs(trafficDelta)).toLocaleString()}`;
      trafficVarianceColor = 'var(--accent-rose)';
    }

    // Чистый профит агентства (55% от вала за вычетом трафика и опекса)
    const profitBuffer = Math.round(payout - modelsDueTotal - chattersDueTotal - trafficFact - otherOpex);

    // Обновляем DOM
    if (elModels) elModels.textContent = `$${modelsDueTotal.toLocaleString()}`;
    if (elModelsPaid) elModelsPaid.textContent = `$${modelsPaid.toLocaleString()}`;
    if (elModelsRemaining) {
      elModelsRemaining.textContent = `$${modelsRemaining.toLocaleString()}`;
      elModelsRemaining.style.color = modelsRemaining > 0 ? '#fbbf24' : 'var(--accent-green)';
    }

    if (elChatters) elChatters.textContent = `$${chattersDueTotal.toLocaleString()}`;
    if (elChattersPaid) elChattersPaid.textContent = `$${chattersPaid.toLocaleString()}`;
    if (elChattersRemaining) {
      elChattersRemaining.textContent = `$${chattersRemaining.toLocaleString()}`;
      elChattersRemaining.style.color = chattersRemaining > 0 ? '#38bdf8' : 'var(--accent-green)';
    }

    if (elTraffic) elTraffic.textContent = `$${trafficFact.toLocaleString()}`;
    if (elTrafficVariance) {
      elTrafficVariance.textContent = trafficVarianceText;
      elTrafficVariance.style.color = trafficVarianceColor;
    }

    if (elProfit) {
      elProfit.textContent = `$${profitBuffer.toLocaleString()}`;
      elProfit.style.color = profitBuffer >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)';
    }

    return { modelsRemaining, chattersRemaining };
  }

  function setupLiveSplitCalculator() {
    const inputPayout = document.getElementById('split-input-payout');
    const btnUseActual = document.getElementById('btn-split-use-actual');
    const inputTrafficPlan = document.getElementById('split-traffic-plan-input');

    inputPayout?.addEventListener('input', () => {
      userOverrodePayout = true;
      const txs = manager.getFiltered();
      const metrics = manager.calculateMetrics(txs);
      const remaining = calculateAndRenderSplit(txs, metrics);
      const cashBalance = manager.calculateCashBalance();
      renderRunwayAlert(cashBalance, remaining);
    });

    btnUseActual?.addEventListener('click', () => {
      userOverrodePayout = false;
      const txs = manager.getFiltered();
      const metrics = manager.calculateMetrics(txs);
      const remaining = calculateAndRenderSplit(txs, metrics);
      const cashBalance = manager.calculateCashBalance();
      renderRunwayAlert(cashBalance, remaining);
      showToast('⚡ Сплит синхронизирован с реальной выручкой из кассы!');
    });

    inputTrafficPlan?.addEventListener('input', () => {
      const txs = manager.getFiltered();
      const metrics = manager.calculateMetrics(txs);
      const remaining = calculateAndRenderSplit(txs, metrics);
      const cashBalance = manager.calculateCashBalance();
      renderRunwayAlert(cashBalance, remaining);
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

    renderKPIs(metrics, cashBalance);
    renderBudgets(budgets);
    renderUnitEconomics(txs);
    renderTransactionsTable(txs);
    renderCharts(txs);
    renderContractorsRunway();

    // Синхронизация сплита и показ индикатора кассового разрыва
    const remaining = calculateAndRenderSplit(txs, metrics);
    renderRunwayAlert(cashBalance, remaining);
  }

  // Initial Run
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('finance-tx-date');
  if (dateInput) dateInput.value = today;

  setupLiveSplitCalculator();
  updateGsheetUI();
  renderAll();

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
  let lastSyncTime = 0;
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
