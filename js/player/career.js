 /* =========================================================
    RV SPORTS: FC CUP 26
    PLAYER CAREER SYSTEM
    File: js/player/career.js
    ========================================================= */


/* =========================================================
   CAREER CONFIG
   ========================================================= */

const CAREER_CONFIG = {
  startingSeason: 2026,

  defaultContractYears: 3,

  maxClubHistory: 50,

  maxSeasonHistory: 50,

  transferStatus: [
    "None",
    "Listed",
    "Negotiating",
    "Accepted",
    "Rejected",
    "Completed"
  ]
};


/* =========================================================
   CAREER GETTERS
   ========================================================= */

function getCareer() {
  return S.career;
}


function getCareerStatus() {
  return S.career?.careerStatus || "Unstarted";
}


function getCurrentClubId() {
  return (
    S.player?.currentClub?.clubId ||
    S.career?.currentClubId ||
    ""
  );
}


function getCurrentClub() {
  const clubId = getCurrentClubId();

  if (!clubId) {
    return null;
  }

  if (
    typeof getClubById === "function"
  ) {
    return getClubById(clubId);
  }

  if (Array.isArray(S.world?.clubs)) {
    return S.world.clubs.find(
      club => club.id === clubId
    ) || null;
  }

  return null;
}


function getClubHistory() {
  return Array.isArray(S.player?.clubs)
    ? S.player.clubs
    : [];
}


function getSeasonHistory() {
  return Array.isArray(S.career?.seasonHistory)
    ? S.career.seasonHistory
    : [];
}


/* =========================================================
   CAREER INITIALIZATION
   ========================================================= */

function initializeCareer(options = {}) {
  if (!S.career) {
    return false;
  }

  const startDate =
    options.startDate ||
    S.career.startDate ||
    new Date().toISOString();

  const season =
    Number(options.season) ||
    Number(S.career.currentSeason) ||
    CAREER_CONFIG.startingSeason;

  S.career.started = true;
  S.career.startDate = startDate;
  S.career.currentSeason = season;
  S.career.currentYear =
    Number(options.year) ||
    season;

  S.career.currentMonth =
    Number(options.month) ||
    S.career.currentMonth ||
    7;

  S.career.currentDay =
    Number(options.day) ||
    S.career.currentDay ||
    1;

  S.career.careerStatus = "Active";
  S.career.transferStatus = "None";

  if (options.clubId) {
    assignCareerClub(
      options.clubId,
      {
        role: options.role || "Player",
        shirtNumber: options.shirtNumber
      }
    );
  }

  if (options.country) {
    if (!S.player.nationalTeam) {
      S.player.nationalTeam = {
        country: "",
        caps: 0,
        goals: 0,
        assists: 0,
        trophies: []
      };
    }

    S.player.nationalTeam.country =
      options.country;
  }

  return true;
}


/* =========================================================
   CLUB ASSIGNMENT
   ========================================================= */

function assignCareerClub(
  clubId,
  options = {}
) {
  if (!clubId || !S.player) {
    return false;
  }

  const previousClubId =
    S.player.currentClub?.clubId ||
    "";

  const now =
    options.joined ||
    new Date().toISOString();

  const contractYears =
    Number(options.contractYears) ||
    CAREER_CONFIG.defaultContractYears;

  const contractUntil =
    options.contractUntil ||
    calculateContractEndDate(
      now,
      contractYears
    );

  if (!S.player.currentClub) {
    S.player.currentClub = {
      clubId: "",
      joined: null,
      contractUntil: null,
      shirtNumber: 0,
      role: "Player"
    };
  }

  S.player.currentClub.clubId =
    clubId;

  S.player.currentClub.joined =
    now;

  S.player.currentClub.contractUntil =
    contractUntil;

  S.player.currentClub.shirtNumber =
    Number(options.shirtNumber) ||
    S.player.shirtNumber ||
    0;

  S.player.currentClub.role =
    options.role ||
    "Player";

  S.career.currentClubId =
    clubId;

  S.career.previousClubId =
    previousClubId;

  if (
    previousClubId &&
    previousClubId !== clubId
  ) {
    addClubHistoryEntry({
      clubId: previousClubId,
      left: now,
      reason: options.reason || "Transfer"
    });
  }

  return true;
}


/* =========================================================
   CONTRACT DATE
   ========================================================= */

function calculateContractEndDate(
  startDate,
  years = 3
) {
  const date =
    new Date(startDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setFullYear(
    date.getFullYear() +
    Number(years)
  );

  return date.toISOString();
}


/* =========================================================
   LEAVE CLUB
   ========================================================= */

function leaveCareerClub(
  reason = "Released"
) {
  if (!S.player?.currentClub) {
    return false;
  }

  const clubId =
    S.player.currentClub.clubId;

  if (!clubId) {
    return false;
  }

  const now =
    new Date().toISOString();

  addClubHistoryEntry({
    clubId,
    joined:
      S.player.currentClub.joined,
    contractUntil:
      S.player.currentClub.contractUntil,
    shirtNumber:
      S.player.currentClub.shirtNumber,
    role:
      S.player.currentClub.role,
    left: now,
    reason
  });

  S.career.previousClubId =
    clubId;

  S.career.currentClubId =
    "";

  S.player.currentClub = {
    clubId: "",
    joined: null,
    contractUntil: null,
    shirtNumber: 0,
    role: "Player"
  };

  return true;
}


/* =========================================================
   CLUB HISTORY
   ========================================================= */

function addClubHistoryEntry(entry = {}) {
  if (!S.player) {
    return false;
  }

  if (!Array.isArray(S.player.clubs)) {
    S.player.clubs = [];
  }

  const historyEntry = {
    id:
      entry.id ||
      createId("club"),

    clubId:
      entry.clubId || "",

    joined:
      entry.joined ||
      new Date().toISOString(),

    left:
      entry.left ||
      null,

    contractUntil:
      entry.contractUntil ||
      null,

    shirtNumber:
      Number(entry.shirtNumber) ||
      0,

    role:
      entry.role ||
      "Player",

    appearances:
      Number(entry.appearances) ||
      0,

    goals:
      Number(entry.goals) ||
      0,

    assists:
      Number(entry.assists) ||
      0,

    trophies:
      Array.isArray(entry.trophies)
        ? entry.trophies
        : [],

    reason:
      entry.reason ||
      "Career"

  };

  S.player.clubs.push(
    historyEntry
  );

  if (
    S.player.clubs.length >
    CAREER_CONFIG.maxClubHistory
  ) {
    S.player.clubs =
      S.player.clubs.slice(
        -CAREER_CONFIG.maxClubHistory
      );
  }

  return historyEntry;
}


function updateClubHistoryStats(
  clubId,
  changes = {}
) {
  if (!clubId || !Array.isArray(S.player?.clubs)) {
    return false;
  }

  const entry =
    [...S.player.clubs]
      .reverse()
      .find(item =>
        item.clubId === clubId &&
        !item.left
      );

  if (!entry) {
    return false;
  }

  if (changes.appearances !== undefined) {
    entry.appearances =
      Math.max(
        0,
        Number(changes.appearances)
      );
  }

  if (changes.goals !== undefined) {
    entry.goals =
      Math.max(
        0,
        Number(changes.goals)
      );
  }

  if (changes.assists !== undefined) {
    entry.assists =
      Math.max(
        0,
        Number(changes.assists)
      );
  }

  return true;
}


/* =========================================================
   MATCH RECORDS
   ========================================================= */

function recordMatch(result = {}) {
  if (!S.player || !S.career) {
    return false;
  }

  const outcome =
    result.outcome ||
    getMatchOutcome(
      result.goalsFor,
      result.goalsAgainst
    );

  S.player.career.appearances++;

  S.career.matchesPlayedThisSeason++;

  S.player.career.minutesPlayed +=
    Number(result.minutes) ||
    90;

  if (outcome === "Win") {
    S.player.career.wins++;
  }

  if (outcome === "Loss") {
    S.player.career.losses++;
  }

  if (outcome === "Draw") {
    S.player.career.draws++;
  }

  if (outcome === "Win") {
    S.career.matchesPlayedThisSeason =
      Math.max(
        0,
        Number(
          S.career.matchesPlayedThisSeason
        )
      );
  }

  const clubId =
    getCurrentClubId();

  if (clubId) {
    updateActiveClubHistory(
      clubId
    );
  }

  return {
    outcome,
    appearances:
      S.player.career.appearances,
    seasonMatches:
      S.career.matchesPlayedThisSeason
  };
}


function getMatchOutcome(
  goalsFor,
  goalsAgainst
) {
  const gf =
    Number(goalsFor) || 0;

  const ga =
    Number(goalsAgainst) || 0;

  if (gf > ga) {
    return "Win";
  }

  if (gf < ga) {
    return "Loss";
  }

  return "Draw";
}


/* =========================================================
   GOAL / ASSIST RECORDS
   ========================================================= */

function recordGoal(amount = 1) {
  if (!S.player || !S.career) {
    return false;
  }

  const value =
    Math.max(
      1,
      Number(amount) || 1
    );

  S.player.career.goals +=
    value;

  S.career.goalsThisSeason +=
    value;

  updateActiveClubHistory();

  return true;
}


function recordAssist(amount = 1) {
  if (!S.player || !S.career) {
    return false;
  }

  const value =
    Math.max(
      1,
      Number(amount) || 1
    );

  S.player.career.assists +=
    value;

  S.career.assistsThisSeason +=
    value;

  updateActiveClubHistory();

  return true;
}


function recordCleanSheet(
  amount = 1
) {
  if (!S.player) {
    return false;
  }

  S.player.career.cleanSheets +=
    Math.max(
      1,
      Number(amount) || 1
    );

  return true;
}


/* =========================================================
   ACTIVE CLUB HISTORY UPDATE
   ========================================================= */

function updateActiveClubHistory(
  clubId = getCurrentClubId()
) {
  if (!clubId) {
    return false;
  }

  let entry =
    [...(S.player.clubs || [])]
      .reverse()
      .find(item =>
        item.clubId === clubId &&
        !item.left
      );

  if (!entry) {
    entry = addClubHistoryEntry({
      clubId,
      joined:
        S.player.currentClub?.joined ||
        new Date().toISOString(),
      contractUntil:
        S.player.currentClub?.contractUntil ||
        null,
      shirtNumber:
        S.player.currentClub?.shirtNumber ||
        0,
      role:
        S.player.currentClub?.role ||
        "Player"
    });
  }

  entry.appearances =
    Number(
      entry.appearances
    ) || 0;

  entry.goals =
    Number(
      entry.goals
    ) || 0;

  entry.assists =
    Number(
      entry.assists
    ) || 0;

  /*
    Career totals are used as the source
    for the active club record.
  */
  entry.appearances =
    S.player.career.appearances;

  entry.goals =
    S.player.career.goals;

  entry.assists =
    S.player.career.assists;

  return true;
}


/* =========================================================
   SEASON SYSTEM
   ========================================================= */

function startNewSeason(
  season,
  options = {}
) {
  if (!S.career || !S.player) {
    return false;
  }

  const newSeason =
    Number(season) ||
    Number(S.career.currentSeason) + 1;

  saveCurrentSeason();

  S.career.currentSeason =
    newSeason;

  S.career.currentYear =
    Number(options.year) ||
    newSeason;

  S.career.currentMonth =
    Number(options.month) ||
    7;

  S.career.currentDay =
    Number(options.day) ||
    1;

  S.career.matchesPlayedThisSeason = 0;
  S.career.goalsThisSeason = 0;
  S.career.assistsThisSeason = 0;
  S.career.trophiesThisSeason = [];

  S.career.totalSeasons =
    Number(S.career.totalSeasons) + 1;

  S.career.careerStatus =
    "Active";

  return true;
}


function saveCurrentSeason() {
  if (!S.career || !S.player) {
    return false;
  }

  const season =
    Number(S.career.currentSeason) ||
    CAREER_CONFIG.startingSeason;

  const existingIndex =
    S.career.seasonHistory.findIndex(
      item =>
        Number(item.season) === season
    );

  const seasonData = {
    season,

    clubId:
      getCurrentClubId(),

    appearances:
      Number(
        S.career.matchesPlayedThisSeason
      ) || 0,

    goals:
      Number(
        S.career.goalsThisSeason
      ) || 0,

    assists:
      Number(
        S.career.assistsThisSeason
      ) || 0,

    trophies:
      Array.isArray(
        S.career.trophiesThisSeason
      )
        ? deepClone(
            S.career.trophiesThisSeason
          )
        : [],

    playerOvr:
      getPlayerOvr(
        S.player
      ),

    playerLevel:
      Number(S.player.level) || 1,

    savedAt:
      new Date().toISOString()
  };

  if (existingIndex >= 0) {
    S.career.seasonHistory[
      existingIndex
    ] = seasonData;
  } else {
    S.career.seasonHistory.push(
      seasonData
    );
  }

  if (
    S.career.seasonHistory.length >
    CAREER_CONFIG.maxSeasonHistory
  ) {
    S.career.seasonHistory =
      S.career.seasonHistory.slice(
        -CAREER_CONFIG.maxSeasonHistory
      );
  }

  return seasonData;
}


/* =========================================================
   SEASON TROPHIES
   ========================================================= */

function addSeasonTrophy(
  trophy
) {
  if (!S.career) {
    return false;
  }

  if (
    !Array.isArray(
      S.career.trophiesThisSeason
    )
  ) {
    S.career.trophiesThisSeason = [];
  }

  const trophyData =
    typeof trophy === "object"
      ? trophy
      : createTrophy({
          name: String(trophy),
          category: "Club",
          season:
            S.career.currentSeason
        });

  S.career.trophiesThisSeason.push(
    trophyData
  );

  return trophyData;
}


/* =========================================================
   CAREER TROPHIES
   ========================================================= */

function addCareerTrophy(
  trophy
) {
  if (!S.player) {
    return false;
  }

  const trophyData =
    typeof trophy === "object"
      ? trophy
      : createTrophy({
          name: String(trophy),
          category: "Club",
          season:
            S.career.currentSeason
        });

  const category =
    String(
      trophyData.category ||
      "club"
    ).toLowerCase();

  if (
    category === "national" ||
    category === "national team"
  ) {
    S.player.trophies.national.push(
      trophyData
    );
  } else if (
    category === "individual"
  ) {
    S.player.trophies.individual.push(
      trophyData
    );
  } else {
    S.player.trophies.club.push(
      trophyData
    );
  }

  addSeasonTrophy(
    trophyData
  );

  return trophyData;
}


/* =========================================================
   TRANSFER SYSTEM
   ========================================================= */

function setTransferStatus(
  status
) {
  if (!S.career) {
    return false;
  }

  const normalized =
    String(status || "None");

  if (
    !CAREER_CONFIG.transferStatus.includes(
      normalized
    )
  ) {
    return false;
  }

  S.career.transferStatus =
    normalized;

  return true;
}


function createCareerTransferOffer(
  options = {}
) {
  if (!S.career) {
    return null;
  }

  const offer =
    createTransferOffer({
      clubId:
        options.clubId ||
        options.toClubId ||
        "",

      fromClubId:
        options.fromClubId ||
        getCurrentClubId(),

      salary:
        Number(options.salary) ||
        0,

      fee:
        Number(options.fee) ||
        0,

      contractYears:
        Number(options.contractYears) ||
        CAREER_CONFIG.defaultContractYears,

      status:
        options.status ||
        "Pending",

      date:
        options.date ||
        new Date().toISOString()
    });

  S.career.transferOffers.push(
    offer
  );

  return offer;
}


function getTransferOffers() {
  return Array.isArray(
    S.career?.transferOffers
  )
    ? S.career.transferOffers
    : [];
}


/* =========================================================
   ACCEPT TRANSFER
   ========================================================= */

function acceptTransferOffer(
  offerId
) {
  if (!S.career) {
    return false;
  }

  const offer =
    S.career.transferOffers.find(
      item =>
        item.id === offerId
    );

  if (!offer) {
    return false;
  }

  offer.status =
    "Accepted";

  S.career.transferStatus =
    "Accepted";

  return offer;
}


/* =========================================================
   COMPLETE TRANSFER
   ========================================================= */

function completeTransfer(
  offerId,
  options = {}
) {
  if (!S.career) {
    return false;
  }

  const offer =
    S.career.transferOffers.find(
      item =>
        item.id === offerId
    );

  if (!offer) {
    return false;
  }

  if (
    offer.status !== "Accepted" &&
    options.force !== true
  ) {
    return false;
  }

  const oldClubId =
    getCurrentClubId();

  const newClubId =
    options.clubId ||
    offer.clubId ||
    offer.toClubId;

  if (!newClubId) {
    return false;
  }

  const transferDate =
    options.date ||
    new Date().toISOString();

  if (
    oldClubId &&
    oldClubId !== newClubId
  ) {
    addClubHistoryEntry({
      clubId: oldClubId,
      joined:
        S.player.currentClub?.joined,
      left: transferDate,
      contractUntil:
        S.player.currentClub?.contractUntil,
      shirtNumber:
        S.player.currentClub?.shirtNumber,
      role:
        S.player.currentClub?.role,
      reason: "Transfer"
    });
  }

  assignCareerClub(
    newClubId,
    {
      joined: transferDate,
      contractYears:
        Number(
          offer.contractYears
        ) ||
        CAREER_CONFIG.defaultContractYears,

      shirtNumber:
        Number(
          options.shirtNumber
        ) ||
        S.player.shirtNumber ||
        0,

      role:
        options.role ||
        "Player",

      reason:
        "Transfer"
    }
  );

  if (
    offer.salary &&
    S.player.economy
  ) {
    S.player.economy.salary =
      Number(offer.salary);
  }

  offer.status =
    "Completed";

  offer.completedAt =
    transferDate;

  S.career.transferStatus =
    "Completed";

  return true;
}


/* =========================================================
   CAREER DATE
   ========================================================= */

function advanceCareerDays(
  days = 1
) {
  if (!S.career) {
    return false;
  }

  let amount =
    Math.max(
      1,
      Math.floor(
        Number(days) || 1
      )
    );

  while (amount > 0) {
    S.career.currentDay++;

    if (
      S.career.currentDay > 30
    ) {
      S.career.currentDay = 1;
      S.career.currentMonth++;
    }

    if (
      S.career.currentMonth > 12
    ) {
      S.career.currentMonth = 1;
      S.career.currentYear++;

      if (
        S.career.currentSeason ===
        S.career.currentYear - 1
      ) {
        S.career.currentSeason =
          S.career.currentYear;
      }
    }

    amount--;
  }

  return getCareerDate();
}


function getCareerDate() {
  return {
    year:
      Number(
        S.career?.currentYear
      ) || 2026,

    month:
      Number(
        S.career?.currentMonth
      ) || 1,

    day:
      Number(
        S.career?.currentDay
      ) || 1,

    season:
      Number(
        S.career?.currentSeason
      ) || 2026
  };
}


/* =========================================================
   CAREER SUMMARY
   ========================================================= */

function getCareerSummary() {
  if (!S.player || !S.career) {
    return null;
  }

  return {
    playerName:
      getPlayerDisplayName(
        S.player
      ),

    ovr:
      getPlayerOvr(
        S.player
      ),

    level:
      Number(
        S.player.level
      ) || 1,

    currentClubId:
      getCurrentClubId(),

    currentSeason:
      Number(
        S.career.currentSeason
      ) || 2026,

    appearances:
      Number(
        S.player.career.appearances
      ) || 0,

    goals:
      Number(
        S.player.career.goals
      ) || 0,

    assists:
      Number(
        S.player.career.assists
      ) || 0,

    cleanSheets:
      Number(
        S.player.career.cleanSheets
      ) || 0,

    wins:
      Number(
        S.player.career.wins
      ) || 0,

    losses:
      Number(
        S.player.career.losses
      ) || 0,

    draws:
      Number(
        S.player.career.draws
      ) || 0,

    trophies:
      countPlayerTrophies(
        S.player
      ),

    clubs:
      getClubHistory().length,

    seasons:
      getSeasonHistory().length,

    careerStatus:
      getCareerStatus()
  };
}


/* =========================================================
   CAREER RECORD
   ========================================================= */

function getCareerRecord() {
  if (!S.player) {
    return null;
  }

  return {
    appearances:
      Number(
        S.player.career.appearances
      ) || 0,

    goals:
      Number(
        S.player.career.goals
      ) || 0,

    assists:
      Number(
        S.player.career.assists
      ) || 0,

    cleanSheets:
      Number(
        S.player.career.cleanSheets
      ) || 0,

    wins:
      Number(
        S.player.career.wins
      ) || 0,

    losses:
      Number(
        S.player.career.losses
      ) || 0,

    draws:
      Number(
        S.player.career.draws
      ) || 0,

    minutesPlayed:
      Number(
        S.player.career.minutesPlayed
      ) || 0
  };
}


/* =========================================================
   CAREER STATUS
   ========================================================= */

function endCareer(
  reason = "Retired"
) {
  if (!S.career) {
    return false;
  }

  saveCurrentSeason();

  S.career.careerStatus =
    reason;

  S.career.transferStatus =
    "None";

  return true;
}


function retirePlayer() {
  return endCareer(
    "Retired"
  );
}


/* =========================================================
   CAREER REPAIR
   ========================================================= */

function repairCareerData() {
  if (!S.career || !S.player) {
    return false;
  }

  const numericCareerFields = [
    "appearances",
    "goals",
    "assists",
    "cleanSheets",
    "wins",
    "losses",
    "draws",
    "minutesPlayed"
  ];

  if (!S.player.career) {
    S.player.career = {};
  }

  numericCareerFields.forEach(
    field => {
      S.player.career[field] =
        Math.max(
          0,
          Number(
            S.player.career[field]
          ) || 0
        );
    }
  );

  if (!Array.isArray(S.player.clubs)) {
    S.player.clubs = [];
  }

  if (!Array.isArray(
    S.player.trophies?.club
  )) {
    S.player.trophies.club = [];
  }

  if (!Array.isArray(
    S.player.trophies?.national
  )) {
    S.player.trophies.national = [];
  }

  if (!Array.isArray(
    S.player.trophies?.individual
  )) {
    S.player.trophies.individual = [];
  }

  if (!Array.isArray(
    S.career.seasonHistory
  )) {
    S.career.seasonHistory = [];
  }

  if (!Array.isArray(
    S.career.transferOffers
  )) {
    S.career.transferOffers = [];
  }

  S.career.matchesPlayedThisSeason =
    Math.max(
      0,
      Number(
        S.career.matchesPlayedThisSeason
      ) || 0
    );

  S.career.goalsThisSeason =
    Math.max(
      0,
      Number(
        S.career.goalsThisSeason
      ) || 0
    );

  S.career.assistsThisSeason =
    Math.max(
      0,
      Number(
        S.career.assistsThisSeason
      ) || 0
    );

  return true;
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeCareerSystem() {
  if (!S.career || !S.player) {
    return false;
  }

  repairCareerData();

  if (!S.career.started) {
    S.career.currentSeason =
      Number(
        S.career.currentSeason
      ) ||
      CAREER_CONFIG.startingSeason;
  }

  return true;
}


const CAREER_SYSTEM_READY =
  initializeCareerSystem();
