/* =========================================================
   RV SPORTS: FC CUP 26
   PLAYER STATS SYSTEM
   File: js/player/stats.js
   ========================================================= */

/* =========================================================
   STAT SYSTEM CONFIG
   ========================================================= */

const STAT_SYSTEM = {
  stats: ["pac", "sho", "pas", "dri", "def", "phy"],

  min: 1,
  max: 99,

  gacha: {
    minRoll: 45,
    maxRoll: 85,

    rerollCost: 0,

    starterAttempts: 3,

    growthPerLevel: {
      min: 1,
      max: 3
    }
  },

  potential: {
    minimum: 50,
    maximum: 99,

    default: 85,

    growthCap: 99
  }
};


/* =========================================================
   RARITY
   ========================================================= */

const STAT_RARITIES = [
  {
    id: "bronze",
    name: "Bronze",
    minOvr: 1,
    maxOvr: 64
  },
  {
    id: "silver",
    name: "Silver",
    minOvr: 65,
    maxOvr: 74
  },
  {
    id: "gold",
    name: "Gold",
    minOvr: 75,
    maxOvr: 84
  },
  {
    id: "elite",
    name: "Elite",
    minOvr: 85,
    maxOvr: 89
  },
  {
    id: "worldclass",
    name: "World Class",
    minOvr: 90,
    maxOvr: 94
  },
  {
    id: "icon",
    name: "Icon",
    minOvr: 95,
    maxOvr: 99
  }
];


/* =========================================================
   STAT LABELS
   ========================================================= */

const STAT_LABELS = {
  pac: "PAC",
  sho: "SHO",
  pas: "PAS",
  dri: "DRI",
  def: "DEF",
  phy: "PHY"
};


/* =========================================================
   STAT WEIGHTS
   ========================================================= */

const STAT_WEIGHTS = {
  GK: {
    pac: 0.05,
    sho: 0.05,
    pas: 0.15,
    dri: 0.05,
    def: 0.35,
    phy: 0.35
  },

  LB: {
    pac: 0.20,
    sho: 0.05,
    pas: 0.15,
    dri: 0.10,
    def: 0.30,
    phy: 0.20
  },

  CB: {
    pac: 0.10,
    sho: 0.05,
    pas: 0.10,
    dri: 0.05,
    def: 0.40,
    phy: 0.30
  },

  RB: {
    pac: 0.20,
    sho: 0.05,
    pas: 0.15,
    dri: 0.10,
    def: 0.30,
    phy: 0.20
  },

  LWB: {
    pac: 0.25,
    sho: 0.05,
    pas: 0.15,
    dri: 0.15,
    def: 0.25,
    phy: 0.15
  },

  RWB: {
    pac: 0.25,
    sho: 0.05,
    pas: 0.15,
    dri: 0.15,
    def: 0.25,
    phy: 0.15
  },

  CDM: {
    pac: 0.10,
    sho: 0.05,
    pas: 0.20,
    dri: 0.10,
    def: 0.30,
    phy: 0.25
  },

  CM: {
    pac: 0.10,
    sho: 0.10,
    pas: 0.20,
    dri: 0.20,
    def: 0.20,
    phy: 0.20
  },

  CAM: {
    pac: 0.10,
    sho: 0.20,
    pas: 0.20,
    dri: 0.25,
    def: 0.05,
    phy: 0.20
  },

  LW: {
    pac: 0.25,
    sho: 0.15,
    pas: 0.10,
    dri: 0.30,
    def: 0.05,
    phy: 0.15
  },

  RW: {
    pac: 0.25,
    sho: 0.15,
    pas: 0.10,
    dri: 0.30,
    def: 0.05,
    phy: 0.15
  },

  ST: {
    pac: 0.15,
    sho: 0.30,
    pas: 0.10,
    dri: 0.20,
    def: 0.05,
    phy: 0.20
  }
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function getStatValue(stat, player = S.player) {
  if (!player || !player.stats) {
    return 0;
  }

  return clamp(
    Number(player.stats[stat]) || 0,
    STAT_SYSTEM.min,
    STAT_SYSTEM.max
  );
}


function setStatValue(stat, value, player = S.player) {
  if (!player || !STAT_SYSTEM.stats.includes(stat)) {
    return false;
  }

  if (!player.stats) {
    player.stats = {};
  }

  player.stats[stat] = clamp(
    Math.round(Number(value) || 0),
    STAT_SYSTEM.min,
    STAT_SYSTEM.max
  );

  return true;
}


function getAllPlayerStats(player = S.player) {
  return STAT_SYSTEM.stats.reduce((result, stat) => {
    result[stat] = getStatValue(stat, player);
    return result;
  }, {});
}


/* =========================================================
   OVR CALCULATION
   ========================================================= */

function calculateStatsOvr(player = S.player) {
  if (!player) {
    return 0;
  }

  const position = player.position || "ST";
  const weights = STAT_WEIGHTS[position] || STAT_WEIGHTS.ST;

  let total = 0;
  let weightTotal = 0;

  STAT_SYSTEM.stats.forEach(stat => {
    const weight = Number(weights[stat]) || 0;
    const value = getStatValue(stat, player);

    total += value * weight;
    weightTotal += weight;
  });

  if (weightTotal <= 0) {
    return calculateBaseOvr(player.stats);
  }

  return clamp(
    Math.round(total / weightTotal),
    1,
    99
  );
}


function calculateStatsOvrForPosition(stats, position) {
  const tempPlayer = {
    position: position || "ST",
    stats: stats || {}
  };

  return calculateStatsOvr(tempPlayer);
}


function refreshStatsOvr(player = S.player) {
  if (!player) {
    return 0;
  }

  const calculatedOvr = calculateStatsOvr(player);

  /*
    Creator Mode can force a custom OVR.
    The actual stats remain untouched.
  */
  if (
    S.admin &&
    S.admin.ovrOverride === true &&
    Number.isFinite(Number(S.admin.forcedOvr))
  ) {
    player.ovr = clamp(
      Math.round(Number(S.admin.forcedOvr)),
      1,
      99
    );

    return player.ovr;
  }

  player.ovr = calculatedOvr;

  return player.ovr;
}


/* =========================================================
   POTENTIAL
   ========================================================= */

function getPlayerPotentialLimit(player = S.player) {
  if (!player) {
    return STAT_SYSTEM.potential.default;
  }

  const potential = Number(player.potential);

  if (!Number.isFinite(potential) || potential <= 0) {
    return STAT_SYSTEM.potential.default;
  }

  return clamp(
    Math.round(potential),
    STAT_SYSTEM.potential.minimum,
    STAT_SYSTEM.potential.maximum
  );
}


function setStatsPotential(value, player = S.player) {
  if (!player) {
    return false;
  }

  player.potential = clamp(
    Math.round(Number(value) || STAT_SYSTEM.potential.default),
    STAT_SYSTEM.potential.minimum,
    STAT_SYSTEM.potential.maximum
  );

  return true;
}


function canImproveStats(player = S.player) {
  if (!player) {
    return false;
  }

  const currentOvr = calculateStatsOvr(player);
  const potential = getPlayerPotentialLimit(player);

  return currentOvr < potential;
}


/* =========================================================
   RARITY HELPERS
   ========================================================= */

function getStatRarityByOvr(ovr) {
  const value = clamp(
    Math.round(Number(ovr) || 0),
    0,
    99
  );

  if (value <= 0) {
    return {
      id: "unrated",
      name: "Unrated",
      minOvr: 0,
      maxOvr: 0
    };
  }

  const rarity = STAT_RARITIES.find(item => {
    return value >= item.minOvr && value <= item.maxOvr;
  });

  return rarity || STAT_RARITIES[0];
}


function getPlayerStatRarity(player = S.player) {
  if (!player) {
    return getStatRarityByOvr(0);
  }

  return getStatRarityByOvr(
    getPlayerOvr(player)
  );
}


function getRarityClass(ovr) {
  return `ovr-${getStatRarityByOvr(ovr).id}`;
}


/* =========================================================
   GACHA ROLL
   ========================================================= */

function rollStatValue(min = STAT_SYSTEM.gacha.minRoll, max = STAT_SYSTEM.gacha.maxRoll) {
  return randomInt(
    clamp(min, 1, 99),
    clamp(max, 1, 99)
  );
}


function rollStarterStats(options = {}) {
  const min = Number.isFinite(Number(options.min))
    ? Number(options.min)
    : STAT_SYSTEM.gacha.minRoll;

  const max = Number.isFinite(Number(options.max))
    ? Number(options.max)
    : STAT_SYSTEM.gacha.maxRoll;

  const stats = {};

  STAT_SYSTEM.stats.forEach(stat => {
    stats[stat] = rollStatValue(min, max);
  });

  return stats;
}


function rollStatsForPosition(position, options = {}) {
  const stats = rollStarterStats(options);

  const ovr = calculateStatsOvrForPosition(
    stats,
    position
  );

  return {
    stats,
    ovr,
    rarity: getStatRarityByOvr(ovr)
  };
}


/* =========================================================
   GACHA RESULT
   ========================================================= */

function createGachaResult(stats, position = "ST") {
  const normalizedStats = {};

  STAT_SYSTEM.stats.forEach(stat => {
    normalizedStats[stat] = clamp(
      Math.round(Number(stats?.[stat]) || 0),
      STAT_SYSTEM.min,
      STAT_SYSTEM.max
    );
  });

  const ovr = calculateStatsOvrForPosition(
    normalizedStats,
    position
  );

  return {
    stats: normalizedStats,
    ovr,
    rarity: getStatRarityByOvr(ovr),
    position
  };
}


function applyGachaResult(result, player = S.player) {
  if (!player || !result || !result.stats) {
    return false;
  }

  if (!player.stats) {
    player.stats = {};
  }

  STAT_SYSTEM.stats.forEach(stat => {
    player.stats[stat] = clamp(
      Math.round(Number(result.stats[stat]) || 0),
      STAT_SYSTEM.min,
      STAT_SYSTEM.max
    );
  });

  refreshStatsOvr(player);

  return true;
}


/* =========================================================
   REROLL
   ========================================================= */

function rerollPlayerStats(options = {}) {
  const player = options.player || S.player;

  if (!player) {
    return null;
  }

  const result = rollStatsForPosition(
    player.position || "ST",
    options
  );

  if (options.apply !== false) {
    applyGachaResult(result, player);
  }

  return result;
}


/* =========================================================
   STAT GROWTH
   ========================================================= */

function getRandomGrowthAmount() {
  return randomInt(
    STAT_SYSTEM.gacha.growthPerLevel.min,
    STAT_SYSTEM.gacha.growthPerLevel.max
  );
}


function improveStat(stat, amount = 1, player = S.player) {
  if (!player || !STAT_SYSTEM.stats.includes(stat)) {
    return false;
  }

  const potential = getPlayerPotentialLimit(player);
  const currentOvr = calculateStatsOvr(player);

  if (currentOvr >= potential) {
    return false;
  }

  const currentValue = getStatValue(stat, player);

  setStatValue(
    stat,
    currentValue + Math.max(1, Math.round(amount)),
    player
  );

  refreshStatsOvr(player);

  /*
    Never allow calculated OVR to exceed potential
    unless Creator Mode has explicitly forced OVR.
  */
  if (
    !(S.admin?.ovrOverride === true) &&
    player.ovr > potential
  ) {
    player.ovr = potential;
  }

  return true;
}


function improveRandomStat(player = S.player) {
  if (!player || !canImproveStats(player)) {
    return false;
  }

  const availableStats = STAT_SYSTEM.stats.filter(stat => {
    return getStatValue(stat, player) < 99;
  });

  if (availableStats.length === 0) {
    return false;
  }

  const stat = randomItem(availableStats);
  const amount = getRandomGrowthAmount();

  const changed = improveStat(
    stat,
    amount,
    player
  );

  if (changed) {
    addCreatorLog?.(
      "STAT_GROWTH",
      stat,
      null,
      getStatValue(stat, player)
    );
  }

  return changed;
}


/* =========================================================
   TRAINING STAT GROWTH
   ========================================================= */

function trainStat(stat, amount = 1, player = S.player) {
  if (!player) {
    return false;
  }

  const before = getStatValue(stat, player);

  const result = improveStat(
    stat,
    amount,
    player
  );

  if (!result) {
    return false;
  }

  const after = getStatValue(stat, player);

  addCreatorLog?.(
    "TRAIN_STAT",
    stat,
    before,
    after
  );

  return {
    stat,
    before,
    after,
    difference: after - before,
    ovr: calculateStatsOvr(player)
  };
}


/* =========================================================
   MULTI-STAT GROWTH
   ========================================================= */

function trainMultipleStats(changes = {}, player = S.player) {
  if (!player) {
    return false;
  }

  const results = [];

  Object.entries(changes).forEach(([stat, amount]) => {
    const result = trainStat(
      stat,
      amount,
      player
    );

    if (result) {
      results.push(result);
    }
  });

  refreshStatsOvr(player);

  return results;
}


/* =========================================================
   POSITION CHANGE
   ========================================================= */

function recalculateStatsForPosition(
  position,
  player = S.player
) {
  if (!player) {
    return 0;
  }

  player.position = position;

  return refreshStatsOvr(player);
}


/* =========================================================
   STAT SUMMARY
   ========================================================= */

function getStatsSummary(player = S.player) {
  if (!player) {
    return null;
  }

  const stats = getAllPlayerStats(player);
  const ovr = calculateStatsOvr(player);
  const potential = getPlayerPotentialLimit(player);
  const rarity = getStatRarityByOvr(ovr);

  return {
    stats,
    ovr,
    potential,
    rarity,
    canImprove: ovr < potential
  };
}


/* =========================================================
   STAT DISPLAY
   ========================================================= */

function getStatLabel(stat) {
  return STAT_LABELS[stat] || String(stat).toUpperCase();
}


function getStatPercentage(value) {
  return clamp(
    Number(value) || 0,
    0,
    99
  );
}


function getStatDisplay(stat, player = S.player) {
  const value = getStatValue(
    stat,
    player
  );

  return {
    id: stat,
    label: getStatLabel(stat),
    value,
    percentage: getStatPercentage(value)
  };
}


function getAllStatDisplays(player = S.player) {
  return STAT_SYSTEM.stats.map(stat => {
    return getStatDisplay(
      stat,
      player
    );
  });
}


/* =========================================================
   CHARACTER CREATION GACHA
   ========================================================= */

function initializeCharacterGacha() {
  const position =
    S.player?.position ||
    "ST";

  return rollStatsForPosition(
    position,
    {
      min: STAT_SYSTEM.gacha.minRoll,
      max: STAT_SYSTEM.gacha.maxRoll
    }
  );
}


function applyCharacterGacha(stats) {
  if (!S.player) {
    return false;
  }

  const result =
    stats?.stats
      ? stats
      : createGachaResult(
          stats,
          S.player.position || "ST"
        );

  return applyGachaResult(
    result,
    S.player
  );
}


/* =========================================================
   CREATOR MODE SUPPORT
   ========================================================= */

function creatorSetStat(stat, value) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  const before = getStatValue(
    stat,
    S.player
  );

  const changed = setStatValue(
    stat,
    value,
    S.player
  );

  if (!changed) {
    return false;
  }

  refreshStatsOvr(S.player);

  addCreatorLog?.(
    "CREATOR_SET_STAT",
    stat,
    before,
    getStatValue(stat, S.player)
  );

  return true;
}


function creatorSetAllStats(stats = {}) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  STAT_SYSTEM.stats.forEach(stat => {
    if (stats[stat] !== undefined) {
      setStatValue(
        stat,
        stats[stat],
        S.player
      );
    }
  });

  refreshStatsOvr(S.player);

  addCreatorLog?.(
    "CREATOR_SET_ALL_STATS",
    "player.stats",
    null,
    getAllPlayerStats(S.player)
  );

  return true;
}


function creatorSetOvr(ovr) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  const value = clamp(
    Math.round(Number(ovr) || 0),
    1,
    99
  );

  const before = S.player.ovr;

  S.admin.ovrOverride = true;
  S.admin.forcedOvr = value;

  S.player.ovr = value;

  addCreatorLog?.(
    "CREATOR_SET_OVR",
    "player.ovr",
    before,
    value
  );

  return true;
}


function creatorClearOvrOverride() {
  if (!S.admin?.creatorMode) {
    return false;
  }

  S.admin.ovrOverride = false;
  S.admin.forcedOvr = null;

  refreshStatsOvr(S.player);

  addCreatorLog?.(
    "CREATOR_CLEAR_OVR",
    "player.ovr",
    null,
    S.player.ovr
  );

  return true;
}


/* =========================================================
   VALIDATION
   ========================================================= */

function validatePlayerStats(player = S.player) {
  if (!player) {
    return false;
  }

  if (!player.stats) {
    player.stats = {};
  }

  STAT_SYSTEM.stats.forEach(stat => {
    player.stats[stat] = clamp(
      Math.round(Number(player.stats[stat]) || 0),
      0,
      99
    );
  });

  if (!S.admin?.ovrOverride) {
    refreshStatsOvr(player);
  }

  return true;
}


/* =========================================================
   REPAIR
   ========================================================= */

function repairPlayerStats(player = S.player) {
  if (!player) {
    return false;
  }

  if (!player.stats) {
    player.stats = {};
  }

  STAT_SYSTEM.stats.forEach(stat => {
    if (!Number.isFinite(Number(player.stats[stat]))) {
      player.stats[stat] = 0;
    }

    player.stats[stat] = clamp(
      Math.round(Number(player.stats[stat])),
      0,
      99
    );
  });

  if (
    !Number.isFinite(Number(player.potential)) ||
    Number(player.potential) <= 0
  ) {
    player.potential =
      STAT_SYSTEM.potential.default;
  }

  player.potential = clamp(
    Math.round(Number(player.potential)),
    STAT_SYSTEM.potential.minimum,
    STAT_SYSTEM.potential.maximum
  );

  refreshStatsOvr(player);

  return true;
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeStatsSystem() {
  if (!S.player.stats) {
    S.player.stats = {};
  }

  STAT_SYSTEM.stats.forEach(stat => {
    if (!Number.isFinite(Number(S.player.stats[stat]))) {
      S.player.stats[stat] = 0;
    }
  });

  repairPlayerStats(
    S.player
  );

  return true;
}


const STATS_SYSTEM_READY =
  initializeStatsSystem();
