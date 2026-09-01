// Seed dataset updated with FULL AUGUST (1–31 August) Official CRM Export + External Income Sources ($1,748.72):
// Lollysunnery (39856): OF Net $10,009.90 + External $1,341.22 = $11,351.12 (Goal $10,000 | 113.51%)
// 1lollyhere (47892): OF Net $3,577.07 + External $125.00 = $3,702.07 (Goal $4,000 | 92.55%)
// Eva Blush (30201): OF Net $2,404.65 + External $282.50 = $2,687.15 (Goal $3,500 | 76.78%)
// Lila angelkiss (4967): OF Net $1,751.52 + External $0.00 = $1,751.52 (Goal $1,500 | 116.77%)
// Grand Total Agency Revenue: $19,491.86 (Goal $19,000 | 102.59% EXCEEDED!)

export const availableMonths = [
  { key: '2026-08', label: 'Август 2026 (1–31 Итог)', isCurrent: true, totalDays: 31, daysPassed: 31 },
  { key: '2026-07', label: 'Июль 2026 (Завершен)', isCurrent: false, totalDays: 31, daysPassed: 31 }
];

export const initialConfig = [
  { id: '39856', modelName: 'Lolly (Lollysunnery)', page: 'lollysunnery', chatters: ['paul walkeeer', 'karina @sanesskio'] },
  { id: '47892', modelName: 'Lolly (1lollyhere)', page: '1lollyhere', chatters: ['hinata hyuga'] },
  { id: '30201', modelName: 'Eva Blush', page: 'evablush', chatters: ['paul walkeeer', 'karina @sanesskio'] },
  { id: '4967', modelName: 'Lila (angelkiss)', page: 'angelkiss', chatters: ['hinata hyuga'] }
];

export const initialModels = [
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
    id: '30201', 
    name: 'Eva Blush', 
    plan: 3500, 
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
  // Lolly (Lollysunnery)
  { chatter: 'paul walkeeer', model: 'Lolly (Lollysunnery)', targetOpenRate: 50, targetAvgPrice: 27, targetTRT: 200, targetPlan: 4000 },
  { chatter: 'karina @sanesskio', model: 'Lolly (Lollysunnery)', targetOpenRate: 40, targetAvgPrice: 30, targetTRT: 160, targetPlan: 3500 },

  // Lolly (1lollyhere)
  { chatter: 'hinata hyuga', model: 'Lolly (1lollyhere)', targetOpenRate: 40, targetAvgPrice: 25, targetTRT: 200, targetPlan: 1800 },

  // Eva Blush
  { chatter: 'paul walkeeer', model: 'Eva Blush', targetOpenRate: 45, targetAvgPrice: 26, targetTRT: 200, targetPlan: 1600 },
  { chatter: 'karina @sanesskio', model: 'Eva Blush', targetOpenRate: 40, targetAvgPrice: 26, targetTRT: 180, targetPlan: 1250 }
];

export const initialChatterWeekly = [
  // FULL AUGUST CUMULATIVE CHATTER RECORDS
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    chatter: 'paul walkeeer', 
    accountId: '39856', 
    totalSales: 5333.48, 
    ppvSales: 4874.04, 
    tips: 459.44, 
    messages: 14979, 
    freeMedia: 407, 
    ppvSent: 243, 
    ppvSold: 152, 
    chats: 577, 
    words: 192846, 
    trt: 216.20, 
    avgPPV: 32.07, 
    openRate: 62.55, 
    avgPriceSent: 28.68, 
    avgPriceSold: 32.07 
  },
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    chatter: 'karina @sanesskio', 
    accountId: '39856', 
    totalSales: 4639.92, 
    ppvSales: 2879.00, 
    tips: 1760.92, 
    messages: 8917, 
    freeMedia: 387, 
    ppvSent: 164, 
    ppvSold: 81, 
    chats: 478, 
    words: 78599, 
    trt: 126.27, 
    avgPPV: 35.54, 
    openRate: 49.39, 
    avgPriceSent: 38.60, 
    avgPriceSold: 35.54 
  },
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    chatter: 'hinata hyuga', 
    accountId: '47892', 
    totalSales: 1927.24, 
    ppvSales: 1680.00, 
    tips: 247.24, 
    messages: 3291, 
    freeMedia: 133, 
    ppvSent: 126, 
    ppvSold: 60, 
    chats: 384, 
    words: 46438, 
    trt: 226.51, 
    avgPPV: 23.60, 
    openRate: 47.62, 
    avgPriceSent: 21.77, 
    avgPriceSold: 27.00 
  },
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    chatter: 'hinata hyuga', 
    accountId: '4967', 
    totalSales: 841.86, 
    ppvSales: 837.86, 
    tips: 4.00, 
    messages: 1881, 
    freeMedia: 21, 
    ppvSent: 106, 
    ppvSold: 45, 
    chats: 226, 
    words: 28965, 
    trt: 225.47, 
    avgPPV: 23.27, 
    openRate: 42.45, 
    avgPriceSent: 20.53, 
    avgPriceSold: 23.27 
  },
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    chatter: 'paul walkeeer', 
    accountId: '30201', 
    totalSales: 1580.23, 
    ppvSales: 1375.20, 
    tips: 205.03, 
    messages: 7390, 
    freeMedia: 201, 
    ppvSent: 109, 
    ppvSold: 43, 
    chats: 507, 
    words: 94869, 
    trt: 250.55, 
    avgPPV: 31.98, 
    openRate: 39.45, 
    avgPriceSent: 24.68, 
    avgPriceSold: 31.98 
  },
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    chatter: 'karina @sanesskio', 
    accountId: '30201', 
    totalSales: 754.08, 
    ppvSales: 444.76, 
    tips: 309.32, 
    messages: 2940, 
    freeMedia: 238, 
    ppvSent: 86, 
    ppvSold: 15, 
    chats: 398, 
    words: 29972, 
    trt: 133.81, 
    avgPPV: 29.65, 
    openRate: 17.44, 
    avgPriceSent: 29.44, 
    avgPriceSold: 29.65 
  }
];

export const initialModelWeekly = [
  // FULL AUGUST MODEL CUMULATIVE REVENUE (OF Net + External Sources $1,748.72)
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    accountId: '39856', 
    modelName: 'Lolly (Lollysunnery)', 
    totalRevenue: 11351.12, // OF Net $10,009.90 + External $1,341.22
    plan: 10000.00, 
    goalProgressPct: 113.51, 
    goalStatusPct: 13.51,
    runRate: 11351.12, 
    newFans: 792, 
    spenders: 119, 
    newSpenders: 37,
    conversion: 4.67,
    ppvRev: 7269.38, 
    tipsRev: 2740.52, 
    transactions: 383, 
    apc: 3.22, 
    apv: 26.14, 
    arppu: 84.12 
  },
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    accountId: '47892', 
    modelName: 'Lolly (1lollyhere)', 
    totalRevenue: 3702.07, // OF Net $3,577.07 + External $125.00
    plan: 4000.00, 
    goalProgressPct: 92.55, 
    goalStatusPct: -7.45,
    runRate: 3702.07, 
    newFans: 865, 
    spenders: 76, 
    newSpenders: 26,
    conversion: 3.01,
    ppvRev: 2785.92, 
    tipsRev: 440.80, 
    transactions: 188, 
    apc: 2.47, 
    apv: 19.03, 
    arppu: 47.07 
  },
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    accountId: '30201', 
    modelName: 'Eva Blush', 
    totalRevenue: 2687.15, // OF Net $2,404.65 + External $282.50
    plan: 3500.00, 
    goalProgressPct: 76.78, 
    goalStatusPct: -23.22,
    runRate: 2687.15, 
    newFans: 698, 
    spenders: 65, 
    newSpenders: 23,
    conversion: 3.30,
    ppvRev: 1649.64, 
    tipsRev: 643.93, 
    transactions: 129, 
    apc: 1.98, 
    apv: 18.64, 
    arppu: 36.99 
  },
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    accountId: '4967', 
    modelName: 'Lila (angelkiss)', 
    totalRevenue: 1751.52, // OF Net $1,751.52 + External $0.00
    plan: 1500.00, 
    goalProgressPct: 116.77, 
    goalStatusPct: 16.77,
    runRate: 1751.52, 
    newFans: 662, 
    spenders: 66, 
    newSpenders: 27,
    conversion: 4.08,
    ppvRev: 1592.27, 
    tipsRev: 124.00, 
    transactions: 124, 
    apc: 1.88, 
    apv: 14.13, 
    arppu: 26.54 
  }
];
