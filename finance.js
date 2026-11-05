// MIRRORS Financial P&L Engine & Budgeting System (Plan vs Fact)
// Compatible with Vercel Static Hosting & Client-side XLSX export/import

const STORAGE_KEY_TX = 'mirrors_finance_transactions_v1';
const STORAGE_KEY_BUDGET = 'mirrors_finance_budgets_v1';

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

const SEED_TRANSACTIONS = [
  // Ноябрь 2026 (Текущий месяц)
  { id: 1, date: '2026-11-01', type: 'Доход', category: 'OnlyFans Payouts (Выплаты платформы)', amount: 10150, model: 'Lolly (Lollysunnery)', desc: 'Основная выплата за вторую половину октября' },
  { id: 2, date: '2026-11-01', type: 'Расход', category: 'Выплаты моделям (Model Share %)', amount: 5075, model: 'Lolly (Lollysunnery)', desc: 'Доля 50% модели' },
  { id: 3, date: '2026-11-02', type: 'Расход', category: 'Трафик: Reddit & Dating Apps', amount: 1450, model: 'Lolly (Lollysunnery)', desc: 'Закупка аккаунтов и прогрев' },
  { id: 4, date: '2026-11-02', type: 'Доход', category: 'OnlyFans Payouts (Выплаты платформы)', amount: 4600, model: 'Eva Blush', desc: 'Первая выплата ноября' },
  { id: 5, date: '2026-11-02', type: 'Расход', category: 'Выплаты моделям (Model Share %)', amount: 2300, model: 'Eva Blush', desc: '50% модели' },
  { id: 6, date: '2026-11-03', type: 'Расход', category: 'Трафик: TikTok / Reels / Shorts', amount: 1200, model: 'Eva Blush', desc: 'Оплата контент-фермы' },
  { id: 7, date: '2026-11-03', type: 'Расход', category: 'Зарплаты: Чаттеры / Операторы', amount: 2850, model: 'Agency Core (Общие)', desc: 'Аванс чаттерам (Karina, Timur, Paul)' },
  { id: 8, date: '2026-11-04', type: 'Расход', category: 'Софт: Infloww / CreatorHero / CRM', amount: 480, model: 'Agency Core (Общие)', desc: 'Infloww Pro + Dolphin Anty' },
  { id: 9, date: '2026-11-04', type: 'Расход', category: 'Инфраструктура: Прокси, Dolphin, SIM', amount: 320, model: 'Agency Core (Общие)', desc: 'Мобильные прокси США 10 шт' },
  { id: 10, date: '2026-11-04', type: 'Доход', category: 'Платные сообщения (PPV / Chatting)', amount: 3100, model: 'Lolly (1lollyhere)', desc: 'PPV рассылка марафон' },
  { id: 11, date: '2026-11-05', type: 'Расход', category: 'Комиссии: Платежки / Paxum / Вывод', amount: 420, model: 'Agency Core (Общие)', desc: 'Комиссия за вывод в крипту USDT' },
  { id: 12, date: '2026-11-05', type: 'Доход', category: 'Чаевые (Tips) & Кастомы', amount: 1400, model: 'Lila (angelkiss)', desc: 'Кастом от топ-фана' },
  // Октябрь 2026 (Завершенный)
  { id: 13, date: '2026-10-15', type: 'Доход', category: 'OnlyFans Payouts (Выплаты платформы)', amount: 28300, model: 'Agency Core (Общие)', desc: 'Итог октября по всем моделям' },
  { id: 14, date: '2026-10-16', type: 'Расход', category: 'Выплаты моделям (Model Share %)', amount: 14150, model: 'Agency Core (Общие)', desc: 'Выплаты моделям за октябрь' },
  { id: 15, date: '2026-10-18', type: 'Расход', category: 'Трафик: Reddit & Dating Apps', amount: 4800, model: 'Agency Core (Общие)', desc: 'Трафик октябрь' },
  { id: 16, date: '2026-10-20', type: 'Расход', category: 'Зарплаты: Чаттеры / Операторы', amount: 3800, model: 'Agency Core (Общие)', desc: 'Зарплаты чаттеров октябрь' },
  // Сентябрь 2026 (Завершенный)
  { id: 17, date: '2026-09-20', type: 'Доход', category: 'OnlyFans Payouts (Выплаты платформы)', amount: 24500, model: 'Agency Core (Общие)', desc: 'Итог сентября' },
  { id: 18, date: '2026-09-21', type: 'Расход', category: 'Выплаты моделям (Model Share %)', amount: 12250, model: 'Agency Core (Общие)', desc: 'Выплаты моделям' },
  { id: 19, date: '2026-09-22', type: 'Расход', category: 'Трафик: Reddit & Dating Apps', amount: 3900, model: 'Agency Core (Общие)', desc: 'Трафик сентябрь' },
  { id: 20, date: '2026-09-25', type: 'Расход', category: 'Зарплаты: Чаттеры / Операторы', amount: 3400, model: 'Agency Core (Общие)', desc: 'Зарплаты чаттеров' }
];

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

  calculateMetrics(txList = this.getFiltered()) {
    let income = 0;
    let expense = 0;
    let trafficExpense = 0;

    txList.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        income += amt;
      } else if (t.type === 'Расход') {
        expense += amt;
        if (t.category.startsWith('Трафик')) {
          trafficExpense += amt;
        }
      }
    });

    const netProfit = income - expense;
    const netMargin = income > 0 ? (netProfit / income) * 100 : 0;
    const roas = trafficExpense > 0 ? (income / trafficExpense) : 0;

    return { income, expense, netProfit, netMargin, trafficExpense, roas };
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
          const type = r['Тип'] || r['Type'] || 'Расход';
          const category = r['Категория'] || r['Category'] || 'Прочие операционные расходы';
          const amount = parseFloat(r['Сумма ($)'] || r['Сумма'] || r['Amount'] || 0);
          const model = r['Модель/Проект'] || r['Модель'] || r['Model'] || 'Agency Core (Общие)';
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

  function renderKPIs(metrics) {
    const elRev = document.getElementById('fin-kpi-rev');
    const elExp = document.getElementById('fin-kpi-exp');
    const elNet = document.getElementById('fin-kpi-net');
    const elMargin = document.getElementById('fin-kpi-margin');
    const elRoas = document.getElementById('fin-kpi-roas');

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
      stats[m] = { income: 0, traffic: 0, payouts: 0, opex: 0 };
    });

    txs.forEach(t => {
      if (!stats[t.model]) {
        stats[t.model] = { income: 0, traffic: 0, payouts: 0, opex: 0 };
      }
      const amt = Number(t.amount) || 0;
      if (t.type === 'Доход') {
        stats[t.model].income += amt;
      } else {
        if (t.category.startsWith('Трафик')) {
          stats[t.model].traffic += amt;
        } else if (t.category.includes('Выплаты моделям')) {
          stats[t.model].payouts += amt;
        } else {
          stats[t.model].opex += amt;
        }
      }
    });

    tbody.innerHTML = Object.entries(stats).map(([model, data]) => {
      const net = data.income - (data.traffic + data.payouts + data.opex);
      const margin = data.income > 0 ? (net / data.income) * 100 : 0;
      const netColor = net >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)';

      return `
        <tr>
          <td style="font-weight: 700; color: var(--text-main);">${model}</td>
          <td style="font-family: var(--font-mono); color: var(--accent-green);">$${data.income.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); color: var(--accent-rose);">$${data.traffic.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); color: #fbbf24;">$${data.payouts.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); color: var(--text-muted);">$${data.opex.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${netColor};">$${net.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${margin >= 30 ? 'var(--accent-green)' : 'var(--text-muted)'};">${margin.toFixed(1)}%</td>
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

  function renderAll() {
    const txs = manager.getFiltered();
    const metrics = manager.calculateMetrics(txs);
    const budgets = manager.calculateBudgetsProgress(txs);

    renderKPIs(metrics);
    renderBudgets(budgets);
    renderUnitEconomics(txs);
    renderTransactionsTable(txs);
    renderCharts(txs);
  }

  // Initial Run
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('finance-tx-date');
  if (dateInput) dateInput.value = today;

  renderAll();
}
