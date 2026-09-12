/* =========================================================
   RV SPORTS: FC CUP 26
   PLAYER TROPHY SYSTEM
   File: js/player/trophies.js
   ========================================================= */


/* =========================================================
   TROPHY CONFIG
   ========================================================= */

const TROPHY_CONFIG = {
  categories: {
    CLUB: "club",
    NATIONAL: "national",
    INDIVIDUAL: "individual"
  },

  maxTrophies: 200,

  defaultSeason: 2026
};


/* =========================================================
   TROPHY TYPES
   ========================================================= */

const TROPHY_TYPES = {
  CLUB: [
    "League",
    "Domestic Cup",
    "Super Cup",
    "Continental Cup",
    "Champions League",
    "Europa League",
    "Conference League",
    "Club World Cup"
  ],

  NATIONAL: [
    "World Cup",
    "Continental Championship",
    "Nations League",
    "International Cup"
  ],

  INDIVIDUAL: [
    "Ballon d'Or",
    "Golden Boot",
    "Player of the Year",
    "Young Player of the Year",
    "Best XI",
    "Golden Glove",
    "Top Assists",
    "MVP"
  ]
};


/* =========================================================
   CATEGORY NORMALIZATION
   ========================================================= */

function normalizeTrophyCategory(
  category
) {
  const value =
    String(category || "")
      .trim()
      .toLowerCase();

  if (
    value === "club" ||
    value === "clubs"
  ) {
    return TROPHY_CONFIG.categories.CLUB;
  }

  if (
    value === "national" ||
    value === "national team" ||
    value === "international"
  ) {
    return TROPHY_CONFIG.categories.NATIONAL;
  }

  if (
    value === "individual" ||
    value === "personal"
  ) {
    return TROPHY_CONFIG.categories.INDIVIDUAL;
  }

  return TROPHY_CONFIG.categories.CLUB;
}


/* =========================================================
   TROPHY CREATION
   ========================================================= */

function createPlayerTrophy(
  options = {}
) {
  const category =
    normalizeTrophyCategory(
      options.category
    );

  const trophy = {
    id:
      options.id ||
      createId("trophy"),

    name:
      options.name ||
      "Unknown Trophy",

    category,

    type:
      options.type ||
      "League",

    season:
      Number(options.season) ||
      Number(
        S.career?.currentSeason
      ) ||
      TROPHY_CONFIG.defaultSeason,

    clubId:
      options.clubId ||
      "",

    country:
      options.country ||
      "",

    competitionId:
      options.competitionId ||
      "",

    date:
      options.date ||
      new Date().toISOString(),

    description:
      options.description ||
      "",

    count:
      Math.max(
        1,
        Number(options.count) || 1
      ),

    icon:
      options.icon ||
      "",

    verified:
      options.verified !== false
  };

  return trophy;
}


/* =========================================================
   TROPHY COLLECTIONS
   ========================================================= */

function getTrophyCollection(
  category
) {
  if (!S.player) {
    return [];
  }

  const normalized =
    normalizeTrophyCategory(
      category
    );

  if (!S.player.trophies) {
    S.player.trophies = {
      club: [],
      national: [],
      individual: []
    };
  }

  if (
    !Array.isArray(
      S.player.trophies.club
    )
  ) {
    S.player.trophies.club = [];
  }

  if (
    !Array.isArray(
      S.player.trophies.national
    )
  ) {
    S.player.trophies.national = [];
  }

  if (
    !Array.isArray(
      S.player.trophies.individual
    )
  ) {
    S.player.trophies.individual = [];
  }

  if (
    normalized ===
    TROPHY_CONFIG.categories.NATIONAL
  ) {
    return S.player.trophies.national;
  }

  if (
    normalized ===
    TROPHY_CONFIG.categories.INDIVIDUAL
  ) {
    return S.player.trophies.individual;
  }

  return S.player.trophies.club;
}


/* =========================================================
   ADD TROPHY
   ========================================================= */

function addPlayerTrophy(
  options = {}
) {
  if (!S.player) {
    return null;
  }

  const trophy =
    options.id
      ? createPlayerTrophy(options)
      : createPlayerTrophy(options);

  const collection =
    getTrophyCollection(
      trophy.category
    );

  collection.push(
    trophy
  );

  trimTrophyCollection(
    collection
  );

  /*
    Also sync to current season.
  */
  if (
    typeof addSeasonTrophy ===
    "function"
  ) {
    addSeasonTrophy(
      deepClone(trophy)
    );
  }

  /*
    Record creator action when
    Creator Mode is active.
  */
  if (S.admin?.creatorMode) {
    addCreatorLog?.(
      "ADD_TROPHY",
      trophy.name,
      null,
      trophy
    );
  }

  return trophy;
}


/* =========================================================
   REMOVE TROPHY
   ========================================================= */

function removePlayerTrophy(
  trophyId,
  category
) {
  const collection =
    getTrophyCollection(
      category
    );

  const index =
    collection.findIndex(
      trophy =>
        trophy.id === trophyId
    );

  if (index < 0) {
    return false;
  }

  const removed =
    collection.splice(
      index,
      1
    )[0];

  if (S.admin?.creatorMode) {
    addCreatorLog?.(
      "REMOVE_TROPHY",
      removed.name,
      removed,
      null
    );
  }

  return removed;
}


/* =========================================================
   FIND TROPHY
   ========================================================= */

function getTrophyById(
  trophyId,
  category = ""
) {
  if (!trophyId) {
    return null;
  }

  if (category) {
    return getTrophyCollection(
      category
    ).find(
      trophy =>
        trophy.id === trophyId
    ) || null;
  }

  const categories = [
    TROPHY_CONFIG.categories.CLUB,
    TROPHY_CONFIG.categories.NATIONAL,
    TROPHY_CONFIG.categories.INDIVIDUAL
  ];

  for (const currentCategory of categories) {
    const trophy =
      getTrophyCollection(
        currentCategory
      ).find(
        item =>
          item.id === trophyId
      );

    if (trophy) {
      return trophy;
    }
  }

  return null;
}


/* =========================================================
   GET ALL TROPHIES
   ========================================================= */

function getAllPlayerTrophies() {
  return [
    ...getTrophyCollection("club"),
    ...getTrophyCollection("national"),
    ...getTrophyCollection("individual")
  ];
}


/* =========================================================
   CATEGORY GETTERS
   ========================================================= */

function getClubTrophies() {
  return getTrophyCollection(
    "club"
  );
}


function getNationalTrophies() {
  return getTrophyCollection(
    "national"
  );
}


function getIndividualTrophies() {
  return getTrophyCollection(
    "individual"
  );
}


/* =========================================================
   TROPHY COUNTS
   ========================================================= */

function countTrophies(
  category = ""
) {
  const collection =
    category
      ? getTrophyCollection(category)
      : getAllPlayerTrophies();

  return collection.reduce(
    (total, trophy) => {
      return total +
        Math.max(
          1,
          Number(trophy.count) || 1
        );
    },
    0
  );
}


function countClubTrophies() {
  return countTrophies("club");
}


function countNationalTrophies() {
  return countTrophies("national");
}


function countIndividualTrophies() {
  return countTrophies("individual");
}


function countAllTrophies() {
  return (
    countClubTrophies() +
    countNationalTrophies() +
    countIndividualTrophies()
  );
}


/* =========================================================
   TROPHY SEARCH
   ========================================================= */

function findTrophiesBySeason(
  season
) {
  const targetSeason =
    Number(season);

  return getAllPlayerTrophies()
    .filter(
      trophy =>
        Number(trophy.season) ===
        targetSeason
    );
}


function findTrophiesByName(
  name
) {
  const query =
    String(name || "")
      .trim()
      .toLowerCase();

  if (!query) {
    return [];
  }

  return getAllPlayerTrophies()
    .filter(
      trophy =>
        String(
          trophy.name || ""
        )
          .toLowerCase()
          .includes(query)
    );
}


function findTrophiesByClub(
  clubId
) {
  if (!clubId) {
    return [];
  }

  return getClubTrophies()
    .filter(
      trophy =>
        trophy.clubId === clubId
    );
}


function findTrophiesByCountry(
  country
) {
  const query =
    String(country || "")
      .trim()
      .toLowerCase();

  if (!query) {
    return [];
  }

  return getNationalTrophies()
    .filter(
      trophy =>
        String(
          trophy.country || ""
        )
          .toLowerCase() === query
    );
}


/* =========================================================
   TROPHY GROUPING
   ========================================================= */

function groupTrophiesBySeason(
  trophies = getAllPlayerTrophies()
) {
  const groups = {};

  trophies.forEach(
    trophy => {
      const season =
        Number(trophy.season) ||
        TROPHY_CONFIG.defaultSeason;

      if (!groups[season]) {
        groups[season] = [];
      }

      groups[season].push(
        trophy
      );
    }
  );

  return groups;
}


function groupTrophiesByName(
  trophies = getAllPlayerTrophies()
) {
  const groups = {};

  trophies.forEach(
    trophy => {
      const name =
        trophy.name ||
        "Unknown Trophy";

      if (!groups[name]) {
        groups[name] = [];
      }

      groups[name].push(
        trophy
      );
    }
  );

  return groups;
}


/* =========================================================
   TROPHY STATISTICS
   ========================================================= */

function getTrophyStats() {
  const all =
    getAllPlayerTrophies();

  const seasons =
    [
      ...new Set(
        all.map(
          trophy =>
            Number(trophy.season)
        )
      )
    ]
    .filter(
      Number.isFinite
    )
    .sort(
      (a, b) => a - b
    );

  const latestSeason =
    seasons.length
      ? seasons[
          seasons.length - 1
        ]
      : null;

  return {
    total:
      countAllTrophies(),

    club:
      countClubTrophies(),

    national:
      countNationalTrophies(),

    individual:
      countIndividualTrophies(),

    seasonsWon:
      seasons.length,

    firstTrophy:
      all.length
        ? all[0]
        : null,

    latestTrophy:
      all.length
        ? all[all.length - 1]
        : null,

    latestSeason
  };
}


/* =========================================================
   TROPHY ROOM DATA
   ========================================================= */

function getTrophyRoomData() {
  return {
    club: getClubTrophies(),
    national: getNationalTrophies(),
    individual: getIndividualTrophies(),

    counts: {
      club:
        countClubTrophies(),

      national:
        countNationalTrophies(),

      individual:
        countIndividualTrophies(),

      total:
        countAllTrophies()
    }
  };
}


/* =========================================================
   TROPHY DISPLAY
   ========================================================= */

function getTrophyDisplayData(
  trophy
) {
  if (!trophy) {
    return null;
  }

  return {
    id:
      trophy.id,

    name:
      trophy.name,

    category:
      normalizeTrophyCategory(
        trophy.category
      ),

    type:
      trophy.type || "",

    season:
      trophy.season || "",

    clubId:
      trophy.clubId || "",

    country:
      trophy.country || "",

    date:
      trophy.date || "",

    description:
      trophy.description || "",

    icon:
      trophy.icon || "",

    verified:
      trophy.verified !== false
  };
}


/* =========================================================
   DUPLICATE TROPHY DETECTION
   ========================================================= */

function findDuplicateTrophy(
  trophy
) {
  if (!trophy) {
    return null;
  }

  const collection =
    getTrophyCollection(
      trophy.category
    );

  return collection.find(
    existing => {
      return (
        existing.name ===
          trophy.name &&

        Number(
          existing.season
        ) ===
          Number(
            trophy.season
          ) &&

        (
          existing.clubId ||
          ""
        ) === (
          trophy.clubId ||
          ""
        ) &&

        (
          existing.country ||
          ""
        ) === (
          trophy.country ||
          ""
        )
      );
    }
  ) || null;
}


/* =========================================================
   MERGE DUPLICATE TROPHIES
   ========================================================= */

function mergeTrophyCount(
  trophyId,
  amount = 1
) {
  const trophy =
    getTrophyById(
      trophyId
    );

  if (!trophy) {
    return false;
  }

  trophy.count =
    Math.max(
      1,
      Number(trophy.count) || 1
    ) +
    Math.max(
      1,
      Number(amount) || 1
    );

  return trophy;
}


/* =========================================================
   TROPHY VALIDATION
   ========================================================= */

function validateTrophy(
  trophy
) {
  if (!trophy) {
    return false;
  }

  if (
    !trophy.id ||
    !trophy.name
  ) {
    return false;
  }

  const category =
    normalizeTrophyCategory(
      trophy.category
    );

  if (
    ![
      "club",
      "national",
      "individual"
    ].includes(category)
  ) {
    return false;
  }

  return true;
}


/* =========================================================
   TROPHY COLLECTION LIMIT
   ========================================================= */

function trimTrophyCollection(
  collection
) {
  if (
    !Array.isArray(collection)
  ) {
    return false;
  }

  if (
    collection.length >
    TROPHY_CONFIG.maxTrophies
  ) {
    collection.splice(
      0,
      collection.length -
        TROPHY_CONFIG.maxTrophies
    );
  }

  return true;
}


/* =========================================================
   CREATOR TROPHY EDITOR
   ========================================================= */

function creatorAddTrophy(
  options = {}
) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  return addPlayerTrophy(
    options
  );
}


function creatorRemoveTrophy(
  trophyId,
  category
) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  return removePlayerTrophy(
    trophyId,
    category
  );
}


function creatorEditTrophy(
  trophyId,
  changes = {}
) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  const trophy =
    getTrophyById(
      trophyId
    );

  if (!trophy) {
    return false;
  }

  const before =
    deepClone(trophy);

  Object.keys(changes)
    .forEach(
      key => {
        if (
          key === "id"
        ) {
          return;
        }

        trophy[key] =
          changes[key];
      }
    );

  trophy.category =
    normalizeTrophyCategory(
      trophy.category
    );

  trophy.season =
    Number(
      trophy.season
    ) || TROPHY_CONFIG.defaultSeason;

  trophy.count =
    Math.max(
      1,
      Number(
        trophy.count
      ) || 1
    );

  addCreatorLog?.(
    "CREATOR_EDIT_TROPHY",
    trophy.name,
    before,
    trophy
  );

  return trophy;
}


/* =========================================================
   TROPHY MILESTONES
   ========================================================= */

function getTrophyMilestones() {
  const total =
    countAllTrophies();

  return {
    firstTrophy:
      total >= 1,

    fiveTrophies:
      total >= 5,

    tenTrophies:
      total >= 10,

    twentyFiveTrophies:
      total >= 25,

    fiftyTrophies:
      total >= 50,

    hundredTrophies:
      total >= 100,

    legendary:
      countIndividualTrophies() >= 3
  };
}


/* =========================================================
   TROPHY SUMMARY
   ========================================================= */

function getTrophySummary() {
  const stats =
    getTrophyStats();

  return {
    total:
      stats.total,

    club:
      stats.club,

    national:
      stats.national,

    individual:
      stats.individual,

    latestSeason:
      stats.latestSeason,

    milestones:
      getTrophyMilestones()
  };
}


/* =========================================================
   CAREER INTEGRATION
   ========================================================= */

function syncTrophiesWithCareer() {
  if (
    !S.player ||
    !S.career
  ) {
    return false;
  }

  const all =
    getAllPlayerTrophies();

  /*
    Rebuild current season trophy
    references without destroying
    the actual trophy collections.
  */
  const currentSeason =
    Number(
      S.career.currentSeason
    ) ||
    TROPHY_CONFIG.defaultSeason;

  S.career.trophiesThisSeason =
    all
      .filter(
        trophy =>
          Number(
            trophy.season
          ) === currentSeason
      )
      .map(
        trophy =>
          deepClone(trophy)
      );

  return true;
}


/* =========================================================
   PLAYER PROFILE INTEGRATION
   ========================================================= */

function getProfileTrophyStats() {
  return {
    total:
      countAllTrophies(),

    club:
      countClubTrophies(),

    national:
      countNationalTrophies(),

    individual:
      countIndividualTrophies()
  };
}


/* =========================================================
   REPAIR TROPHY DATA
   ========================================================= */

function repairTrophyData() {
  if (!S.player) {
    return false;
  }

  if (!S.player.trophies) {
    S.player.trophies = {
      club: [],
      national: [],
      individual: []
    };
  }

  const categories = [
    "club",
    "national",
    "individual"
  ];

  categories.forEach(
    category => {
      if (
        !Array.isArray(
          S.player.trophies[
            category
          ]
        )
      ) {
        S.player.trophies[
          category
        ] = [];
      }

      S.player.trophies[
        category
      ].forEach(
        trophy => {
          if (!trophy.id) {
            trophy.id =
              createId(
                "trophy"
              );
          }

          if (!trophy.name) {
            trophy.name =
              "Unknown Trophy";
          }

          trophy.category =
            normalizeTrophyCategory(
              trophy.category ||
              category
            );

          trophy.season =
            Number(
              trophy.season
            ) ||
            TROPHY_CONFIG.defaultSeason;

          trophy.count =
            Math.max(
              1,
              Number(
                trophy.count
              ) || 1
            );

          if (
            trophy.verified ===
            undefined
          ) {
            trophy.verified =
              true;
          }
        }
      );

      trimTrophyCollection(
        S.player.trophies[
          category
        ]
      );
    }
  );

  syncTrophiesWithCareer();

  return true;
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeTrophySystem() {
  if (!S.player) {
    return false;
  }

  repairTrophyData();

  return true;
}


const TROPHY_SYSTEM_READY =
  initializeTrophySystem();
