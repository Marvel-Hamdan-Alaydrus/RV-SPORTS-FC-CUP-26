/* =========================================================
   RV SPORTS: FC CUP 26
   WORLD / COUNTRIES SYSTEM
   File: js/world/countries.js
   ========================================================= */

const COUNTRY_CONFIG = {
  minRating: 1,
  maxRating: 99,
  maxCountries: 300,
  defaultContinent: "Unknown",
  defaultCode: "UNK",
  defaultFifaRanking: 999,
  defaultReputation: 0
};

/* =========================================================
   COUNTRY TIERS
   ========================================================= */

const COUNTRY_TIERS = {
  developing: {
    min: 1,
    max: 49,
    label: "Developing"
  },

  competitive: {
    min: 50,
    max: 69,
    label: "Competitive"
  },

  strong: {
    min: 70,
    max: 79,
    label: "Strong"
  },

  elite: {
    min: 80,
    max: 89,
    label: "Elite"
  },

  worldclass: {
    min: 90,
    max: 99,
    label: "World Class"
  }
};

/* =========================================================
   COUNTRY CREATOR
   ========================================================= */

function createCountry(data = {}) {
  const now = new Date().toISOString();

  const country = {
    id: data.id || createId("country"),

    name: data.name || "New Country",
    shortName: data.shortName || data.name || "New Country",
    code: String(data.code || COUNTRY_CONFIG.defaultCode).toUpperCase(),

    continent: data.continent || COUNTRY_CONFIG.defaultContinent,

    rating: clamp(
      Number(data.rating ?? 50),
      COUNTRY_CONFIG.minRating,
      COUNTRY_CONFIG.maxRating
    ),

    attack: clamp(
      Number(data.attack ?? data.rating ?? 50),
      1,
      99
    ),

    midfield: clamp(
      Number(data.midfield ?? data.rating ?? 50),
      1,
      99
    ),

    defense: clamp(
      Number(data.defense ?? data.rating ?? 50),
      1,
      99
    ),

    fifaRanking: Number(
      data.fifaRanking ?? COUNTRY_CONFIG.defaultFifaRanking
    ),

    reputation: clamp(
      Number(data.reputation ?? COUNTRY_CONFIG.defaultReputation),
      0,
      100
    ),

    population: Number(data.population || 0),

    capital: data.capital || "",

    flag: data.flag || "",

    colors: {
      primary: data.colors?.primary || "#1f2937",
      secondary: data.colors?.secondary || "#ffffff"
    },

    nationalTeam: {
      active: data.nationalTeam?.active !== false,

      manager: data.nationalTeam?.manager || "",

      captainId: data.nationalTeam?.captainId || "",

      squad: Array.isArray(data.nationalTeam?.squad)
        ? [...data.nationalTeam.squad]
        : [],

      capsRecord: Number(data.nationalTeam?.capsRecord || 0),

      goalsRecord: Number(data.nationalTeam?.goalsRecord || 0),

      trophies: Array.isArray(data.nationalTeam?.trophies)
        ? [...data.nationalTeam.trophies]
        : []
    },

    competitions: Array.isArray(data.competitions)
      ? [...data.competitions]
      : [],

    trophies: Array.isArray(data.trophies)
      ? [...data.trophies]
      : [],

    achievements: Array.isArray(data.achievements)
      ? [...data.achievements]
      : [],

    active: data.active !== false,

    createdAt: data.createdAt || now,
    updatedAt: now
  };

  country.rating = calculateCountryRating(country);

  return country;
}

/* =========================================================
   COUNTRY COLLECTION
   ========================================================= */

function getCountryCollection() {
  if (!S.world || !Array.isArray(S.world.countries)) {
    return [];
  }

  return S.world.countries;
}

function addCountry(countryData) {
  const countries = getCountryCollection();

  if (countries.length >= COUNTRY_CONFIG.maxCountries) {
    return {
      success: false,
      message: "Country collection limit reached.",
      country: null
    };
  }

  const country =
    countryData?.id
      ? createCountry(countryData)
      : createCountry(countryData || {});

  const existing = countries.find(
    item => item.id === country.id
  );

  if (existing) {
    return {
      success: false,
      message: "Country ID already exists.",
      country: existing
    };
  }

  countries.push(country);

  touchGameState();

  addCreatorLog(
    "ADD_COUNTRY",
    country.id,
    null,
    country.name
  );

  return {
    success: true,
    message: "Country added.",
    country
  };
}

function removeCountry(countryId) {
  const countries = getCountryCollection();

  const index = countries.findIndex(
    country => country.id === countryId
  );

  if (index === -1) {
    return {
      success: false,
      message: "Country not found."
    };
  }

  const removed = countries.splice(index, 1)[0];

  touchGameState();

  addCreatorLog(
    "REMOVE_COUNTRY",
    countryId,
    removed.name,
    null
  );

  return {
    success: true,
    message: "Country removed.",
    country: removed
  };
}

/* =========================================================
   COUNTRY GETTERS
   ========================================================= */

function getCountryById(countryId) {
  return getCountryCollection().find(
    country => country.id === countryId
  ) || null;
}

function getCountryByName(name) {
  if (!name) {
    return null;
  }

  const normalized = String(name)
    .trim()
    .toLowerCase();

  return getCountryCollection().find(
    country =>
      country.name.toLowerCase() === normalized ||
      country.shortName.toLowerCase() === normalized ||
      country.code.toLowerCase() === normalized
  ) || null;
}

function searchCountries(query) {
  if (!query) {
    return getCountryCollection();
  }

  const normalized = String(query)
    .trim()
    .toLowerCase();

  return getCountryCollection().filter(country => {
    return (
      country.name.toLowerCase().includes(normalized) ||
      country.shortName.toLowerCase().includes(normalized) ||
      country.code.toLowerCase().includes(normalized) ||
      country.continent.toLowerCase().includes(normalized)
    );
  });
}

function getCountriesByContinent(continent) {
  if (!continent) {
    return [];
  }

  return getCountryCollection().filter(
    country =>
      country.continent.toLowerCase() ===
      String(continent).toLowerCase()
  );
}

/* =========================================================
   COUNTRY RATING
   ========================================================= */

function calculateCountryRating(country) {
  if (!country) {
    return 0;
  }

  const attack = Number(country.attack || 0);
  const midfield = Number(country.midfield || 0);
  const defense = Number(country.defense || 0);

  return Math.round(
    (attack + midfield + defense) / 3
  );
}

function refreshCountryRating(countryId) {
  const country = getCountryById(countryId);

  if (!country) {
    return null;
  }

  const oldRating = country.rating;

  country.rating = clamp(
    calculateCountryRating(country),
    COUNTRY_CONFIG.minRating,
    COUNTRY_CONFIG.maxRating
  );

  country.updatedAt = new Date().toISOString();

  touchGameState();

  if (oldRating !== country.rating) {
    addCreatorLog(
      "REFRESH_COUNTRY_RATING",
      countryId,
      oldRating,
      country.rating
    );
  }

  return country.rating;
}

/* =========================================================
   COUNTRY TIER
   ========================================================= */

function getCountryTierByRating(rating) {
  const value = clamp(
    Number(rating || 0),
    1,
    99
  );

  if (
    value >= COUNTRY_TIERS.worldclass.min &&
    value <= COUNTRY_TIERS.worldclass.max
  ) {
    return "worldclass";
  }

  if (
    value >= COUNTRY_TIERS.elite.min &&
    value <= COUNTRY_TIERS.elite.max
  ) {
    return "elite";
  }

  if (
    value >= COUNTRY_TIERS.strong.min &&
    value <= COUNTRY_TIERS.strong.max
  ) {
    return "strong";
  }

  if (
    value >= COUNTRY_TIERS.competitive.min &&
    value <= COUNTRY_TIERS.competitive.max
  ) {
    return "competitive";
  }

  return "developing";
}

function getCountryTier(country) {
  if (!country) {
    return "developing";
  }

  return getCountryTierByRating(country.rating);
}

/* =========================================================
   COUNTRY STRENGTH
   ========================================================= */

function getCountryStrength(country) {
  if (!country) {
    return {
      rating: 0,
      attack: 0,
      midfield: 0,
      defense: 0,
      tier: "developing"
    };
  }

  return {
    rating: Number(country.rating || 0),
    attack: Number(country.attack || 0),
    midfield: Number(country.midfield || 0),
    defense: Number(country.defense || 0),
    tier: getCountryTier(country)
  };
}

/* =========================================================
   COUNTRY RANKING
   ========================================================= */

function sortCountriesByRating(descending = true) {
  return [...getCountryCollection()].sort((a, b) => {
    return descending
      ? b.rating - a.rating
      : a.rating - b.rating;
  });
}

function getTopCountries(limit = 10) {
  return sortCountriesByRating(true)
    .slice(0, Math.max(1, Number(limit)));
}

function getCountryRanking(limit = 0) {
  const countries = sortCountriesByRating(true);

  if (limit > 0) {
    return countries.slice(0, limit);
  }

  return countries;
}

/* =========================================================
   FIFA RANKING
   ========================================================= */

function setCountryFifaRanking(countryId, ranking) {
  const country = getCountryById(countryId);

  if (!country) {
    return false;
  }

  const oldRanking = country.fifaRanking;

  country.fifaRanking = Math.max(
    1,
    Math.floor(Number(ranking) || 999)
  );

  country.updatedAt = new Date().toISOString();

  touchGameState();

  addCreatorLog(
    "SET_COUNTRY_FIFA_RANKING",
    countryId,
    oldRanking,
    country.fifaRanking
  );

  return true;
}

function sortCountriesByFifaRanking() {
  return [...getCountryCollection()].sort(
    (a, b) => a.fifaRanking - b.fifaRanking
  );
}

/* =========================================================
   NATIONAL TEAM
   ========================================================= */

function getNationalTeam(countryId) {
  const country = getCountryById(countryId);

  if (!country) {
    return null;
  }

  return country.nationalTeam;
}

function setNationalTeamManager(countryId, manager) {
  const country = getCountryById(countryId);

  if (!country) {
    return false;
  }

  const oldManager = country.nationalTeam.manager;

  country.nationalTeam.manager = String(manager || "");
  country.updatedAt = new Date().toISOString();

  touchGameState();

  addCreatorLog(
    "SET_NATIONAL_TEAM_MANAGER",
    countryId,
    oldManager,
    country.nationalTeam.manager
  );

  return true;
}

function setNationalTeamCaptain(countryId, playerId) {
  const country = getCountryById(countryId);

  if (!country) {
    return false;
  }

  const oldCaptain = country.nationalTeam.captainId;

  country.nationalTeam.captainId =
    String(playerId || "");

  touchGameState();

  addCreatorLog(
    "SET_NATIONAL_TEAM_CAPTAIN",
    countryId,
    oldCaptain,
    country.nationalTeam.captainId
  );

  return true;
}

function addPlayerToNationalTeam(countryId, playerId) {
  const country = getCountryById(countryId);

  if (!country || !playerId) {
    return false;
  }

  if (
    country.nationalTeam.squad.includes(playerId)
  ) {
    return false;
  }

  country.nationalTeam.squad.push(playerId);

  touchGameState();

  return true;
}

function removePlayerFromNationalTeam(countryId, playerId) {
  const country = getCountryById(countryId);

  if (!country) {
    return false;
  }

  const index =
    country.nationalTeam.squad.indexOf(playerId);

  if (index === -1) {
    return false;
  }

  country.nationalTeam.squad.splice(index, 1);

  if (
    country.nationalTeam.captainId === playerId
  ) {
    country.nationalTeam.captainId = "";
  }

  touchGameState();

  return true;
}

function isPlayerInNationalTeam(countryId, playerId) {
  const country = getCountryById(countryId);

  if (!country) {
    return false;
  }

  return country.nationalTeam.squad.includes(
    playerId
  );
}

/* =========================================================
   NATIONAL TEAM RECORDS
   ========================================================= */

function addNationalTeamCaps(countryId, amount = 1) {
  const country = getCountryById(countryId);

  if (!country) {
    return false;
  }

  country.nationalTeam.capsRecord +=
    Math.max(0, Number(amount) || 0);

  touchGameState();

  return true;
}

function addNationalTeamGoals(countryId, amount = 1) {
  const country = getCountryById(countryId);

  if (!country) {
    return false;
  }

  country.nationalTeam.goalsRecord +=
    Math.max(0, Number(amount) || 0);

  touchGameState();

  return true;
}

/* =========================================================
   COUNTRY TROPHIES
   ========================================================= */

function addCountryTrophy(countryId, trophy) {
  const country = getCountryById(countryId);

  if (!country || !trophy) {
    return false;
  }

  country.trophies.push(trophy);

  country.nationalTeam.trophies.push(
    trophy.id || trophy.name || createId("nt")
  );

  touchGameState();

  return true;
}

function getCountryTrophies(countryId) {
  const country = getCountryById(countryId);

  if (!country) {
    return [];
  }

  return country.trophies;
}

function getCountryTrophyCount(countryId) {
  return getCountryTrophies(countryId).length;
}

/* =========================================================
   COUNTRY UPDATE
   ========================================================= */

function updateCountry(countryId, changes = {}) {
  const country = getCountryById(countryId);

  if (!country) {
    return {
      success: false,
      message: "Country not found.",
      country: null
    };
  }

  const oldData = deepClone(country);

  const allowedFields = [
    "name",
    "shortName",
    "code",
    "continent",
    "rating",
    "attack",
    "midfield",
    "defense",
    "fifaRanking",
    "reputation",
    "population",
    "capital",
    "flag",
    "colors",
    "active"
  ];

  allowedFields.forEach(field => {
    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        field
      )
    ) {
      country[field] = changes[field];
    }
  });

  country.rating = clamp(
    calculateCountryRating(country),
    COUNTRY_CONFIG.minRating,
    COUNTRY_CONFIG.maxRating
  );

  country.updatedAt = new Date().toISOString();

  touchGameState();

  addCreatorLog(
    "UPDATE_COUNTRY",
    countryId,
    oldData,
    country
  );

  return {
    success: true,
    message: "Country updated.",
    country
  };
}

/* =========================================================
   COUNTRY BUDGET / REPUTATION
   ========================================================= */

function getCountryReputation(countryId) {
  const country = getCountryById(countryId);

  return country
    ? Number(country.reputation || 0)
    : 0;
}

function setCountryReputation(countryId, reputation) {
  const country = getCountryById(countryId);

  if (!country) {
    return false;
  }

  const oldValue = country.reputation;

  country.reputation = clamp(
    Number(reputation) || 0,
    0,
    100
  );

  country.updatedAt = new Date().toISOString();

  touchGameState();

  addCreatorLog(
    "SET_COUNTRY_REPUTATION",
    countryId,
    oldValue,
    country.reputation
  );

  return true;
}

/* =========================================================
   CREATOR WORLD EDITOR
   ========================================================= */

function creatorAddCountry(data = {}) {
  if (!S.admin?.creatorMode) {
    return {
      success: false,
      message: "Creator Mode required."
    };
  }

  return addCountry(data);
}

function creatorEditCountry(countryId, changes = {}) {
  if (!S.admin?.creatorMode) {
    return {
      success: false,
      message: "Creator Mode required."
    };
  }

  return updateCountry(countryId, changes);
}

function creatorRemoveCountry(countryId) {
  if (!S.admin?.creatorMode) {
    return {
      success: false,
      message: "Creator Mode required."
    };
  }

  return removeCountry(countryId);
}

function creatorSetCountryRating(
  countryId,
  rating
) {
  if (!S.admin?.creatorMode) {
    return {
      success: false,
      message: "Creator Mode required."
    };
  }

  const country = getCountryById(countryId);

  if (!country) {
    return {
      success: false,
      message: "Country not found."
    };
  }

  const oldRating = country.rating;

  const value = clamp(
    Number(rating) || 1,
    1,
    99
  );

  country.rating = value;

  country.attack = value;
  country.midfield = value;
  country.defense = value;

  country.updatedAt =
    new Date().toISOString();

  touchGameState();

  addCreatorLog(
    "CREATOR_SET_COUNTRY_RATING",
    countryId,
    oldRating,
    value
  );

  return {
    success: true,
    message: "Country rating updated.",
    country
  };
}

/* =========================================================
   VALIDATION
   ========================================================= */

function validateCountry(country) {
  if (!country) {
    return {
      valid: false,
      errors: ["Country is missing."]
    };
  }

  const errors = [];

  if (!country.id) {
    errors.push("Country ID is missing.");
  }

  if (!country.name) {
    errors.push("Country name is missing.");
  }

  if (!country.code) {
    errors.push("Country code is missing.");
  }

  if (
    country.rating < 1 ||
    country.rating > 99
  ) {
    errors.push(
      "Country rating must be between 1 and 99."
    );
  }

  if (!Array.isArray(country.nationalTeam?.squad)) {
    errors.push(
      "National team squad must be an array."
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateCountryCollection() {
  const countries = getCountryCollection();

  return countries.map(country => ({
    id: country.id,
    name: country.name,
    ...validateCountry(country)
  }));
}

/* =========================================================
   REPAIR
   ========================================================= */

function repairCountryData() {
  const countries = getCountryCollection();

  countries.forEach(country => {
    if (!country.id) {
      country.id = createId("country");
    }

    if (!country.name) {
      country.name = "Unknown Country";
    }

    if (!country.shortName) {
      country.shortName = country.name;
    }

    if (!country.code) {
      country.code = COUNTRY_CONFIG.defaultCode;
    }

    country.code = String(
      country.code
    ).toUpperCase();

    country.rating = clamp(
      Number(country.rating || 50),
      1,
      99
    );

    country.attack = clamp(
      Number(country.attack || country.rating),
      1,
      99
    );

    country.midfield = clamp(
      Number(country.midfield || country.rating),
      1,
      99
    );

    country.defense = clamp(
      Number(country.defense || country.rating),
      1,
      99
    );

    if (
      !country.nationalTeam ||
      typeof country.nationalTeam !== "object"
    ) {
      country.nationalTeam = {};
    }

    if (
      !Array.isArray(
        country.nationalTeam.squad
      )
    ) {
      country.nationalTeam.squad = [];
    }

    if (
      !Array.isArray(
        country.nationalTeam.trophies
      )
    ) {
      country.nationalTeam.trophies = [];
    }

    if (
      !Array.isArray(country.trophies)
    ) {
      country.trophies = [];
    }

    if (
      !Array.isArray(country.achievements)
    ) {
      country.achievements = [];
    }

    if (!country.colors) {
      country.colors = {
        primary: "#1f2937",
        secondary: "#ffffff"
      };
    }

    country.updatedAt =
      new Date().toISOString();
  });

  touchGameState();

  return countries;
}

/* =========================================================
   DEFAULT COUNTRY DATABASE
   ========================================================= */

function createDefaultCountries() {
  return [
    createCountry({
      id: "country_england",
      name: "England",
      shortName: "England",
      code: "ENG",
      continent: "Europe",
      rating: 88,
      attack: 89,
      midfield: 88,
      defense: 87,
      fifaRanking: 4,
      reputation: 95,
      capital: "London"
    }),

    createCountry({
      id: "country_france",
      name: "France",
      shortName: "France",
      code: "FRA",
      continent: "Europe",
      rating: 91,
      attack: 93,
      midfield: 90,
      defense: 90,
      fifaRanking: 2,
      reputation: 98,
      capital: "Paris"
    }),

    createCountry({
      id: "country_spain",
      name: "Spain",
      shortName: "Spain",
      code: "ESP",
      continent: "Europe",
      rating: 89,
      attack: 88,
      midfield: 92,
      defense: 87,
      fifaRanking: 1,
      reputation: 96,
      capital: "Madrid"
    }),

    createCountry({
      id: "country_germany",
      name: "Germany",
      shortName: "Germany",
      code: "GER",
      continent: "Europe",
      rating: 87,
      attack: 86,
      midfield: 88,
      defense: 87,
      fifaRanking: 8,
      reputation: 94,
      capital: "Berlin"
    }),

    createCountry({
      id: "country_italy",
      name: "Italy",
      shortName: "Italy",
      code: "ITA",
      continent: "Europe",
      rating: 86,
      attack: 84,
      midfield: 87,
      defense: 88,
      fifaRanking: 9,
      reputation: 94,
      capital: "Rome"
    }),

    createCountry({
      id: "country_brazil",
      name: "Brazil",
      shortName: "Brazil",
      code: "BRA",
      continent: "South America",
      rating: 92,
      attack: 95,
      midfield: 91,
      defense: 90,
      fifaRanking: 3,
      reputation: 100,
      capital: "Brasilia"
    }),

    createCountry({
      id: "country_argentina",
      name: "Argentina",
      shortName: "Argentina",
      code: "ARG",
      continent: "South America",
      rating: 92,
      attack: 94,
      midfield: 92,
      defense: 90,
      fifaRanking: 5,
      reputation: 99,
      capital: "Buenos Aires"
    }),

    createCountry({
      id: "country_portugal",
      name: "Portugal",
      shortName: "Portugal",
      code: "POR",
      continent: "Europe",
      rating: 88,
      attack: 91,
      midfield: 87,
      defense: 85,
      fifaRanking: 6,
      reputation: 95,
      capital: "Lisbon"
    }),

    createCountry({
      id: "country_netherlands",
      name: "Netherlands",
      shortName: "Netherlands",
      code: "NED",
      continent: "Europe",
      rating: 86,
      attack: 86,
      midfield: 87,
      defense: 85,
      fifaRanking: 7,
      reputation: 92,
      capital: "Amsterdam"
    }),

    createCountry({
      id: "country_indonesia",
      name: "Indonesia",
      shortName: "Indonesia",
      code: "IDN",
      continent: "Asia",
      rating: 62,
      attack: 64,
      midfield: 61,
      defense: 61,
      fifaRanking: 130,
      reputation: 70,
      capital: "Jakarta"
    })
  ];
}

/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeCountrySystem() {
  if (!S.world) {
    console.warn(
      "[COUNTRIES] World state missing."
    );

    return false;
  }

  if (!Array.isArray(S.world.countries)) {
    S.world.countries = [];
  }

  repairCountryData();

  /*
   * Only populate defaults when the world
   * has no countries yet.
   */
  if (S.world.countries.length === 0) {
    S.world.countries =
      createDefaultCountries();

    touchGameState();
  }

  return true;
}

const COUNTRY_SYSTEM_READY =
  initializeCountrySystem();

console.log(
  `[COUNTRIES] ${GAME_NAME} country system ready.`
);
