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

    const factRevenue = weeklyRecords.reduce((acc, r) => acc + (r.totalRevenue || 0), 0);
    const latestRec = weeklyRecords[weeklyRecords.length - 1] || {};
    
    const goalProgressPct = latestRec.goalProgressPct ? latestRec.goalProgressPct : (m.plan > 0 ? (factRevenue / m.plan) * 100 : 0);
    const runRate = latestRec.runRate ? latestRec.runRate : (daysPassed > 0 ? (factRevenue / daysPassed) * daysInMonth : 0);
    const goalStatusPct = latestRec.goalStatusPct !== undefined ? latestRec.goalStatusPct : (goalProgressPct - ((daysPassed / daysInMonth) * 100));

    // Sum aggregate CRM fields
    const newFans = weeklyRecords.reduce((acc, r) => acc + (r.newFans || 0), 0);
    const spenders = weeklyRecords.reduce((acc, r) => acc + (r.spenders || 0), 0);
    const newSpenders = weeklyRecords.reduce((acc, r) => acc + (r.newSpenders || 0), 0);
    const conversion = newFans > 0 ? (newSpenders / newFans) * 100 : (latestRec.conversion || 0);
    const apc = latestRec.apc || 0;
    const apv = latestRec.apv || 0;
    const arppu = latestRec.arppu || 0;

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
      goalStatusPct,
      newFans,
      spenders,
      conversion,
      apc,
      apv,
      arppu,
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
    cardSubtextEl.innerHTML = `Фактическая сумма за ${daysPassed} дн. по всем моделям <br><span style="color: var(--accent-purple); font-weight: 600;">(включая +$424.48 доход с PP)</span>`;
  }
}

// Render Main Dashboard Tab
function renderMainDashboard() {
  const models = getModelSummaries();
  const chatters = getChatterBreakdown();

  // Summary Metrics including PP Income (+$424.48)
  const ppIncome = 424.48;
  const grandPlan = models.reduce((acc, m) => acc + m.plan, 0);
  const modelsFact = models.reduce((acc, m) => acc + m.totalRevenue, 0);
  const grandFact = modelsFact + ppIncome;
  
  const { daysPassed, daysInMonth } = getDaysInfo(state.selectedMonthKey);
  const grandRunRate = daysPassed > 0 ? (grandFact / daysPassed) * daysInMonth : 0;

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
  const modelTableBody = document.getElementById('tbody-models-summary') || document.getElementById('model-summary-table-body');
  if (modelTableBody) {
    modelTableBody.innerHTML = models.map(m => `
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${m.name}</td>
        <td style="font-family: var(--font-mono); font-weight: 600;">${formatCurrency(m.plan)}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-green);">${formatCurrency(m.totalRevenue)}</td>
        <td style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">${formatCurrency(m.runRate)}</td>
        <td>
          <span class="badge-status ${m.goalProgressPct >= 35 ? 'badge-green' : 'badge-amber'}">
            ${formatPercent(m.goalProgressPct)}
          </span>
        </td>
        <td style="font-family: var(--font-mono); color: ${m.goalStatusPct >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)'};">
          ${m.goalStatusPct >= 0 ? '+' : ''}${m.goalStatusPct.toFixed(1)}%
        </td>
        <td>${m.newFans}</td>
        <td>${m.spenders}</td>
        <td>${formatPercent(m.conversion)}</td>
        <td style="font-family: var(--font-mono); font-weight: 600; color: var(--accent-purple);">${m.apc > 0 ? m.apc.toFixed(2) : '—'}</td>
        <td>$${m.apv.toFixed(2)}</td>
        <td style="font-size: 13px; color: var(--text-muted);">${m.assignedChatters}</td>
      </tr>
    `).join('');
  }

  // Chatter Performance Table
  const chatterTableBody = document.getElementById('tbody-chatter-summary') || document.getElementById('chatter-perf-table-body');
  if (chatterTableBody) {
    chatterTableBody.innerHTML = chatters.map(c => `
      <tr>
        <td style="font-weight: 700; color: var(--text-main);">${c.chatter}</td>
        <td><span style="background: rgba(192, 132, 252, 0.15); border: 1px solid rgba(192, 132, 252, 0.3); color: var(--accent-purple); padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;">${c.model}</span></td>
        <td style="font-family: var(--font-mono);">${formatCurrency(c.targetPlan)}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-green);">${formatCurrency(c.factSales)}</td>
        <td>
          <span class="badge-status ${c.completionPct >= 35 ? 'badge-green' : 'badge-amber'}">
            ${formatPercent(c.completionPct)}
          </span>
        </td>
        <td style="font-family: var(--font-mono); color: var(--primary); font-weight: 600;">${formatCurrency(c.forecast)}</td>
        <td style="font-family: var(--font-mono);">${Math.round(c.trt)}s (Цель ${c.targetTRT}s)</td>
        <td>${formatPercent(c.openRate)} (Цель ${formatPercent(c.targetOpenRate)})</td>
        <td>$${c.avgPriceSold.toFixed(2)} (Цель $${c.targetAvgPrice})</td>
        <td>
          <span class="badge-status ${c.isGoalAchieved ? 'badge-green' : 'badge-amber'}">
            ${c.isGoalAchieved ? '🟢 Выполнен' : '🟡 В процессе'}
          </span>
        </td>
      </tr>
    `).join('');
  }
}

// Render Chatter Weekly Dynamics
function renderChatterWeeklyDynamics() {
  const select = document.getElementById('select-chatter') || document.getElementById('select-chatter-weekly');
  if (!select) return;

  const uniqueChatters = Array.from(new Set(state.kpiSettings.map(k => k.chatter)));
  select.innerHTML = uniqueChatters.map(c => `
    <option value="${c}" ${c === state.selectedChatter ? 'selected' : ''}>${c}</option>
  `).join('');

  const currentChatter = select.value || state.selectedChatter;
  const records = state.chatterWeekly.filter(w => 
    w.chatter.trim().toLowerCase() === currentChatter.trim().toLowerCase() &&
    (w.monthKey === state.selectedMonthKey || !w.monthKey)
  );

  const tbody = document.getElementById('tbody-chatter-weekly') || document.getElementById('chatter-weekly-table-body');
  if (!tbody) return;

  const getVal = (wName, key, isSum = true) => {
    const matching = records.filter(r => r.week === wName);
    if (matching.length === 0) return 0;
    if (isSum) {
      return matching.reduce((a, r) => a + (r[key] || 0), 0);
    } else {
      const vals = matching.map(r => r[key] || 0).filter(v => v > 0);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }
  };

  const getSum = (key) => records.reduce((a,r) => a + (r[key] || 0), 0);
  const getAvg = (key) => {
    const vals = records.map(r => r[key] || 0).filter(v => v > 0);
    return vals.length > 0 ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
  };

  const metricsConfig = [
    { label: 'Total Sales ($)', key: 'totalSales', isCurrency: true, isSum: true },
    { label: 'PPV Sales ($)', key: 'ppvSales', isCurrency: true, isSum: true },
    { label: 'Tips ($)', key: 'tips', isCurrency: true, isSum: true },
    { label: 'Total Messages Sent', key: 'messages', isNum: true, isSum: true },
    { label: 'Free Media Sent', key: 'freeMedia', isNum: true, isSum: true },
    { label: 'PPV Messages Sent', key: 'ppvSent', isNum: true, isSum: true },
    { label: 'PPV Messages Sold', key: 'ppvSold', isNum: true, isSum: true },
    { label: 'Total Chats Handled', key: 'chats', isNum: true, isSum: true },
    { label: 'Words Sent', key: 'words', isNum: true, isSum: true },
    { label: 'Avg Response Time (sec)', key: 'trt', isNum: true, isSum: false },
    { label: 'Avg PPV Purchase ($)', key: 'avgPPV', isCurrency: true, isSum: false },
    { label: 'PPV Open Rate (%)', key: 'openRate', isPct: true, isSum: false },
    { label: 'Avg Price Sent ($)', key: 'avgPriceSent', isCurrency: true, isSum: false },
    { label: 'Avg Price Sold ($)', key: 'avgPriceSold', isCurrency: true, isSum: false }
  ];

  tbody.innerHTML = metricsConfig.map(m => {
    const w1 = getVal('Week 1', m.key, m.isSum);
    const w2 = getVal('Week 2', m.key, m.isSum);
    const w3 = getVal('Week 3', m.key, m.isSum);
    const w4 = getVal('Week 4', m.key, m.isSum);
    const totAvg = m.isSum ? getSum(m.key) : getAvg(m.key);

    const fmt = (v) => {
      if (m.isCurrency) return formatCurrency(v);
      if (m.isPct) return formatPercent(v);
      return formatNumber(v);
    };

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-main);">${m.label}</td>
        <td style="font-family: var(--font-mono);">${fmt(w1)}</td>
        <td style="font-family: var(--font-mono);">${w2 ? fmt(w2) : '—'}</td>
        <td style="font-family: var(--font-mono);">${w3 ? fmt(w3) : '—'}</td>
        <td style="font-family: var(--font-mono);">${w4 ? fmt(w4) : '—'}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${fmt(totAvg)}</td>
      </tr>
    `;
  }).join('');
}

// Render Model Weekly Dynamics
function renderModelWeeklyDynamics() {
  const select = document.getElementById('select-model') || document.getElementById('select-model-weekly');
  if (!select) return;

  select.innerHTML = state.models.map(m => `
    <option value="${m.accountId}" ${m.accountId === state.selectedModelId ? 'selected' : ''}>${m.name}</option>
  `).join('');

  const currentAccId = select.value || state.selectedModelId;
  const records = state.modelWeekly.filter(w => 
    w.accountId === currentAccId && 
    (w.monthKey === state.selectedMonthKey || !w.monthKey)
  );

  const tbody = document.getElementById('tbody-model-weekly') || document.getElementById('model-weekly-table-body');
  if (!tbody) return;

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
    { label: 'Total Net Revenue ($)', key: 'totalRevenue', isCurrency: true, isSum: true },
    { label: 'Revenue Goal ($)', key: 'plan', isCurrency: true, isSum: false },
    { label: 'Goal Progress (%)', key: 'goalProgressPct', isPct: true, isSum: false },
    { label: 'Monthly Run Rate ($)', key: 'runRate', isCurrency: true, isSum: false },
    { label: 'New Fans Count', key: 'newFans', isNum: true, isSum: true },
    { label: 'PPV Net Revenue ($)', key: 'ppvRev', isCurrency: true, isSum: true },
    { label: 'Tips Net Revenue ($)', key: 'tipsRev', isCurrency: true, isSum: true },
    { label: 'Transactions Count', key: 'transactions', isNum: true, isSum: true },
    { label: 'APC (Actions Per Chatter)', key: 'apc', isNum: true, isSum: false },
    { label: 'APV (Avg Purchase Value)', key: 'apv', isCurrency: true, isSum: false },
    { label: 'ARPPU ($)', key: 'arppu', isCurrency: true, isSum: false }
  ];

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
        <td style="font-family: var(--font-mono);">${fmt(w1)}</td>
        <td style="font-family: var(--font-mono);">${w2 ? fmt(w2) : '—'}</td>
        <td style="font-family: var(--font-mono);">${w3 ? fmt(w3) : '—'}</td>
        <td style="font-family: var(--font-mono);">${w4 ? fmt(w4) : '—'}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${fmt(totAvg)}</td>
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
  link.setAttribute('download', `chatter_crm_raw_export_1_12_august.csv`);
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
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
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

  const selectChatter = document.getElementById('select-chatter') || document.getElementById('select-chatter-weekly');
  selectChatter?.addEventListener('change', (e) => {
    state.selectedChatter = e.target.value;
    renderChatterWeeklyDynamics();
  });

  const selectModel = document.getElementById('select-model') || document.getElementById('select-model-weekly');
  selectModel?.addEventListener('change', (e) => {
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
