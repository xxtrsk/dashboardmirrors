// Seed dataset updated for September 1–16 with reallocated PayPal ($50 shifted from Eva Blush to Lollysunnery):
// 1. Lollysunnery (39856): OF Net $3,599.40 + PayPal $1,262.55 = $4,861.95 (Goal $7,500 | 64.83% | RunRate $9,116.16)
// 2. 1lollyhere (47892): OF Net $1,950.14 + PayPal $25.00 = $1,975.14 (Goal $3,500 | 56.43% | RunRate $3,703.39)
// 3. Eva Blush (30201): OF Net $1,047.32 + PayPal $455.00 = $1,502.32 (Goal $3,000 | 50.08% | RunRate $2,816.85)
// 4. Eva Pinky (Fansly 77304): Net $717.94 + PayPal $0.00 = $717.94 (Goal $1,000 | 71.79% | RunRate $1,346.14)
// 5. Lila angelkiss (4967): OF Net $526.81 + PayPal $0.00 = $526.81 (Goal $1,500 | 35.12% | RunRate $987.77)
// Grand Total Agency Revenue 1–16 Sept: $9,584.16 (Goal $16,500 | 58.09% | Projected RunRate $17,970.31)

export const availableMonths = [
  { key: '2026-09', label: 'Сентябрь 2026 (1–16 Сент)', isCurrent: true, totalDays: 30, daysPassed: 16 },
  { key: '2026-08', label: 'Август 2026 (Завершен Итог $19.5k)', isCurrent: false, totalDays: 31, daysPassed: 31 },
  { key: '2026-07', label: 'Июль 2026 (Завершен)', isCurrent: false, totalDays: 31, daysPassed: 31 }
];

export const initialConfig = [
  { id: '39856', modelName: 'Lolly (Lollysunnery)', page: 'lollysunnery', chatters: ['paul walkeeer', 'karina @sanesskio', 'Timur (Тимур)'] },
  { id: '47892', modelName: 'Lolly (1lollyhere)', page: '1lollyhere', chatters: ['hinata hyuga', 'Igor (Игорь)'] },
  { id: '30201', modelName: 'Eva Blush', page: 'evablush', chatters: ['paul walkeeer', 'karina @sanesskio', 'Timur (Тимур)'] },
  { id: '4967', modelName: 'Lila (angelkiss)', page: 'angelkiss', chatters: ['hinata hyuga', 'Igor (Игорь)'] },
  { id: '77304', modelName: 'Eva Pinky (Fansly)', page: 'evapinky', chatters: ['Команда Fansly'] }
];

export const initialModels = [
  { 
    id: '39856', 
    name: 'Lolly (Lollysunnery)', 
    plan: 7500, 
    totalBonusPool: 150, 
    teamBonusPool: 75, 
    kpiBonusPool: 75, 
    teamPct: '50%',
    accountId: '39856' 
  },
  { 
    id: '47892', 
    name: 'Lolly (1lollyhere)', 
    plan: 3500, 
    totalBonusPool: 70, 
    teamBonusPool: 35, 
    kpiBonusPool: 35, 
    teamPct: '50%',
    accountId: '47892' 
  },
  { 
    id: '30201', 
    name: 'Eva Blush', 
    plan: 3000, 
    totalBonusPool: 60, 
    teamBonusPool: 30, 
    kpiBonusPool: 30, 
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
  },
  { 
    id: '77304', 
    name: 'Eva Pinky (Fansly)', 
    plan: 1000, 
    totalBonusPool: 20, 
    teamBonusPool: 20, 
    kpiBonusPool: 0, 
    teamPct: '100%',
    accountId: '77304' 
  }
];

export const initialKPISettings = [
  // Lolly (Lollysunnery) - Plan $7,500
  { chatter: 'paul walkeeer', model: 'Lolly (Lollysunnery)', targetOpenRate: 50, targetAvgPrice: 27, targetTRT: 200, targetPlan: 3200 },
  { chatter: 'karina @sanesskio', model: 'Lolly (Lollysunnery)', targetOpenRate: 40, targetAvgPrice: 30, targetTRT: 160, targetPlan: 2800 },
  { chatter: 'Timur (Тимур)', model: 'Lolly (Lollysunnery)', targetOpenRate: 35, targetAvgPrice: 22, targetTRT: 220, targetPlan: 1500 },

  // Lolly (1lollyhere) - Plan $3,500
  { chatter: 'hinata hyuga', model: 'Lolly (1lollyhere)', targetOpenRate: 40, targetAvgPrice: 25, targetTRT: 200, targetPlan: 2500 },
  { chatter: 'Igor (Игорь)', model: 'Lolly (1lollyhere)', targetOpenRate: 35, targetAvgPrice: 23, targetTRT: 220, targetPlan: 1000 },

  // Eva Blush - Plan $3,000
  { chatter: 'paul walkeeer', model: 'Eva Blush', targetOpenRate: 45, targetAvgPrice: 26, targetTRT: 200, targetPlan: 1300 },
  { chatter: 'karina @sanesskio', model: 'Eva Blush', targetOpenRate: 40, targetAvgPrice: 26, targetTRT: 180, targetPlan: 1100 },
  { chatter: 'Timur (Тимур)', model: 'Eva Blush', targetOpenRate: 35, targetAvgPrice: 22, targetTRT: 220, targetPlan: 600 },

  // Lila (angelkiss) - Plan $1,500
  { chatter: 'hinata hyuga', model: 'Lila (angelkiss)', targetOpenRate: 40, targetAvgPrice: 25, targetTRT: 200, targetPlan: 1000 },
  { chatter: 'Igor (Игорь)', model: 'Lila (angelkiss)', targetOpenRate: 35, targetAvgPrice: 23, targetTRT: 220, targetPlan: 500 }
];

export const initialChatterWeekly = [
  // SEPTEMBER 2026 RECORDS (1–16 Сент)
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    chatter: 'paul walkeeer', 
    accountId: '39856', 
    totalSales: 2917.17, 
    ppvSales: 2577.33, 
    tips: 339.84, 
    messages: 7480, 
    freeMedia: 204, 
    ppvSent: 121, 
    ppvSold: 76, 
    chats: 288, 
    words: 96420, 
    trt: 216.20, 
    avgPPV: 32.43, 
    openRate: 62.55, 
    avgPriceSent: 28.68, 
    avgPriceSold: 32.43 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    chatter: 'karina @sanesskio', 
    accountId: '39856', 
    totalSales: 1944.78, 
    ppvSales: 1718.22, 
    tips: 226.56, 
    messages: 4458, 
    freeMedia: 193, 
    ppvSent: 82, 
    ppvSold: 35, 
    chats: 239, 
    words: 39300, 
    trt: 126.27, 
    avgPPV: 32.43, 
    openRate: 49.39, 
    avgPriceSent: 38.60, 
    avgPriceSold: 32.43 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    chatter: 'hinata hyuga', 
    accountId: '47892', 
    totalSales: 1382.60, 
    ppvSales: 1008.20, 
    tips: 374.40, 
    messages: 2300, 
    freeMedia: 93, 
    ppvSent: 88, 
    ppvSold: 42, 
    chats: 268, 
    words: 32500, 
    trt: 226.51, 
    avgPPV: 20.31, 
    openRate: 47.62, 
    avgPriceSent: 21.77, 
    avgPriceSold: 20.31 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    chatter: 'Igor (Игорь)', 
    accountId: '47892', 
    totalSales: 592.54, 
    ppvSales: 432.10, 
    tips: 160.44, 
    messages: 991, 
    freeMedia: 40, 
    ppvSent: 38, 
    ppvSold: 18, 
    chats: 116, 
    words: 13938, 
    trt: 291.67, 
    avgPPV: 20.31, 
    openRate: 43.33, 
    avgPriceSent: 28.67, 
    avgPriceSold: 20.31 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    chatter: 'hinata hyuga', 
    accountId: '4967', 
    totalSales: 351.21, 
    ppvSales: 329.87, 
    tips: 21.34, 
    messages: 1254, 
    freeMedia: 14, 
    ppvSent: 71, 
    ppvSold: 30, 
    chats: 150, 
    words: 19310, 
    trt: 225.47, 
    avgPPV: 14.24, 
    openRate: 42.45, 
    avgPriceSent: 20.53, 
    avgPriceSold: 14.24 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    chatter: 'Igor (Игорь)', 
    accountId: '4967', 
    totalSales: 175.60, 
    ppvSales: 164.94, 
    tips: 10.66, 
    messages: 627, 
    freeMedia: 7, 
    ppvSent: 35, 
    ppvSold: 15, 
    chats: 76, 
    words: 9655, 
    trt: 169.70, 
    avgPPV: 14.24, 
    openRate: 27.59, 
    avgPriceSent: 20.26, 
    avgPriceSold: 14.24 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    chatter: 'paul walkeeer', 
    accountId: '30201', 
    totalSales: 901.39, 
    ppvSales: 614.83, 
    tips: 286.56, 
    messages: 4434, 
    freeMedia: 120, 
    ppvSent: 65, 
    ppvSold: 26, 
    chats: 304, 
    words: 56920, 
    trt: 250.55, 
    avgPPV: 20.95, 
    openRate: 39.45, 
    avgPriceSent: 24.68, 
    avgPriceSold: 20.95 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    chatter: 'karina @sanesskio', 
    accountId: '30201', 
    totalSales: 600.93, 
    ppvSales: 409.89, 
    tips: 191.04, 
    messages: 2956, 
    freeMedia: 81, 
    ppvSent: 44, 
    ppvSold: 17, 
    chats: 203, 
    words: 37949, 
    trt: 133.81, 
    avgPPV: 20.95, 
    openRate: 17.44, 
    avgPriceSent: 29.44, 
    avgPriceSold: 20.95 
  }
];

export const initialModelWeekly = [
  // SEPTEMBER 1–16 REVENUE (EXACT CRM EXPORTS + REALLOCATED PAYPAL $1,742.55)
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    accountId: '39856', 
    modelName: 'Lolly (Lollysunnery)', 
    totalRevenue: 4861.95, // OF Net $3,599.40 + PayPal $1,262.55
    plan: 7500.00, 
    goalProgressPct: 64.83, 
    goalStatusPct: 11.50,
    runRate: 9116.16, 
    newFans: 38, 
    spenders: 43, 
    newSpenders: 6,
    conversion: 15.79,
    ppvRev: 3033.00, 
    tipsRev: 566.40, 
    transactions: 111, 
    apc: 2.58, 
    apv: 32.43, 
    arppu: 83.71 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    accountId: '47892', 
    modelName: 'Lolly (1lollyhere)', 
    totalRevenue: 1975.14, // OF Net $1,950.14 + PayPal $25.00
    plan: 3500.00, 
    goalProgressPct: 56.43, 
    goalStatusPct: 3.10,
    runRate: 3703.39, 
    newFans: 514, 
    spenders: 38, 
    newSpenders: 12,
    conversion: 2.33,
    ppvRev: 1423.50, 
    tipsRev: 392.00, 
    transactions: 96, 
    apc: 2.53, 
    apv: 20.31, 
    arppu: 51.32 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    accountId: '30201', 
    modelName: 'Eva Blush', 
    totalRevenue: 1502.32, // OF Net $1,047.32 + PayPal $455.00
    plan: 3000.00, 
    goalProgressPct: 50.08, 
    goalStatusPct: -3.25,
    runRate: 2816.85, 
    newFans: 289, 
    spenders: 34, 
    newSpenders: 9,
    conversion: 3.11,
    ppvRev: 517.77, 
    tipsRev: 477.60, 
    transactions: 50, 
    apc: 1.47, 
    apv: 20.95, 
    arppu: 30.80 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    accountId: '77304', 
    modelName: 'Eva Pinky (Fansly)', 
    totalRevenue: 717.94, // Fansly Net $717.94 + PayPal $0.00
    plan: 1000.00, 
    goalProgressPct: 71.79, 
    goalStatusPct: 18.46,
    runRate: 1346.14, 
    newFans: 120, 
    spenders: 21, 
    newSpenders: 5,
    conversion: 4.17,
    ppvRev: 456.41, 
    tipsRev: 76.00, 
    transactions: 31, 
    apc: 1.48, 
    apv: 23.16, 
    arppu: 34.19 
  },
  { 
    monthKey: '2026-09', 
    week: '1–16 Сент (Факт)', 
    accountId: '4967', 
    modelName: 'Lila (angelkiss)', 
    totalRevenue: 526.81, // OF Net $526.81 + PayPal $0.00
    plan: 1500.00, 
    goalProgressPct: 35.12, 
    goalStatusPct: -18.21,
    runRate: 987.77, 
    newFans: 368, 
    spenders: 25, 
    newSpenders: 7,
    conversion: 1.90,
    ppvRev: 494.81, 
    tipsRev: 32.00, 
    transactions: 37, 
    apc: 1.48, 
    apv: 14.24, 
    arppu: 21.07 
  },

  // AUGUST 2026 MODEL CUMULATIVE REVENUE (OF Net + External Sources $1,748.72)
  { 
    monthKey: '2026-08', 
    week: '1-31 Авг (Итог)', 
    accountId: '39856', 
    modelName: 'Lolly (Lollysunnery)', 
    totalRevenue: 11351.12, 
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
    totalRevenue: 3702.07, 
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
    totalRevenue: 2687.15, 
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
    totalRevenue: 1751.52, 
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
