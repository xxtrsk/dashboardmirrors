// Seed dataset updated with FULL AUGUST (1–31 August) Official CRM Export + PayPal Income:
// Lollysunnery (39856): OF Net $10,009.90 + PayPal $1,360.89 = $11,370.79 (Goal $10,000 | 113.71%)
// 1lollyhere (47892): OF Net $3,577.07 + PayPal $210.00 = $3,787.07 (Goal $4,000 | 94.68%)
// Eva Blush (30201): OF Net $2,404.65 + PayPal $282.50 = $2,687.15 (Goal $3,500 | 76.78%)
// Lila angelkiss (4967): OF Net $1,751.52 + PayPal $0.00 = $1,751.52 (Goal $1,500 | 116.77%)
// Grand Total Agency Revenue: $19,596.53 (Goal $19,000 | 103.14% EXCEEDED!)

export const availableMonths = [
  { key: '2026-08', label: 'Август 2026 (1–31 Итог)', isCurrent: true, totalDays: 31, daysPassed: 31 },
  { key: '2026-07', label: 'Июль 2026 (Завершен)', isCurrent: false, totalDays: 31, daysPassed: 31 }
];

export const initialConfig = [
  { id: '39856', modelName: 'Lolly (Lollysunnery)', page: 'lollysunnery', chatters: ['paul walkeeer', 'karina @sanesskio'] },
  { id: '47892', modelName: 'Lolly (1lollyhere)', page: '1lollyhere', chatters: ['hinata hyuga', 'Kirill Chelusti'] },
  { id: '30201', modelName: 'Eva Blush', page: 'evablush', chatters: ['paul walkeeer', 'karina @sanesskio'] },
  { id: '4967', modelName: 'Lila (angelkiss)', page: 'angelkiss', chatters: ['hinata hyuga', 'Kirill Chelusti'] }
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
  { chatter: 'Kirill Chelusti', model: 'Lolly (1lollyhere)', targetOpenRate: 35, targetAvgPrice: 23, targetTRT: 220, targetPlan: 1200 },

  // Eva Blush
  { chatter: 'paul walkeeer', model: 'Eva Blush', targetOpenRate: 45, targetAvgPrice: 26, targetTRT: 200, targetPlan: 1600 },
  { chatter: 'karina @sanesskio', model: 'Eva Blush', targetOpenRate: 40, targetAvgPrice: 26, targetTRT: 180, targetPlan: 1250 },

  // Lila (angelkiss)
  { chatter: 'Kirill Chelusti', model: 'Lila (angelkiss)', targetOpenRate: 35, targetAvgPrice: 23, targetTRT: 220, targetPlan: 500 }
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
    totalSales: 3072.72, 
    ppvSales: 2121.10, 
    tips: 951.62, 
    messages: 6459, 
    freeMedia: 304, 
    ppvSent: 112, 
    ppvSold: 50, 
    chats: 435, 
    words: 59708, 
    trt: 139.38, 
    avgPPV: 29.85, 
    openRate: 44.64, 
    avgPriceSent: 36.22, 
    avgPriceSold: 29.85 
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
    chatter: 'Kirill Chelusti', 
    accountId: '47892', 
    totalSales: 324.57, 
    ppvSales: 244.57, 
    tips: 80.00, 
    messages: 3507, 
    freeMedia: 99, 
    ppvSent: 60, 
    ppvSold: 26, 
    chats: 407, 
    words: 43200, 
    trt: 291.67, 
    avgPPV: 22.07, 
    openRate: 43.33, 
    avgPriceSent: 28.67, 
    avgPriceSold: 33.68 
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
    chatter: 'Kirill Chelusti', 
    accountId: '4967', 
    totalSales: 291.90, 
    ppvSales: 211.90, 
    tips: 80.00, 
    messages: 1376, 
    freeMedia: 27, 
    ppvSent: 29, 
    ppvSold: 8, 
    chats: 219, 
    words: 18333, 
    trt: 169.70, 
    avgPPV: 18.75, 
    openRate: 27.59, 
    avgPriceSent: 20.26, 
    avgPriceSold: 18.75 
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
    totalSales: 843.71, 
    ppvSales: 568.71, 
    tips: 275.00, 
    messages: 1869, 
    freeMedia: 107, 
    ppvSent: 51, 
    ppvSold: 11, 
    chats: 282, 
    words: 19918, 
    trt: 153.16, 
    avgPPV: 25.80, 
    openRate: 21.57, 
    avgPriceSent: 32.68, 
    avgPriceSold: 25.80 
  }
];

export const initialModelWeekly = [
  // FULL AUGUST MODEL CUMULATIVE REVENUE (OF Net + PayPal)
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    accountId: '39856', 
    modelName: 'Lolly (Lollysunnery)', 
    totalRevenue: 11370.79, // OF Net $10,009.90 + PayPal $1,360.89
    plan: 10000.00, 
    goalProgressPct: 113.71, 
    goalStatusPct: 13.71,
    runRate: 11370.79, 
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
    totalRevenue: 3787.07, // OF Net $3,577.07 + PayPal $210.00
    plan: 4000.00, 
    goalProgressPct: 94.68, 
    goalStatusPct: -5.32,
    runRate: 3787.07, 
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
    totalRevenue: 2687.15, // OF Net $2,404.65 + PayPal $282.50
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
    totalRevenue: 1751.52, // OF Net $1,751.52 + PayPal $0.00
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
