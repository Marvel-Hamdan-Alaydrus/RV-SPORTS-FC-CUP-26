/* =========================================================
   RV SPORTS: FC CUP 26
   js/player/player.js
   Player Lifecycle & Character Management
   ========================================================= */


/* =========================================================
   PLAYER CONSTANTS
   ========================================================= */

const PLAYER_POSITIONS = [
  "GK",
  "LB",
  "CB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LW",
  "RW",
  "ST"
];


const PLAYER_DEFAULTS = {
  age: 18,
  shirtNumber: 0,
  ovr: 0,
  potential: 0,
  level: 1,
  experience: 0,
  form: 100,
  morale: 100,
  fitness: 100,
  energy: 100,
  health: 100
};


const PLAYER_LIMITS = {
  minAge: 15,
  maxAge: 45,
  minShirtNumber: 1,
  maxShirtNumber: 99,
  minPotential: 1,
  maxPotential: 99
};


/* =========================================================
   PLAYER GETTERS
   ========================================================= */

function getPlayer() {
  return S.player;
}


function getPlayerName() {
  return (
    S.player?.name ||
    "Unnamed Player"
  );
}


function getPlayerShirtName() {
  return (
    S.player?.shirtName ||
    getPlayerName()
  );
}


function getPlayerPosition() {
  return (
    S.player?.position ||
    ""
  );
}


function getPlayerNationality() {
  return (
    S.player?.nationality ||
    ""
  );
}


function getPlayerAge() {

  if (
    !S.player?.birthDate
  ) {
    return Number(
      S.player?.age ||
      PLAYER_DEFAULTS.age
    );
  }

  return calculateAge(
    S.player.birthDate
  );
}


function getPlayerLevel() {
  return Number(
    S.player?.level ||
    PLAYER_DEFAULTS.level
  );
}


function getPlayerPotential() {
  return clamp(
    Number(
      S.player?.potential ||
      0
    ),
    0,
    99
  );
}


/* =========================================================
   PLAYER VALIDATION
   ========================================================= */

function validatePlayerData(
  data = S.player
) {

  const errors = [];

  if (!data) {
    errors.push(
      "Player data tidak tersedia."
    );

    return {
      valid: false,
      errors
    };
  }


  /*
    Name
  */

  if (
    !data.name ||
    String(data.name).trim().length < 2
  ) {
    errors.push(
      "Nama pemain minimal 2 karakter."
    );
  }


  /*
    Position
  */

  if (
    !PLAYER_POSITIONS.includes(
      String(
        data.position || ""
      ).toUpperCase()
    )
  ) {
    errors.push(
      "Posisi pemain belum dipilih."
    );
  }


  /*
    Nationality
  */

  if (
    !data.nationality ||
    String(data.nationality).trim().length < 2
  ) {
    errors.push(
      "Negara belum dipilih."
    );
  }


  /*
    Birth date
  */

  if (
    !data.birthDate
  ) {
    errors.push(
      "Tanggal lahir belum diisi."
    );
  }


  /*
    Age
  */

  const age =
    getPlayerAge();

  if (
    age < PLAYER_LIMITS.minAge ||
    age > PLAYER_LIMITS.maxAge
  ) {
    errors.push(
      `Umur harus antara ${PLAYER_LIMITS.minAge} dan ${PLAYER_LIMITS.maxAge} tahun.`
    );
  }


  /*
    Stats
  */

  const stats =
    data.stats || {};

  const statKeys = [
    "pac",
    "sho",
    "pas",
    "dri",
    "def",
    "phy"
  ];

  statKeys.forEach(key => {

    const value =
      Number(stats[key] || 0);

    if (
      value < 0 ||
      value > 99
    ) {
      errors.push(
        `Stat ${key.toUpperCase()} tidak valid.`
      );
    }
  });


  return {
    valid: errors.length === 0,
    errors
  };
}


/* =========================================================
   PLAYER CREATION
   ========================================================= */

function createPlayer(data = {}) {

  /*
    Reset player terlebih dahulu.
  */

  const player =
    createDefaultPlayer();


  /*
    Basic identity
  */

  player.name =
    String(
      data.name || ""
    ).trim();

  player.shirtName =
    String(
      data.shirtName ||
      player.name
    ).trim();

  player.email =
    String(
      data.email || ""
    ).trim();

  player.birthDate =
    data.birthDate || "";

  player.birthPlace =
    String(
      data.birthPlace || ""
    ).trim();

  player.nationality =
    String(
      data.nationality || ""
    ).trim();

  player.position =
    String(
      data.position || ""
    ).toUpperCase();


  /*
    Shirt
  */

  player.shirtNumber =
    clamp(
      Number(
        data.shirtNumber ||
        0
      ),
      0,
      PLAYER_LIMITS.maxShirtNumber
    );


  /*
    Photo
  */

  player.photo =
    data.photo || "";


  /*
    Stats
  */

  if (data.stats) {

    player.stats = {
      pac: normalizeStat(
        data.stats.pac
      ),
      sho: normalizeStat(
        data.stats.sho
      ),
      pas: normalizeStat(
        data.stats.pas
      ),
      dri: normalizeStat(
        data.stats.dri
      ),
      def: normalizeStat(
        data.stats.def
      ),
      phy: normalizeStat(
        data.stats.phy
      )
    };

  }


  /*
    Potential
  */

  player.potential =
    clamp(
      Number(
        data.potential ||
        0
      ),
      PLAYER_LIMITS.minPotential,
      PLAYER_LIMITS.maxPotential
    );


  /*
    Calculate OVR
  */

  player.ovr =
    calculatePositionOvr(
      player.stats,
      player.position
    );


  /*
    Basic progression
  */

  player.level =
    Number(
      data.level ||
      PLAYER_DEFAULTS.level
    );

  player.experience =
    Number(
      data.experience ||
      PLAYER_DEFAULTS.experience
    );


  /*
    Condition
  */

  player.form =
    clamp(
      Number(
        data.form ??
        PLAYER_DEFAULTS.form
      ),
      0,
      100
    );

  player.morale =
    clamp(
      Number(
        data.morale ??
        PLAYER_DEFAULTS.morale
      ),
      0,
      100
    );

  player.fitness =
    clamp(
      Number(
        data.fitness ??
        PLAYER_DEFAULTS.fitness
      ),
      0,
      100
    );

  player.energy =
    clamp(
      Number(
        data.energy ??
        PLAYER_DEFAULTS.energy
      ),
      0,
      100
    );

  player.health =
    clamp(
      Number(
        data.health ??
        PLAYER_DEFAULTS.health
      ),
      0,
      100
    );


  /*
    Preferences
  */

  if (data.preferences) {

    player.preferences = {
      preferredFoot:
        data.preferences.preferredFoot ||
        "Right",

      playStyle:
        data.preferences.playStyle ||
        "",

      celebration:
        data.preferences.celebration ||
        ""
    };
  }


  /*
    Apply to global state.
  */

  S.player =
    player;

  /*
    Update age from DOB.
  */

  updatePlayerAge();


  /*
    Update metadata.
  */

  touchGameState();

  return S.player;
}


/* =========================================================
   PLAYER UPDATE
   ========================================================= */

function updatePlayer(
  changes = {}
) {

  if (!S.player) {
    S.player =
      createDefaultPlayer();
  }


  /*
    Basic properties
  */

  const basicFields = [
    "name",
    "shirtName",
    "email",
    "birthDate",
    "birthPlace",
    "nationality",
    "position",
    "shirtNumber",
    "photo"
  ];

  basicFields.forEach(field => {

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        field
      )
    ) {
      S.player[field] =
        changes[field];
    }
  });


  /*
    Position normalize
  */

  if (S.player.position) {

    S.player.position =
      String(
        S.player.position
      ).toUpperCase();
  }


  /*
    Stats
  */

  if (changes.stats) {

    S.player.stats = {
      ...S.player.stats,

      ...changes.stats
    };

    normalizePlayerStats();
  }


  /*
    Potential
  */

  if (
    Object.prototype.hasOwnProperty.call(
      changes,
      "potential"
    )
  ) {

    S.player.potential =
      clamp(
        Number(
          changes.potential
        ),
        1,
        99
      );
  }


  /*
    Condition values
  */

  const conditionFields = [
    "form",
    "morale",
    "fitness",
    "energy",
    "health"
  ];

  conditionFields.forEach(field => {

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        field
      )
    ) {

      S.player[field] =
        clamp(
          Number(
            changes[field]
          ),
          0,
          100
        );
    }
  });


  /*
    Recalculate age.
  */

  updatePlayerAge();


  /*
    Recalculate OVR unless Creator override
    is active.
  */

  refreshPlayerOvr();


  touchGameState();

  return S.player;
}


/* =========================================================
   PLAYER AGE
   ========================================================= */

function updatePlayerAge() {

  if (
    !S.player?.birthDate
  ) {
    return (
      S.player.age =
        Number(
          S.player.age ||
          PLAYER_DEFAULTS.age
        )
    );
  }

  S.player.age =
    calculateAge(
      S.player.birthDate
    );

  return S.player.age;
}


/* =========================================================
   PLAYER POSITION
   ========================================================= */

function setPlayerPosition(
  position
) {

  const normalized =
    String(
      position || ""
    ).toUpperCase();

  if (
    !PLAYER_POSITIONS.includes(
      normalized
    )
  ) {

    showToast(
      "Invalid Position",
      "Posisi tersebut tidak tersedia.",
      "error"
    );

    return false;
  }

  S.player.position =
    normalized;

  refreshPlayerOvr();

  touchGameState();

  return true;
}


/* =========================================================
   SHIRT NUMBER
   ========================================================= */

function setShirtNumber(
  number
) {

  const value =
    Number(number);

  if (
    !Number.isInteger(value) ||
    value <
      PLAYER_LIMITS.minShirtNumber ||
    value >
      PLAYER_LIMITS.maxShirtNumber
  ) {

    showToast(
      "Invalid Shirt Number",
      `Nomor punggung harus ${PLAYER_LIMITS.minShirtNumber}-${PLAYER_LIMITS.maxShirtNumber}.`,
      "error"
    );

    return false;
  }

  S.player.shirtNumber =
    value;

  touchGameState();

  return true;
}


/* =========================================================
   PLAYER STATS
   ========================================================= */

function setPlayerStat(
  stat,
  value
) {

  const allowedStats = [
    "pac",
    "sho",
    "pas",
    "dri",
    "def",
    "phy"
  ];

  const key =
    String(
      stat || ""
    ).toLowerCase();

  if (
    !allowedStats.includes(key)
  ) {

    console.warn(
      `[PLAYER] Invalid stat: ${stat}`
    );

    return false;
  }

  if (!S.player.stats) {

    S.player.stats = {
      pac: 0,
      sho: 0,
      pas: 0,
      dri: 0,
      def: 0,
      phy: 0
    };
  }

  S.player.stats[key] =
    normalizeStat(value);

  refreshPlayerOvr();

  touchGameState();

  return true;
}


function normalizePlayerStats() {

  if (!S.player.stats) {
    return;
  }

  const stats = [
    "pac",
    "sho",
    "pas",
    "dri",
    "def",
    "phy"
  ];

  stats.forEach(stat => {

    S.player.stats[stat] =
      clamp(
        Number(
          S.player.stats[stat] || 0
        ),
        0,
        99
      );
  });
}


/* =========================================================
   POTENTIAL
   ========================================================= */

function setPlayerPotential(
  potential
) {

  S.player.potential =
    clamp(
      Number(potential),
      PLAYER_LIMITS.minPotential,
      PLAYER_LIMITS.maxPotential
    );

  touchGameState();

  return S.player.potential;
}


/* =========================================================
   PLAYER CONDITION
   ========================================================= */

function updatePlayerCondition(
  changes = {}
) {

  const fields = [
    "form",
    "morale",
    "fitness",
    "energy",
    "health"
  ];

  fields.forEach(field => {

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        field
      )
    ) {

      S.player[field] =
        clamp(
          Number(
            changes[field]
          ),
          0,
          100
        );
    }
  });

  touchGameState();

  return {
    form: S.player.form,
    morale: S.player.morale,
    fitness: S.player.fitness,
    energy: S.player.energy,
    health: S.player.health
  };
}


/* =========================================================
   PLAYER EXPERIENCE
   ========================================================= */

function addPlayerExperience(
  amount
) {

  const xp =
    Math.max(
      0,
      Number(amount || 0)
    );

  S.player.experience +=
    xp;

  /*
    Simple XP curve.
    Future progression system can replace this.
  */

  const xpNeeded =
    getExperienceForNextLevel();

  while (
    S.player.experience >= xpNeeded
  ) {

    S.player.experience -=
      xpNeeded;

    S.player.level += 1;

    /*
      Small progression reward.
    */

    if (
      S.player.potential > S.player.ovr
    ) {

      improveRandomPlayerStat();
    }

    showToast(
      "Level Up",
      `Player naik ke Level ${S.player.level}.`,
      "success"
    );
  }

  touchGameState();

  return S.player.level;
}


function getExperienceForNextLevel() {

  const level =
    Math.max(
      1,
      Number(
        S.player.level || 1
      )
    );

  return (
    100 +
    ((level - 1) * 50)
  );
}


function improveRandomPlayerStat() {

  if (
    !S.player?.stats
  ) {
    return;
  }

  const stats = [
    "pac",
    "sho",
    "pas",
    "dri",
    "def",
    "phy"
  ];

  const available =
    stats.filter(stat =>
      Number(
        S.player.stats[stat] || 0
      ) < 99
    );

  if (
    available.length === 0
  ) {
    return;
  }

  const selected =
    randomItem(
      available
    );

  S.player.stats[selected] =
    clamp(
      Number(
        S.player.stats[selected] || 0
      ) + 1,
      0,
      99
    );

  refreshPlayerOvr();
}


/* =========================================================
   CAREER START
   ========================================================= */

function initializePlayerCareer(
  options = {}
) {

  if (!S.player) {
    return false;
  }

  const now =
    new Date();

  S.career.started =
    true;

  S.career.startDate =
    now.toISOString();

  S.career.currentYear =
    now.getFullYear();

  S.career.currentMonth =
    now.getMonth() + 1;

  S.career.currentDay =
    now.getDate();

  S.career.careerStatus =
    "Active";

  S.career.totalSeasons =
    1;

  /*
    Optional starting club.
  */

  if (
    options.clubId
  ) {

    assignPlayerToClub(
      options.clubId,
      options.shirtNumber
    );
  }

  /*
    Nationality.
  */

  if (
    S.player.nationality
  ) {

    S.player.nationalTeam.country =
      S.player.nationality;
  }

  touchGameState();

  return true;
}


/* =========================================================
   CLUB ASSIGNMENT
   ========================================================= */

function assignPlayerToClub(
  clubId,
  shirtNumber = null
) {

  if (
    !clubId
  ) {
    return false;
  }

  const now =
    new Date();

  const contractUntil =
    new Date(now);

  contractUntil.setFullYear(
    contractUntil.getFullYear() + 3
  );

  const number =
    shirtNumber ||
    S.player.shirtNumber ||
    randomInt(
      1,
      99
    );

  /*
    Previous club.
  */

  if (
    S.player.currentClub?.clubId
  ) {

    S.career.previousClubId =
      S.player.currentClub.clubId;
  }


  /*
    Current club.
  */

  S.player.currentClub = {
    clubId: clubId,
    joined: now.toISOString(),
    contractUntil:
      contractUntil.toISOString(),
    shirtNumber: number,
    role: "Player"
  };

  S.player.shirtNumber =
    number;

  S.career.currentClubId =
    clubId;


  /*
    Add club history entry.
  */

  if (
    !Array.isArray(
      S.player.clubs
    )
  ) {
    S.player.clubs = [];
  }

  const alreadyExists =
    S.player.clubs.some(
      club =>
        club.clubId === clubId &&
        !club.left
    );

  if (!alreadyExists) {

    S.player.clubs.push(
      createClubHistoryEntry(
        clubId,
        {
          joined:
            now.toISOString(),
          contractUntil:
            contractUntil.toISOString(),
          shirtNumber: number,
          role: "Player"
        }
      )
    );
  }

  touchGameState();

  return true;
}


/* =========================================================
   LEAVE CURRENT CLUB
   ========================================================= */

function leaveCurrentClub(
  reason = "Transfer"
) {

  const currentClubId =
    S.player?.currentClub?.clubId;

  if (!currentClubId) {
    return false;
  }

  const now =
    new Date();

  /*
    Close current club history.
  */

  const history =
    S.player.clubs || [];

  const activeHistory =
    [...history]
      .reverse()
      .find(
        club =>
          club.clubId ===
            currentClubId &&
          !club.left
      );

  if (activeHistory) {

    activeHistory.left =
      now.toISOString();

    activeHistory.exitReason =
      reason;
  }


  S.career.previousClubId =
    currentClubId;

  S.player.currentClub = {
    clubId: "",
    joined: null,
    contractUntil: null,
    shirtNumber:
      S.player.shirtNumber || 0,
    role: "Free Agent"
  };

  S.career.currentClubId =
    "";

  touchGameState();

  return true;
}


/* =========================================================
   CAREER RECORDS
   ========================================================= */

function addCareerAppearance(
  result = "draw",
  minutes = 90
) {

  if (!S.player.career) {
    return false;
  }

  S.player.career.appearances += 1;

  S.player.career.minutesPlayed +=
    Math.max(
      0,
      Number(minutes || 0)
    );

  switch (
    String(result).toLowerCase()
  ) {

    case "win":
      S.player.career.wins += 1;
      break;

    case "loss":
      S.player.career.losses += 1;
      break;

    default:
      S.player.career.draws += 1;
      break;
  }

  S.career.matchesPlayedThisSeason +=
    1;

  touchGameState();

  return true;
}


function addCareerGoal(
  amount = 1
) {

  const goals =
    Math.max(
      0,
      Number(amount || 0)
    );

  S.player.career.goals +=
    goals;

  S.career.goalsThisSeason +=
    goals;

  touchGameState();

  return true;
}


function addCareerAssist(
  amount = 1
) {

  const assists =
    Math.max(
      0,
      Number(amount || 0)
    );

  S.player.career.assists +=
    assists;

  S.career.assistsThisSeason +=
    assists;

  touchGameState();

  return true;
}


function addCleanSheet(
  amount = 1
) {

  S.player.career.cleanSheets +=
    Math.max(
      0,
      Number(amount || 0)
    );

  touchGameState();

  return true;
}


/* =========================================================
   PLAYER RESET
   ========================================================= */

function resetPlayer() {

  S.player =
    createDefaultPlayer();

  S.career =
    {
      started: false,
      startDate: null,
      currentSeason: 2026,
      currentYear: 2026,
      currentMonth: 7,
      currentDay: 1,
      currentClubId: "",
      previousClubId: "",
      totalSeasons: 0,
      careerStatus: "Unstarted",
      transferStatus: "None",
      transferOffers: [],
      matchesPlayedThisSeason: 0,
      goalsThisSeason: 0,
      assistsThisSeason: 0,
      trophiesThisSeason: [],
      seasonHistory: []
    };

  touchGameState();

  return true;
}


/* =========================================================
   PLAYER SUMMARY
   ========================================================= */

function getPlayerSummary() {

  return {
    id:
      S.player.id,

    name:
      getPlayerName(),

    shirtName:
      getPlayerShirtName(),

    age:
      getPlayerAge(),

    nationality:
      getPlayerNationality(),

    position:
      getPlayerPosition(),

    shirtNumber:
      S.player.shirtNumber,

    ovr:
      getPlayerOvr(),

    potential:
      getPlayerPotential(),

    level:
      getPlayerLevel(),

    clubId:
      S.player.currentClub?.clubId || "",

    appearances:
      S.player.career?.appearances || 0,

    goals:
      S.player.career?.goals || 0,

    assists:
      S.player.career?.assists || 0,

    trophies:
      countPlayerTrophies(),

    money:
      S.player.economy?.money || 0,

    fans:
      S.player.social?.fans || 0,

    followers:
      S.player.social?.followers || 0,

    popularity:
      S.player.social?.popularity || 0
  };
}


/* =========================================================
   TROPHY COUNT
   ========================================================= */

function countPlayerTrophies() {

  const trophies =
    S.player?.trophies;

  if (!trophies) {
    return 0;
  }

  return (
    (trophies.club?.length || 0) +
    (trophies.national?.length || 0) +
    (trophies.individual?.length || 0)
  );
}


/* =========================================================
   PLAYER INITIALIZATION
   ========================================================= */

function initializePlayerSystem() {

  if (
    typeof S ===
    "undefined"
  ) {
    console.error(
      "[PLAYER] State system is not loaded."
    );

    return false;
  }

  if (
    !S.player
  ) {
    S.player =
      createDefaultPlayer();
  }

  /*
    Make sure all basic structures exist.
  */

  repairPlayerData();

  /*
    Calculate age.
  */

  updatePlayerAge();

  /*
    Calculate OVR.
  */

  refreshPlayerOvr();

  console.log(
    "[PLAYER] Player system initialized."
  );

  return true;
}


/* =========================================================
   REPAIR PLAYER DATA
   ========================================================= */

function repairPlayerData() {

  if (!S.player) {
    S.player =
      createDefaultPlayer();

    return;
  }


  /*
    Basic fields
  */

  Object.keys(
    PLAYER_DEFAULTS
  ).forEach(field => {

    if (
      S.player[field] ===
      undefined
    ) {

      S.player[field] =
        PLAYER_DEFAULTS[field];
    }
  });


  /*
    Stats
  */

  if (!S.player.stats) {

    S.player.stats = {
      pac: 0,
      sho: 0,
      pas: 0,
      dri: 0,
      def: 0,
      phy: 0
    };
  }

  normalizePlayerStats();


  /*
    Career
  */

  if (!S.player.career) {

    S.player.career = {
      appearances: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      minutesPlayed: 0
    };
  }


  /*
    Club
  */

  if (!S.player.currentClub) {

    S.player.currentClub = {
      clubId: "",
      joined: null,
      contractUntil: null,
      shirtNumber: 0,
      role: "Player"
    };
  }


  /*
    Club history
  */

  if (
    !Array.isArray(
      S.player.clubs
    )
  ) {

    S.player.clubs = [];
  }


  /*
    National team
  */

  if (!S.player.nationalTeam) {

    S.player.nationalTeam = {
      country: "",
      caps: 0,
      goals: 0,
      assists: 0,
      trophies: []
    };
  }


  /*
    Trophies
  */

  if (!S.player.trophies) {

    S.player.trophies = {
      club: [],
      national: [],
      individual: []
    };
  }


  /*
    Economy
  */

  if (!S.player.economy) {

    S.player.economy = {
      money: 0,
      salary: 0,
      marketValue: 0,
      releaseClause: 0,
      weeklyIncome: 0,
      careerEarnings: 0
    };
  }


  /*
    Social
  */

  if (!S.player.social) {

    S.player.social = {
      fans: 0,
      followers: 0,
      popularity: 0,
      reputation: 0,
      socialReach: 0
    };
  }


  /*
    Preferences
  */

  if (!S.player.preferences) {

    S.player.preferences = {
      preferredFoot: "Right",
      playStyle: "",
      celebration: ""
    };
  }
}


/* =========================================================
   CHARACTER CREATION FORM
   ========================================================= */

function collectCharacterCreationData() {

  const getValue =
    id => {

      const element =
        document.getElementById(id);

      return element
        ? element.value.trim()
        : "";
    };


  return {

    name:
      getValue("playerName"),

    birthDate:
      getValue("playerBirthDate"),

    shirtName:
      getValue("playerShirtName"),

    nationality:
      getValue("playerCountry"),

    position:
      getValue("playerPosition"),

    birthPlace:
      getValue("playerBirthPlace"),

    shirtNumber:
      Number(
        getValue("playerShirtNumber")
      ) || 0
  };
}


/* =========================================================
   COMPLETE CHARACTER CREATION
   ========================================================= */

function completeCharacterCreation(
  data = null
) {

  const characterData =
    data ||
    collectCharacterCreationData();


  /*
    Create player.
  */

  createPlayer(
    characterData
  );


  /*
    Validate.
  */

  const validation =
    validatePlayerData(
      S.player
    );

  if (!validation.valid) {

    showToast(
      "Character Incomplete",
      validation.errors[0] ||
        "Lengkapi data pemain.",
      "warning"
    );

    return {
      success: false,
      errors:
        validation.errors
    };
  }


  /*
    Career starts here.
  */

  initializePlayerCareer();


  /*
    Save immediately.
  */

  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame({
      silent: true
    });
  }


  /*
    Go dashboard.
  */

  if (
    typeof navigate ===
    "function"
  ) {

    navigate(
      ROUTES.DASHBOARD
    );
  }


  showToast(
    "Career Started",
    `Welcome, ${getPlayerDisplayName()}!`,
    "success"
  );


  return {
    success: true,
    player:
      getPlayerSummary()
  };
}


/* =========================================================
   PLAYER SYSTEM READY
   ========================================================= */

const PLAYER_SYSTEM_READY = true;

console.log(
  "RV SPORTS: FC CUP 26 Player System loaded."
);
