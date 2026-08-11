// Seed dataset updated with exact per-account Chatter CRM Export Data for 1-7 August

export const availableMonths = [
  { key: '2026-08', label: 'Август 2026 (1–7 Авг)', isCurrent: true, totalDays: 31, daysPassed: 7 },
  { key: '2026-07', label: 'Июль 2026 (Завершен)', isCurrent: false, totalDays: 31, daysPassed: 31 }
];

export const initialConfig = [
  { id: '47892', modelName: 'Lolly (1lollyhere)', page: '1lollyhere', chatters: ['hinata', 'Kiril'] },
  { id: '39856', modelName: 'Lolly (Lollysunnery)', page: 'lollysunnery', chatters: ['paul', 'karina'] },
  { id: '30201', modelName: 'Eva Blush', page: 'evablush', chatters: ['paul', 'karina'] },
  { id: '4967', modelName: 'Lila (angelkiss)', page: 'angelkiss', chatters: ['hinata'] }
];

export const initialModels = [
  { 
    id: '47892', 
    name: 'Lolly (1lollyhere)', 
    plan: 4000, 
    totalBonusPool: 80, 
    teamBonusPool: 40, 
    kpiBonusPool: 40, 
    teamPct: '50%',
    accountId: '47892' 
  },
  { 
    id: '39856', 
    name: 'Lolly (Lollysunnery)', 
    plan: 10000, 
    totalBonusPool: 200, 
    teamBonusPool: 100, 
    kpiBonusPool: 100, 
    teamPct: '50%',
    accountId: '39856' 
  },
  { 
    id: '30201', 
    name: 'Eva Blush', 
    plan: 4000, 
    totalBonusPool: 80, 
    teamBonusPool: 40, 
    kpiBonusPool: 40, 
    teamPct: '50%',
    accountId: '30201' 
  },
  { 
    id: '4967', 
    name: 'Lila (angelkiss)', 
    plan: 1500, 
    totalBonusPool: 30, 
    teamBonusPool: 30, 
    kpiBonusPool: 0, 
    teamPct: '100%',
    accountId: '4967' 
  }
];

export const initialKPISettings = [
  // Lolly (1lollyhere)
  { chatter: 'hinata', model: 'Lolly (1lollyhere)', targetOpenRate: 40, targetAvgPrice: 25, targetTRT: 200, targetPlan: 1800 },
  { chatter: 'Kiril', model: 'Lolly (1lollyhere)', targetOpenRate: 35, targetAvgPrice: 23, targetTRT: 220, targetPlan: 1200 },

  // Lolly (Lollysunnery)
  { chatter: 'paul', model: 'Lolly (Lollysunnery)', targetOpenRate: 50, targetAvgPrice: 27, targetTRT: 200, targetPlan: 4000 },
  { chatter: 'karina', model: 'Lolly (Lollysunnery)', targetOpenRate: 40, targetAvgPrice: 30, targetTRT: 160, targetPlan: 3500 },

  // Eva Blush
  { chatter: 'paul', model: 'Eva Blush', targetOpenRate: 45, targetAvgPrice: 26, targetTRT: 200, targetPlan: 1600 },
  { chatter: 'karina', model: 'Eva Blush', targetOpenRate: 40, targetAvgPrice: 26, targetTRT: 180, targetPlan: 1250 }
];

export const initialChatterWeekly = [
  // AUGUST 1-7 (Exact per-account CRM Fact Data)
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'hinata', 
    accountId: '47892', 
    totalSales: 650.33, 
    ppvSales: 474.33, 
    tips: 176.00, 
    messages: 1122, 
    freeMedia: 52, 
    ppvSent: 40, 
    ppvSold: 21, 
    chats: 121, 
    words: 16612, 
    trt: 163.29, 
    avgPPV: 215.05, 
    openRate: 52.50, 
    avgPriceSent: 24.07, 
    avgPriceSold: 28.23 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'Kiril', 
    accountId: '47892', 
    totalSales: 68.00, 
    ppvSales: 64.00, 
    tips: 4.00, 
    messages: 489, 
    freeMedia: 10, 
    ppvSent: 9, 
    ppvSold: 2, 
    chats: 112, 
    words: 5904, 
    trt: 326.53, 
    avgPPV: 214.50, 
    openRate: 22.22, 
    avgPriceSent: 34.44, 
    avgPriceSold: 40.00 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'paul', 
    accountId: '39856', 
    totalSales: 1156.87, 
    ppvSales: 876.87, 
    tips: 280.00, 
    messages: 3231, 
    freeMedia: 67, 
    ppvSent: 50, 
    ppvSold: 35, 
    chats: 213, 
    words: 40641, 
    trt: 223.03, 
    avgPPV: 195.09, 
    openRate: 70.00, 
    avgPriceSent: 28.18, 
    avgPriceSold: 31.32 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'karina', 
    accountId: '39856', 
    totalSales: 295.64, 
    ppvSales: 283.64, 
    tips: 12.00, 
    messages: 1572, 
    freeMedia: 91, 
    ppvSent: 23, 
    ppvSold: 10, 
    chats: 165, 
    words: 16159, 
    trt: 167.92, 
    avgPPV: 86.90, 
    openRate: 43.48, 
    avgPriceSent: 32.02, 
    avgPriceSold: 35.46 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'hinata', 
    accountId: '4967', 
    totalSales: 535.13, 
    ppvSales: 535.13, 
    tips: 0.00, 
    messages: 1028, 
    freeMedia: 16, 
    ppvSent: 54, 
    ppvSold: 27, 
    chats: 121, 
    words: 16581, 
    trt: 202.73, 
    avgPPV: 207.85, 
    openRate: 50.00, 
    avgPriceSent: 23.33, 
    avgPriceSold: 24.77 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'paul', 
    accountId: '30201', 
    totalSales: 78.35, 
    ppvSales: 42.35, 
    tips: 36.00, 
    messages: 733, 
    freeMedia: 14, 
    ppvSent: 9, 
    ppvSold: 3, 
    chats: 103, 
    words: 10025, 
    trt: 346.19, 
    avgPPV: 293.67, 
    openRate: 33.33, 
    avgPriceSent: 16.98, 
    avgPriceSold: 17.65 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'karina', 
    accountId: '30201', 
    totalSales: 26.39, 
    ppvSales: 26.39, 
    tips: 0.00, 
    messages: 481, 
    freeMedia: 13, 
    ppvSent: 9, 
    ppvSold: 2, 
    chats: 104, 
    words: 5781, 
    trt: 162.83, 
    avgPPV: 162.83, 
    openRate: 22.22, 
    avgPriceSent: 21.53, 
    avgPriceSold: 16.50 
  }
];

export const initialModelWeekly = [
  // AUGUST 1-7 (Exact CRM Model Data)
  { monthKey: '2026-08', week: 'Week 1', accountId: '4967', modelName: 'Lila (angelkiss)', totalRevenue: 593.59, newFanRev: 254.74, existFanRev: 338.85, plan: 1500.00, goalProgressPct: 44.32, goalStatusPct: 18.51, runRate: 2289.76, thirtyDayRunRate: 2607.13, newFans: 156, salesRev: 570.09, ppvRev: 570.09, tipsRev: 0.00, postsRev: 23.50, monthlySubRunRate: 648, thirtyDaySubRunRate: 626, spenders: 19, newSpenders: 6, conversion: 3.85, transactions: 36, apc: 1.89, apv: 16.49, arppu: 31.24 },
  { monthKey: '2026-08', week: 'Week 1', accountId: '30201', modelName: 'Eva Blush', totalRevenue: 253.62, newFanRev: 50.74, existFanRev: 202.88, plan: 4000.00, goalProgressPct: 8.02, goalStatusPct: -17.79, runRate: 1104.39, thirtyDayRunRate: 936.04, newFans: 152, salesRev: 241.63, ppvRev: 109.63, tipsRev: 132.00, postsRev: 11.99, monthlySubRunRate: 668, thirtyDaySubRunRate: 651, spenders: 11, newSpenders: 4, conversion: 2.63, transactions: 16, apc: 1.45, apv: 15.85, arppu: 23.06 },
  { monthKey: '2026-08', week: 'Week 1', accountId: '39856', modelName: 'Lolly (Lollysunnery)', totalRevenue: 1978.09, newFanRev: 581.08, existFanRev: 1397.01, plan: 10000.00, goalProgressPct: 22.14, goalStatusPct: -3.67, runRate: 7626.28, thirtyDayRunRate: 8192.96, newFans: 296, salesRev: 1978.09, ppvRev: 1608.49, tipsRev: 369.60, postsRev: 0.00, monthlySubRunRate: 1278, thirtyDaySubRunRate: 1277, spenders: 30, newSpenders: 6, conversion: 2.03, transactions: 71, apc: 2.37, apv: 27.86, arppu: 65.94 },
  { monthKey: '2026-08', week: 'Week 1', accountId: '47892', modelName: 'Lolly (1lollyhere)', totalRevenue: 992.78, newFanRev: 120.00, existFanRev: 872.78, plan: 4000.00, goalProgressPct: 31.32, goalStatusPct: 5.51, runRate: 4314.82, thirtyDayRunRate: 4021.54, newFans: 188, salesRev: 987.19, ppvRev: 785.99, tipsRev: 201.20, postsRev: 5.59, monthlySubRunRate: 851, thirtyDaySubRunRate: 874, spenders: 24, newSpenders: 3, conversion: 1.60, transactions: 46, apc: 1.92, apv: 21.58, arppu: 41.37 }
];
