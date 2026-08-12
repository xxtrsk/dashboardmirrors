// Seed dataset updated with exact OnlyMonster Chatter Overview table from screenshot

export const availableMonths = [
  { key: '2026-08', label: 'Август 2026 (1–12 Авг)', isCurrent: true, totalDays: 31, daysPassed: 12 },
  { key: '2026-07', label: 'Июль 2026 (Завершен)', isCurrent: false, totalDays: 31, daysPassed: 31 }
];

export const initialConfig = [
  { id: '47892', modelName: 'Lolly (1lollyhere)', page: '1lollyhere', chatters: ['hinata hyuga', 'Kirill Chelusti'] },
  { id: '39856', modelName: 'Lolly (Lollysunnery)', page: 'lollysunnery', chatters: ['paul walkeeer', 'karina @sanesskio'] },
  { id: '30201', modelName: 'Eva Blush', page: 'evablush', chatters: ['paul walkeeer', 'karina @sanesskio'] },
  { id: '4967', modelName: 'Lila (angelkiss)', page: 'angelkiss', chatters: ['hinata hyuga', 'Taras K'] }
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
  { chatter: 'hinata hyuga', model: 'Lolly (1lollyhere)', targetOpenRate: 40, targetAvgPrice: 25, targetTRT: 200, targetPlan: 1800 },
  { chatter: 'Kirill Chelusti', model: 'Lolly (1lollyhere)', targetOpenRate: 35, targetAvgPrice: 23, targetTRT: 220, targetPlan: 1200 },

  // Lolly (Lollysunnery)
  { chatter: 'paul walkeeer', model: 'Lolly (Lollysunnery)', targetOpenRate: 50, targetAvgPrice: 27, targetTRT: 200, targetPlan: 4000 },
  { chatter: 'karina @sanesskio', model: 'Lolly (Lollysunnery)', targetOpenRate: 40, targetAvgPrice: 30, targetTRT: 160, targetPlan: 3500 },

  // Eva Blush
  { chatter: 'paul walkeeer', model: 'Eva Blush', targetOpenRate: 45, targetAvgPrice: 26, targetTRT: 200, targetPlan: 1600 },
  { chatter: 'karina @sanesskio', model: 'Eva Blush', targetOpenRate: 40, targetAvgPrice: 26, targetTRT: 180, targetPlan: 1250 },

  // Lila (angelkiss)
  { chatter: 'Taras K', model: 'Lila (angelkiss)', targetOpenRate: 40, targetAvgPrice: 24, targetTRT: 200, targetPlan: 500 }
];

export const initialChatterWeekly = [
  // AUGUST 1-12 (Exact OnlyMonster Chatter Overview Table)
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'hinata hyuga', 
    accountId: '47892', 
    totalSales: 1792.12, 
    ppvSales: 1600.12, 
    tips: 192.00, 
    messages: 3763, 
    freeMedia: 140, 
    ppvSent: 120, 
    ppvSold: 65, 
    chats: 380, 
    words: 48500, 
    trt: 178.00, 
    avgPPV: 24.61, 
    openRate: 54.17, 
    avgPriceSent: 22.50, 
    avgPriceSold: 26.20 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'paul walkeeer', 
    accountId: '39856', 
    totalSales: 2573.58, 
    ppvSales: 2087.98, 
    tips: 485.60, 
    messages: 8385, 
    freeMedia: 210, 
    ppvSent: 185, 
    ppvSold: 124, 
    chats: 620, 
    words: 112000, 
    trt: 270.00, 
    avgPPV: 16.83, 
    openRate: 67.03, 
    avgPriceSent: 24.80, 
    avgPriceSold: 28.50 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'karina @sanesskio', 
    accountId: '39856', 
    totalSales: 1147.19, 
    ppvSales: 651.19, 
    tips: 496.00, 
    messages: 5227, 
    freeMedia: 245, 
    ppvSent: 98, 
    ppvSold: 45, 
    chats: 510, 
    words: 68400, 
    trt: 156.00, 
    avgPPV: 14.47, 
    openRate: 45.92, 
    avgPriceSent: 28.50, 
    avgPriceSold: 32.10 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'Kirill Chelusti', 
    accountId: '47892', 
    totalSales: 540.00, 
    ppvSales: 428.00, 
    tips: 112.00, 
    messages: 3095, 
    freeMedia: 88, 
    ppvSent: 45, 
    ppvSold: 18, 
    chats: 380, 
    words: 39500, 
    trt: 295.00, 
    avgPPV: 23.77, 
    openRate: 40.00, 
    avgPriceSent: 30.50, 
    avgPriceSold: 36.20 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'Taras K', 
    accountId: '4967', 
    totalSales: 189.58, 
    ppvSales: 189.58, 
    tips: 0.00, 
    messages: 239, 
    freeMedia: 12, 
    ppvSent: 15, 
    ppvSold: 8, 
    chats: 85, 
    words: 3200, 
    trt: 235.00, 
    avgPPV: 23.70, 
    openRate: 53.33, 
    avgPriceSent: 21.00, 
    avgPriceSold: 23.70 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    chatter: 'Alex Sonly', 
    accountId: '30201', 
    totalSales: 96.00, 
    ppvSales: 96.00, 
    tips: 0.00, 
    messages: 0, 
    freeMedia: 0, 
    ppvSent: 5, 
    ppvSold: 4, 
    chats: 10, 
    words: 0, 
    trt: 0.00, 
    avgPPV: 24.00, 
    openRate: 80.00, 
    avgPriceSent: 20.00, 
    avgPriceSold: 24.00 
  }
];

export const initialModelWeekly = [
  // AUGUST 1-12 (Net 80% OnlyMonster Revenue)
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    accountId: '4967', 
    modelName: 'Lila (angelkiss)', 
    totalRevenue: 849.69, 
    newFanRev: 360.00, 
    existFanRev: 489.69, 
    plan: 1500.00, 
    goalProgressPct: 56.65, 
    goalStatusPct: 17.94, 
    runRate: 2195.03, 
    thirtyDayRunRate: 2124.23, 
    newFans: 285, 
    salesRev: 845.69, 
    ppvRev: 822.18, 
    tipsRev: 4.00, 
    postsRev: 23.50, 
    monthlySubRunRate: 850, 
    thirtyDaySubRunRate: 820, 
    spenders: 38, 
    newSpenders: 12, 
    conversion: 4.21, 
    transactions: 54, 
    apc: 1.95, 
    apv: 15.73, 
    arppu: 22.36 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    accountId: '30201', 
    modelName: 'Eva Blush', 
    totalRevenue: 574.57, 
    newFanRev: 144.00, 
    existFanRev: 430.57, 
    plan: 4000.00, 
    goalProgressPct: 14.36, 
    goalStatusPct: -24.35, 
    runRate: 1484.31, 
    thirtyDayRunRate: 1436.43, 
    newFans: 240, 
    salesRev: 545.77, 
    ppvRev: 397.79, 
    tipsRev: 148.00, 
    postsRev: 28.80, 
    monthlySubRunRate: 910, 
    thirtyDaySubRunRate: 880, 
    spenders: 25, 
    newSpenders: 8, 
    conversion: 3.33, 
    transactions: 32, 
    apc: 1.62, 
    apv: 17.95, 
    arppu: 22.98 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    accountId: '39856', 
    modelName: 'Lolly (Lollysunnery)', 
    totalRevenue: 3913.77, 
    newFanRev: 1160.00, 
    existFanRev: 2753.77, 
    plan: 10000.00, 
    goalProgressPct: 39.14, 
    goalStatusPct: 0.43, 
    runRate: 10110.57, 
    thirtyDayRunRate: 9784.43, 
    newFans: 512, 
    salesRev: 3913.77, 
    ppvRev: 2818.57, 
    tipsRev: 1095.20, 
    postsRev: 0.00, 
    monthlySubRunRate: 1850, 
    thirtyDaySubRunRate: 1810, 
    spenders: 78, 
    newSpenders: 18, 
    conversion: 3.52, 
    transactions: 155, 
    apc: 2.41, 
    apv: 25.25, 
    arppu: 50.18 
  },
  { 
    monthKey: '2026-08', 
    week: 'Week 1', 
    accountId: '47892', 
    modelName: 'Lolly (1lollyhere)', 
    totalRevenue: 1521.84, 
    newFanRev: 256.00, 
    existFanRev: 1265.84, 
    plan: 4000.00, 
    goalProgressPct: 38.05, 
    goalStatusPct: -0.66, 
    runRate: 3928.75, 
    thirtyDayRunRate: 3804.60, 
    newFans: 325, 
    salesRev: 1513.04, 
    ppvRev: 1208.71, 
    tipsRev: 217.20, 
    postsRev: 8.80, 
    monthlySubRunRate: 1120, 
    thirtyDaySubRunRate: 1090, 
    spenders: 49, 
    newSpenders: 9, 
    conversion: 2.77, 
    transactions: 74, 
    apc: 2.11, 
    apv: 20.57, 
    arppu: 31.06 
  }
];
