import { availableMonths, initialConfig, initialModels, initialKPISettings, initialChatterWeekly, initialModelWeekly } from './data.js';

// Application State
const state = {
  months: [...availableMonths],
  selectedMonthKey: '2026-08',
  config: [...initialConfig],
  models: [...initialModels],
  kpiSettings: [...initialKPISettings],
  chatterWeekly: [...initialChatterWeekly],
  modelWeekly: [...initialModelWeekly],
  selectedChatter: 'paul',
  selectedModelId: '39856'
};

// Date calculations per Month
function getDaysInfo(monthKey) {
  const monthObj = state.months.find(m => m.key === monthKey) || state.months[0];
  
  let daysPassed = monthObj.daysPassed || 12;
  let daysInMonth = monthObj.totalDays || 31;
  let reportDateStr = monthObj.label;

  if (monthObj.isCurrent) {
    reportDateStr = `1–${daysPassed} Августа 2026 (Факт ${daysPassed} дн.)`;
  }

  return { daysPassed, daysInMonth, reportDateStr, isCurrent: monthObj.isCurrent };
}

// Helpers
function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val || 0);
}

function formatPercent(val) {
  return `${(val || 0).toFixed(2)}%`;
}

function formatNumber(val) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val || 0);
}

// Calculate Model Summaries for selected month
function getModelSummaries() {
  const { daysPassed, daysInMonth } = getDaysInfo(state.selectedMonthKey);

  return state.models.map(m => {
    const weeklyRecords = state.modelWeekly.filter(mw => 
      mw.accountId === m.accountId && 
      (mw.monthKey === state.selectedMonthKey || !mw.monthKey)
    );
    let factRevenue = weeklyRecords.reduce((acc, r) => acc + (r.totalRevenue || 0), 0);
    
    const crmRecord = weeklyRecords[0] || {};
    const runRate = crmRecord.runRate ? crmRecord.runRate : (daysPassed > 0 ? (factRevenue / daysPassed) * daysInMonth : 0);
    const goalProgressPct = crmRecord.goalProgressPct ? crmRecord.goalProgressPct : (m.plan > 0 ? (factRevenue / m.plan) * 100 : 0);

    const cfg = state.config.find(c => c.id === m.accountId);
    const assignedChatters = cfg && cfg.chatters.length > 0 ? cfg.chatters.join(', ') : '—';

    return {
      id: m.id,
      name: m.name,
      plan: m.plan,
      totalBonusPool: m.totalBonusPool,
      teamBonusPool: m.teamBonusPool,
      kpiBonusPool: m.kpiBonusPool,
      teamPct: m.teamPct,
      totalRevenue: factRevenue,
      runRate,
      goalProgressPct,
      goalStatusPct: crmRecord.goalStatusPct || (goalProgressPct - (daysPassed / daysInMonth * 100)),
      newFans: crmRecord.newFans || 0,
      spenders: crmRecord.spenders || 0,
      conversion: crmRecord.conversion || 0,
      apv: crmRecord.apv || 0,
      arppu: crmRecord.arppu || 0,
      assignedChatters
    };
  });
}

// Calculate Chatter Breakdown for selected month
function getChatterBreakdown() {
  const { daysPassed, daysInMonth } = getDaysInfo(state.selectedMonthKey);

  return state.kpiSettings.map(kpi => {
    const cfg = state.config.find(c => c.modelName === kpi.model);
    const accountId = cfg ? cfg.id : null;

    const records = state.chatterWeekly.filter(cw => 
      cw.chatter.trim().toLowerCase() === kpi.chatter.trim().toLowerCase() && 
      (!accountId || cw.accountId === accountId) &&
      (cw.monthKey === state.selectedMonthKey || !cw.monthKey)
    );

    const factSales = records.reduce((acc, r) => acc + (r.totalSales || 0), 0);
    const completionPct = kpi.targetPlan > 0 ? (factSales / kpi.targetPlan) * 100 : 0;
    const runRate = daysPassed > 0 ? (factSales / daysPassed) * daysInMonth : 0;
    const forecast = runRate;
    const isGoalAchieved = factSales >= kpi.targetPlan;

    // Actual CRM metrics
    const latestRec = records[0] || {};
    const openRate = latestRec.openRate || 0;
    const avgPriceSold = latestRec.avgPriceSold || 0;
    const trt = latestRec.trt || 0;

    return {
      chatter: kpi.chatter,
      model: kpi.model,
      targetPlan: kpi.targetPlan,
      factSales,
      completionPct,
      runRate,
      forecast,
      isGoalAchieved,
      targetOpenRate: kpi.targetOpenRate,
      openRate,
      targetAvgPrice: kpi.targetAvgPrice,
      avgPriceSold,
      targetTRT: kpi.targetTRT,
      trt
    };
  });
}

// Render Month Selector & Header Badges
function renderHeaderInfo() {
  const { daysPassed, daysInMonth, reportDateStr } = getDaysInfo(state.selectedMonthKey);
  
  const selectMonth = document.getElementById('select-month-picker');
  if (selectMonth) {
    selectMonth.innerHTML = state.months.map(m => `
      <option value="${m.key}" ${m.key === state.selectedMonthKey ? 'selected' : ''}>${m.label}</option>
    `).join('');
  }

  document.getElementById('header-report-date').textContent = reportDateStr;
  document.getElementById('header-days-passed').textContent = `${daysPassed} дн. (1–${daysPassed} Авг)`;
  document.getElementById('header-days-in-month').textContent = `${daysInMonth} дн.`;

  const cardTitleEl = document.getElementById('dash-card-title-revenue');
  if (cardTitleEl) {
    cardTitleEl.textContent = `Общая Выручка (1–${daysPassed} Августа)`;
  }
  const cardSubtextEl = document.getElementById('dash-card-subtext-revenue');
  if (cardSubtextEl) {
    cardSubtextEl.textContent = `Фактическая сумма за ${daysPassed} дн. по всем моделям`;
  }
}

// Render Main Dashboard Tab
function renderMainDashboard() {
  const models = getModelSummaries();
  const chatters = getChatterBreakdown();

  // Summary Metrics
  const grandPlan = models.reduce((acc, m) => acc + m.plan, 0);
  const grandFact = models.reduce((acc, m) => acc + m.totalRevenue, 0);
  const grandRunRate = models.reduce((acc, m) => acc + m.runRate, 0);

  document.getElementById('dash-grand-fact').textContent = formatCurrency(grandFact);
  document.getElementById('dash-grand-plan').textContent = formatCurrency(grandPlan);
  document.getElementById('dash-grand-pct').textContent = formatPercent((grandFact / grandPlan) * 100);
  document.getElementById('dash-grand-runrate').textContent = formatCurrency(grandRunRate);

  // Model Summary Cards Grid
  const modelCardsGrid = document.getElementById('model-cards-summary-grid');
  if (modelCardsGrid) {
    modelCardsGrid.innerHTML = models.map(m => `
      <div class="glass-card">
        <div class="card-header">
          <div style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">
            👑 ${m.name}
          </div>
          <span class="badge ${m.goalStatusPct >= 0 ? 'badge-on-schedule' : 'badge-behind'}">
            ${m.goalStatusPct >= 0 ? '🟢 В графике (+' + m.goalStatusPct.toFixed(1) + '%)' : '🔴 Отстаём (' + m.goalStatusPct.toFixed(1) + '%)'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; font-size: 13px;">
          <div>
            <div style="color: var(--text-muted);">Model Plan ($):</div>
            <div style="font-weight: 700; font-size: 16px; color: var(--text-main);">${formatCurrency(m.plan)}</div>
          </div>
          <div>
            <div style="color: var(--text-muted);">Total Revenue (1-7 Авг):</div>
            <div style="font-weight: 700; font-size: 16px; color: var(--accent-green);">${formatCurrency(m.totalRevenue)}</div>
          </div>
          <div>
            <div style="color: var(--text-muted);">Run Rate ($/месяц):</div>
            <div style="font-weight: 600; color: var(--primary);">${formatCurrency(m.runRate)}</div>
          </div>
          <div>
            <div style="color: var(--text-muted);">Goal Progress (%):</div>
            <div style="font-weight: 600; color: var(--accent-amber);">${formatPercent(m.goalProgressPct)}</div>
          </div>
        </div>

        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
          <span>New Fans: <strong style="color: var(--text-main);">${m.newFans}</strong></span>
          <span>Spenders: <strong style="color: var(--text-main);">${m.spenders}</strong></span>
          <span>ARPPU: <strong style="color: var(--primary);">$${m.arppu.toFixed(2)}</strong></span>
        </div>
      </div>
    `).join('');
  }

  // Model Summary Table
  const modelTableBody = document.getElementById('model-summary-table-body');
  modelTableBody.innerHTML = models.map(m => `
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${m.name}</td>
      <td class="num-cell">${formatCurrency(m.plan)}</td>
      <td class="num-cell highlight-val">${formatCurrency(m.totalRevenue)}</td>
      <td class="num-cell" style="color: var(--primary);">${formatCurrency(m.runRate)}</td>
      <td class="num-cell">
        <span class="badge ${m.goalProgressPct >= 30 ? 'badge-on-schedule' : (m.goalProgressPct >= 20 ? 'badge-amber' : 'badge-behind')}">
          ${formatPercent(m.goalProgressPct)}
        </span>
      </td>
      <td class="num-cell" style="color: var(--accent-amber);">${formatCurrency(m.totalBonusPool)}</td>
      <td style="font-size: 13px; color: var(--text-muted);">${m.assignedChatters}</td>
    </tr>
  `).join('');

  // Chatter KPI Settings Table
  const kpiTableBody = document.getElementById('kpi-settings-table-body');
  kpiTableBody.innerHTML = state.kpiSettings.map(k => `
    <tr>
      <td style="font-weight: 700;">${k.chatter}</td>
      <td><span class="badge badge-purple">${k.model}</span></td>
      <td class="num-cell">${formatPercent(k.targetOpenRate)}</td>
      <td class="num-cell">$${k.targetAvgPrice}</td>
      <td class="num-cell">${k.targetTRT} sec</td>
      <td class="num-cell highlight-val">${formatCurrency(k.targetPlan)}</td>
    </tr>
  `).join('');

  // Chatter Performance Table
  const chatterTableBody = document.getElementById('chatter-perf-table-body');
  chatterTableBody.innerHTML = chatters.map(c => `
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${c.chatter}</td>
      <td><span class="badge badge-purple">${c.model}</span></td>
      <td class="num-cell">${formatCurrency(c.targetPlan)}</td>
      <td class="num-cell highlight-val">${formatCurrency(c.factSales)}</td>
      <td>
        <span class="badge ${c.completionPct >= 30 ? 'badge-on-schedule' : 'badge-behind'}">
          ${formatPercent(c.completionPct)} (7 дн)
        </span>
      </td>
      <td class="num-cell">${formatPercent(c.openRate)} (Цель ${formatPercent(c.targetOpenRate)})</td>
      <td class="num-cell">$${c.avgPriceSold.toFixed(2)} (Цель $${c.targetAvgPrice})</td>
      <td class="num-cell">${Math.round(c.trt)}s (Цель ${c.targetTRT}s)</td>
      <td class="num-cell" style="color: var(--primary); font-weight: 600;">${formatCurrency(c.forecast)}</td>
    </tr>
  `).join('');
}

// Render Chatter Weekly Dynamics
function renderChatterWeeklyDynamics() {
  const select = document.getElementById('select-chatter-weekly');
  
  const uniqueChatters = Array.from(new Set(state.kpiSettings.map(k => k.chatter)));
  select.innerHTML = uniqueChatters.map(c => `
    <option value="${c}" ${c === state.selectedChatter ? 'selected' : ''}>${c}</option>
  `).join('');

  const currentChatter = select.value || state.selectedChatter;
  const records = state.chatterWeekly.filter(w => 
    w.chatter.trim().toLowerCase() === currentChatter.trim().toLowerCase() &&
    (w.monthKey === state.selectedMonthKey || !w.monthKey)
  );

  function getVal(wName, key) {
    const rec = records.find(r => r.week === wName);
    return rec ? (rec[key] || 0) : 0;
  }

  function getAvg(key) {
    const vals = records.map(r => r[key] || 0).filter(v => v > 0);
    return vals.length > 0 ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
  }

  function getSum(key) {
    return records.reduce((a,r) => a + (r[key] || 0), 0);
  }

  const metricsConfig = [
    { label: 'Total Sales ($)', key: 'totalSales', isCurrency: true, isSum: true },
    { label: 'PPV Sales ($)', key: 'ppvSales', isCurrency: true, isSum: true },
    { label: 'Tips ($)', key: 'tips', isCurrency: true, isSum: true },
    { label: 'Total Messages', key: 'messages', isNum: true, isSum: true },
    { label: 'Free Media Sent', key: 'freeMedia', isNum: true, isSum: true },
    { label: 'PPV Sent', key: 'ppvSent', isNum: true, isSum: true },
    { label: 'PPV Sold', key: 'ppvSold', isNum: true, isSum: true },
    { label: 'Total Chats', key: 'chats', isNum: true, isSum: true },
    { label: 'Words Sent', key: 'words', isNum: true, isSum: true },
    { label: 'Avg. Response Time (sec)', key: 'trt', isNum: true, isSum: false },
    { label: 'Avg. PPV Purchase ($)', key: 'avgPPV', isCurrency: true, isSum: false },
    { label: 'PPV Open Rate (%)', key: 'openRate', isPct: true, isSum: false },
    { label: 'Avg. Price Sent ($)', key: 'avgPriceSent', isCurrency: true, isSum: false },
    { label: 'Avg. Price Sold ($)', key: 'avgPriceSold', isCurrency: true, isSum: false }
  ];

  const tbody = document.getElementById('chatter-weekly-table-body');
  tbody.innerHTML = metricsConfig.map(m => {
    const w1 = getVal('Week 1', m.key);
    const w2 = getVal('Week 2', m.key);
    const w3 = getVal('Week 3', m.key);
    const w4 = getVal('Week 4', m.key);
    const totAvg = m.isSum ? getSum(m.key) : getAvg(m.key);

    const fmt = (v) => {
      if (m.isCurrency) return formatCurrency(v);
      if (m.isPct) return formatPercent(v);
      return formatNumber(v);
    };

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-main);">${m.label}</td>
        <td class="num-cell">${fmt(w1)}</td>
        <td class="num-cell">${w2 ? fmt(w2) : '—'}</td>
        <td class="num-cell">${w3 ? fmt(w3) : '—'}</td>
        <td class="num-cell">${w4 ? fmt(w4) : '—'}</td>
        <td class="num-cell highlight-val">${fmt(totAvg)}</td>
      </tr>
    `;
  }).join('');
}

// Render Model Weekly Dynamics
function renderModelWeeklyDynamics() {
  const select = document.getElementById('select-model-weekly');

  select.innerHTML = state.models.map(m => `
    <option value="${m.accountId}" ${m.accountId === state.selectedModelId ? 'selected' : ''}>${m.name}</option>
  `).join('');

  const currentAccId = select.value || state.selectedModelId;
  const records = state.modelWeekly.filter(w => 
    w.accountId === currentAccId && 
    (w.monthKey === state.selectedMonthKey || !w.monthKey)
  );

  const getVal = (wName, key) => {
    const rec = records.find(r => r.week === wName);
    return rec ? (rec[key] || 0) : 0;
  };

  const getSum = (key) => records.reduce((a,r) => a + (r[key] || 0), 0);
  const getAvg = (key) => {
    const vals = records.map(r => r[key] || 0).filter(v => v > 0);
    return vals.length > 0 ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
  };

  const metricsConfig = [
    { label: 'Total Revenue ($)', key: 'totalRevenue', isCurrency: true, isSum: true },
    { label: 'Revenue from New Fans ($)', key: 'newFanRev', isCurrency: true, isSum: true },
    { label: 'Revenue from Existing Fans ($)', key: 'existFanRev', isCurrency: true, isSum: true },
    { label: 'Monthly Revenue Run Rate ($)', key: 'runRate', isCurrency: true, isSum: false },
    { label: '30-Days Revenue Run Rate ($)', key: 'thirtyDayRunRate', isCurrency: true, isSum: false },
    { label: 'Goal Progress (%)', key: 'goalProgressPct', isPct: true, isSum: false },
    { label: 'Goal Status (%)', key: 'goalStatusPct', isPct: true, isSum: false },
    { label: 'New Fans Count', key: 'newFans', isNum: true, isSum: true },
    { label: 'Sales Revenue ($)', key: 'salesRev', isCurrency: true, isSum: true },
    { label: 'PPV Revenue ($)', key: 'ppvRev', isCurrency: true, isSum: true },
    { label: 'Tips Revenue ($)', key: 'tipsRev', isCurrency: true, isSum: true },
    { label: 'Posts Revenue ($)', key: 'postsRev', isCurrency: true, isSum: true },
    { label: 'Monthly Subs Run Rate', key: 'monthlySubRunRate', isNum: true, isSum: true },
    { label: 'Total Spenders', key: 'spenders', isNum: true, isSum: true },
    { label: 'New Spenders', key: 'newSpenders', isNum: true, isSum: true },
    { label: 'Conversion (%)', key: 'conversion', isPct: true, isSum: false },
    { label: 'Transactions', key: 'transactions', isNum: true, isSum: true },
    { label: 'APC (Avg Purchase Count)', key: 'apc', isNum: true, isSum: false },
    { label: 'APV (Avg Purchase Value)', key: 'apv', isCurrency: true, isSum: false },
    { label: 'ARPPU ($)', key: 'arppu', isCurrency: true, isSum: false }
  ];

  const tbody = document.getElementById('model-weekly-table-body');
  tbody.innerHTML = metricsConfig.map(m => {
    const w1 = getVal('Week 1', m.key);
    const w2 = getVal('Week 2', m.key);
    const w3 = getVal('Week 3', m.key);
    const w4 = getVal('Week 4', m.key);
    const totAvg = m.isSum ? getSum(m.key) : getAvg(m.key);

    const fmt = (v) => {
      if (m.isCurrency) return formatCurrency(v);
      if (m.isPct) return formatPercent(v);
      return formatNumber(v);
    };

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-main);">${m.label}</td>
        <td class="num-cell">${fmt(w1)}</td>
        <td class="num-cell">${w2 ? fmt(w2) : '—'}</td>
        <td class="num-cell">${w3 ? fmt(w3) : '—'}</td>
        <td class="num-cell">${w4 ? fmt(w4) : '—'}</td>
        <td class="num-cell highlight-val">${fmt(totAvg)}</td>
      </tr>
    `;
  }).join('');
}

// Download CSV
function downloadCSV() {
  const chatters = getChatterBreakdown();
  let csv = `Month,Chatter,Model,Plan ($),Fact ($),Completion %,Open Rate,Avg Price,TRT,Run Rate\n`;

  chatters.forEach(c => {
    csv += `"${state.selectedMonthKey}","${c.chatter}","${c.model}",${c.targetPlan},${c.factSales},${c.completionPct.toFixed(2)},${c.openRate.toFixed(2)},${c.avgPriceSold.toFixed(2)},${c.trt.toFixed(1)},${c.forecast.toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `chatter_crm_raw_export_1_7_august.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Navigation Tabs
function setupNavigation() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// Event Listeners
function setupEvents() {
  document.getElementById('select-month-picker')?.addEventListener('change', (e) => {
    state.selectedMonthKey = e.target.value;
    renderHeaderInfo();
    renderMainDashboard();
    renderChatterWeeklyDynamics();
    renderModelWeeklyDynamics();
  });

  document.getElementById('select-chatter-weekly')?.addEventListener('change', (e) => {
    state.selectedChatter = e.target.value;
    renderChatterWeeklyDynamics();
  });

  document.getElementById('select-model-weekly')?.addEventListener('change', (e) => {
    state.selectedModelId = e.target.value;
    renderModelWeeklyDynamics();
  });

  document.getElementById('btn-export-csv')?.addEventListener('click', downloadCSV);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderHeaderInfo();
  renderMainDashboard();
  renderChatterWeeklyDynamics();
  renderModelWeeklyDynamics();
  setupNavigation();
  setupEvents();
});
