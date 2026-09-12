/* =========================================================
   RV SPORTS: FC CUP 26
   CLUB WORLD SYSTEM
   File: js/world/clubs.js
   ========================================================= */


/* =========================================================
   CLUB CONFIG
   ========================================================= */

const CLUB_CONFIG = {
  minRating: 1,
  maxRating: 99,

  minBudget: 0,

  maxClubs: 1000,

  defaultCountry: "",

  defaultLeague: "",

  defaultStadiumCapacity: 10000
};


/* =========================================================
   CLUB TIERS
   ========================================================= */

const CLUB_TIERS = [
  {
    id: "local",
    name: "Local",
    minRating: 1,
    maxRating: 59
  },

  {
    id: "developing",
    name: "Developing",
    minRating: 60,
    maxRating: 69
  },

  {
    id: "competitive",
    name: "Competitive",
    minRating: 70,
    maxRating: 79
  },

  {
    id: "elite",
    name: "Elite",
    minRating: 80,
    maxRating: 89
  },

  {
    id: "worldclass",
    name: "World Class",
    minRating: 90,
    maxRating: 99
  }
];


/* =========================================================
   CLUB CREATION
   ========================================================= */

function createClub(options = {}) {
  const club = {
    id:
      options.id ||
      createId("club"),

    name:
      options.name ||
      "Unnamed Club",

    shortName:
      options.shortName ||
      options.name ||
      "Club",

    code:
      options.code ||
      "",

    country:
      options.country ||
      CLUB_CONFIG.defaultCountry,

    leagueId:
      options.leagueId ||
      CLUB_CONFIG.defaultLeague,

    division:
      Number(options.division) ||
      1,

    rating:
      clamp(
        Math.round(
          Number(options.rating) || 50
        ),
        CLUB_CONFIG.minRating,
        CLUB_CONFIG.maxRating
      ),

    attack:
      clamp(
        Math.round(
          Number(options.attack) || 50
        ),
        1,
        99
      ),

    midfield:
      clamp(
        Math.round(
          Number(options.midfield) || 50
        ),
        1,
        99
      ),

    defense:
      clamp(
        Math.round(
          Number(options.defense) || 50
        ),
        1,
        99
      ),

    stadium: {
      name:
        options.stadiumName ||
        "Home Stadium",

      capacity:
        Math.max(
          CLUB_CONFIG.defaultStadiumCapacity,
          Number(
            options.stadiumCapacity
          ) ||
          CLUB_CONFIG.defaultStadiumCapacity
        )
    },

    colors: {
      primary:
        options.primaryColor ||
        "",

      secondary:
        options.secondaryColor ||
        "",

      accent:
        options.accentColor ||
        ""
    },

    budget:
      Math.max(
        CLUB_CONFIG.minBudget,
        Number(options.budget) || 0
      ),

    wageBudget:
      Math.max(
        0,
        Number(options.wageBudget) || 0
      ),

    transferBudget:
      Math.max(
        0,
        Number(options.transferBudget) || 0
      ),

    reputation:
      clamp(
        Math.round(
          Number(options.reputation) || 50
        ),
        0,
        100
      ),

    founded:
      Number(options.founded) ||
      null,

    manager:
      options.manager ||
      "",

    captainId:
      options.captainId ||
      "",

    squad:
      Array.isArray(options.squad)
        ? options.squad
        : [],

    trophies:
      Array.isArray(options.trophies)
        ? options.trophies
        : [],

    achievements:
      Array.isArray(options.achievements)
        ? options.achievements
        : [],

    active:
      options.active !== false,

    createdAt:
      options.createdAt ||
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };

  return club;
}


/* =========================================================
   CLUB COLLECTION
   ========================================================= */

function getClubCollection() {
  if (!S.world) {
    return [];
  }

  if (!Array.isArray(S.world.clubs)) {
    S.world.clubs = [];
  }

  return S.world.clubs;
}


/* =========================================================
   ADD CLUB
   ========================================================= */

function addClub(options = {}) {
  const clubs =
    getClubCollection();

  const club =
    createClub(options);

  const existing =
    clubs.find(
      item =>
        item.id === club.id
    );

  if (existing) {
    return existing;
  }

  clubs.push(club);

  trimClubCollection();

  if (S.admin?.creatorMode) {
    addCreatorLog?.(
      "ADD_CLUB",
      club.name,
      null,
      club
    );
  }

  return club;
}


/* =========================================================
   REMOVE CLUB
   ========================================================= */

function removeClub(clubId) {
  const clubs =
    getClubCollection();

  const index =
    clubs.findIndex(
      club =>
        club.id === clubId
    );

  if (index < 0) {
    return false;
  }

  const removed =
    clubs.splice(index, 1)[0];

  if (S.admin?.creatorMode) {
    addCreatorLog?.(
      "REMOVE_CLUB",
      removed.name,
      removed,
      null
    );
  }

  return removed;
}


/* =========================================================
   GET CLUB
   ========================================================= */

function getClubById(clubId) {
  if (!clubId) {
    return null;
  }

  return getClubCollection()
    .find(
      club =>
        club.id === clubId
    ) || null;
}


function getClubByName(name) {
  const query =
    String(name || "")
      .trim()
      .toLowerCase();

  if (!query) {
    return null;
  }

  return getClubCollection()
    .find(
      club =>
        String(
          club.name || ""
        )
          .toLowerCase() === query
    ) || null;
}


/* =========================================================
   CLUB SEARCH
   ========================================================= */

function searchClubs(query) {
  const value =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!value) {
    return getClubCollection();
  }

  return getClubCollection()
    .filter(club => {
      return (
        String(
          club.name || ""
        )
          .toLowerCase()
          .includes(value) ||

        String(
          club.shortName || ""
        )
          .toLowerCase()
          .includes(value) ||

        String(
          club.code || ""
        )
          .toLowerCase()
          .includes(value) ||

        String(
          club.country || ""
        )
          .toLowerCase()
          .includes(value)
      );
    });
}


/* =========================================================
   COUNTRY FILTER
   ========================================================= */

function getClubsByCountry(
  country
) {
  const value =
    String(country || "")
      .trim()
      .toLowerCase();

  return getClubCollection()
    .filter(
      club =>
        String(
          club.country || ""
        )
          .toLowerCase() === value
    );
}


/* =========================================================
   LEAGUE FILTER
   ========================================================= */

function getClubsByLeague(
  leagueId
) {
  if (!leagueId) {
    return [];
  }

  return getClubCollection()
    .filter(
      club =>
        club.leagueId === leagueId
    );
}


/* =========================================================
   CLUB RATING
   ========================================================= */

function calculateClubRating(
  club
) {
  if (!club) {
    return 0;
  }

  const attack =
    Number(club.attack) || 0;

  const midfield =
    Number(club.midfield) || 0;

  const defense =
    Number(club.defense) || 0;

  return clamp(
    Math.round(
      (
        attack +
        midfield +
        defense
      ) / 3
    ),
    1,
    99
  );
}


function refreshClubRating(
  club
) {
  if (!club) {
    return 0;
  }

  club.rating =
    calculateClubRating(
      club
    );

  club.updatedAt =
    new Date().toISOString();

  return club.rating;
}


/* =========================================================
   CLUB TIER
   ========================================================= */

function getClubTierByRating(
  rating
) {
  const value =
    clamp(
      Math.round(
        Number(rating) || 0
      ),
      0,
      99
    );

  return (
    CLUB_TIERS.find(
      tier =>
        value >= tier.minRating &&
        value <= tier.maxRating
    ) ||
    CLUB_TIERS[0]
  );
}


function getClubTier(
  club
) {
  return getClubTierByRating(
    club?.rating
  );
}


/* =========================================================
   CLUB STRENGTH
   ========================================================= */

function getClubStrength(
  club
) {
  if (!club) {
    return null;
  }

  return {
    rating:
      Number(club.rating) || 0,

    attack:
      Number(club.attack) || 0,

    midfield:
      Number(club.midfield) || 0,

    defense:
      Number(club.defense) || 0,

    tier:
      getClubTier(
        club
      )
  };
}


/* =========================================================
   CLUB BUDGET
   ========================================================= */

function getClubBudget(
  club
) {
  if (!club) {
    return 0;
  }

  return Math.max(
    0,
    Number(club.budget) || 0
  );
}


function setClubBudget(
  clubId,
  amount
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  const before =
    club.budget;

  club.budget =
    Math.max(
      0,
      Number(amount) || 0
    );

  club.updatedAt =
    new Date().toISOString();

  if (S.admin?.creatorMode) {
    addCreatorLog?.(
      "SET_CLUB_BUDGET",
      club.name,
      before,
      club.budget
    );
  }

  return true;
}


function addClubBudget(
  clubId,
  amount
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  return setClubBudget(
    clubId,
    getClubBudget(club) +
      Number(amount)
  );
}


/* =========================================================
   TRANSFER BUDGET
   ========================================================= */

function getTransferBudget(
  club
) {
  if (!club) {
    return 0;
  }

  return Math.max(
    0,
    Number(
      club.transferBudget
    ) || 0
  );
}


function setTransferBudget(
  clubId,
  amount
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  club.transferBudget =
    Math.max(
      0,
      Number(amount) || 0
    );

  club.updatedAt =
    new Date().toISOString();

  return true;
}


/* =========================================================
   WAGE BUDGET
   ========================================================= */

function getWageBudget(
  club
) {
  if (!club) {
    return 0;
  }

  return Math.max(
    0,
    Number(
      club.wageBudget
    ) || 0
  );
}


function setWageBudget(
  clubId,
  amount
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  club.wageBudget =
    Math.max(
      0,
      Number(amount) || 0
    );

  club.updatedAt =
    new Date().toISOString();

  return true;
}


/* =========================================================
   CLUB SQUAD
   ========================================================= */

function getClubSquad(
  clubId
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return [];
  }

  if (!Array.isArray(club.squad)) {
    club.squad = [];
  }

  return club.squad;
}


function addPlayerToClubSquad(
  clubId,
  playerId
) {
  const club =
    getClubById(
      clubId
    );

  if (!club || !playerId) {
    return false;
  }

  if (!Array.isArray(club.squad)) {
    club.squad = [];
  }

  if (
    club.squad.includes(
      playerId
    )
  ) {
    return false;
  }

  club.squad.push(
    playerId
  );

  club.updatedAt =
    new Date().toISOString();

  return true;
}


function removePlayerFromClubSquad(
  clubId,
  playerId
) {
  const club =
    getClubById(
      clubId
    );

  if (!club || !Array.isArray(club.squad)) {
    return false;
  }

  const index =
    club.squad.indexOf(
      playerId
    );

  if (index < 0) {
    return false;
  }

  club.squad.splice(
    index,
    1
  );

  club.updatedAt =
    new Date().toISOString();

  return true;
}


function isPlayerInClub(
  clubId,
  playerId
) {
  return getClubSquad(
    clubId
  ).includes(
    playerId
  );
}


/* =========================================================
   CURRENT PLAYER CLUB
   ========================================================= */

function isPlayerAtClub(
  clubId
) {
  return (
    S.player?.currentClub?.clubId ===
    clubId
  );
}


/* =========================================================
   CLUB MANAGER
   ========================================================= */

function setClubManager(
  clubId,
  manager
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  const before =
    club.manager;

  club.manager =
    String(
      manager || ""
    );

  club.updatedAt =
    new Date().toISOString();

  if (S.admin?.creatorMode) {
    addCreatorLog?.(
      "SET_CLUB_MANAGER",
      club.name,
      before,
      club.manager
    );
  }

  return true;
}


/* =========================================================
   CLUB CAPTAIN
   ========================================================= */

function setClubCaptain(
  clubId,
  playerId
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  club.captainId =
    playerId || "";

  club.updatedAt =
    new Date().toISOString();

  return true;
}


/* =========================================================
   CLUB STADIUM
   ========================================================= */

function updateClubStadium(
  clubId,
  changes = {}
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  if (!club.stadium) {
    club.stadium = {
      name:
        "Home Stadium",

      capacity:
        CLUB_CONFIG.defaultStadiumCapacity
    };
  }

  if (
    changes.name !== undefined
  ) {
    club.stadium.name =
      String(
        changes.name
      );
  }

  if (
    changes.capacity !== undefined
  ) {
    club.stadium.capacity =
      Math.max(
        1000,
        Number(
          changes.capacity
        ) || 1000
      );
  }

  club.updatedAt =
    new Date().toISOString();

  return true;
}


/* =========================================================
   CLUB COLORS
   ========================================================= */

function updateClubColors(
  clubId,
  colors = {}
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  if (!club.colors) {
    club.colors = {
      primary: "",
      secondary: "",
      accent: ""
    };
  }

  if (
    colors.primary !== undefined
  ) {
    club.colors.primary =
      colors.primary;
  }

  if (
    colors.secondary !== undefined
  ) {
    club.colors.secondary =
      colors.secondary;
  }

  if (
    colors.accent !== undefined
  ) {
    club.colors.accent =
      colors.accent;
  }

  club.updatedAt =
    new Date().toISOString();

  return true;
}


/* =========================================================
   CLUB REPUTATION
   ========================================================= */

function setClubReputation(
  clubId,
  value
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  club.reputation =
    clamp(
      Math.round(
        Number(value) || 0
      ),
      0,
      100
    );

  club.updatedAt =
    new Date().toISOString();

  return true;
}


/* =========================================================
   CLUB TROPHIES
   ========================================================= */

function getClubTrophies(
  clubId
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return [];
  }

  if (!Array.isArray(club.trophies)) {
    club.trophies = [];
  }

  return club.trophies;
}


function addClubTrophy(
  clubId,
  trophy
) {
  const club =
    getClubById(
      clubId
    );

  if (!club || !trophy) {
    return false;
  }

  if (!Array.isArray(club.trophies)) {
    club.trophies = [];
  }

  club.trophies.push(
    trophy
  );

  club.updatedAt =
    new Date().toISOString();

  return trophy;
}


/* =========================================================
   CLUB ACHIEVEMENTS
   ========================================================= */

function addClubAchievement(
  clubId,
  achievement
) {
  const club =
    getClubById(
      clubId
    );

  if (!club || !achievement) {
    return false;
  }

  if (
    !Array.isArray(
      club.achievements
    )
  ) {
    club.achievements = [];
  }

  club.achievements.push(
    achievement
  );

  club.updatedAt =
    new Date().toISOString();

  return achievement;
}


/* =========================================================
   CLUB DISPLAY DATA
   ========================================================= */

function getClubDisplayData(
  club
) {
  if (!club) {
    return null;
  }

  return {
    id:
      club.id,

    name:
      club.name,

    shortName:
      club.shortName,

    code:
      club.code,

    country:
      club.country,

    leagueId:
      club.leagueId,

    division:
      club.division,

    rating:
      club.rating,

    tier:
      getClubTier(
        club
      ),

    attack:
      club.attack,

    midfield:
      club.midfield,

    defense:
      club.defense,

    stadium:
      club.stadium,

    reputation:
      club.reputation,

    budget:
      club.budget,

    transferBudget:
      club.transferBudget,

    wageBudget:
      club.wageBudget,

    manager:
      club.manager,

    captainId:
      club.captainId
  };
}


/* =========================================================
   CLUB SORTING
   ========================================================= */

function sortClubsByRating(
  clubs = getClubCollection(),
  descending = true
) {
  return [...clubs].sort(
    (a, b) => {
      const diff =
        (
          Number(b.rating) || 0
        ) -
        (
          Number(a.rating) || 0
        );

      return descending
        ? diff
        : -diff;
    }
  );
}


function sortClubsByName(
  clubs = getClubCollection()
) {
  return [...clubs].sort(
    (a, b) =>
      String(
        a.name || ""
      ).localeCompare(
        String(
          b.name || ""
        )
      )
  );
}


/* =========================================================
   TOP CLUBS
   ========================================================= */

function getTopClubs(
  limit = 10
) {
  return sortClubsByRating()
    .slice(
      0,
      Math.max(
        1,
        Number(limit) || 10
      )
    );
}


/* =========================================================
   RANDOM CLUB
   ========================================================= */

function getRandomClub(
  options = {}
) {
  let clubs =
    getClubCollection();

  if (options.country) {
    clubs =
      getClubsByCountry(
        options.country
      );
  }

  if (options.leagueId) {
    clubs =
      clubs.filter(
        club =>
          club.leagueId ===
          options.leagueId
      );
  }

  if (!clubs.length) {
    return null;
  }

  return randomItem(
    clubs
  );
}


/* =========================================================
   CLUB UPDATE
   ========================================================= */

function updateClub(
  clubId,
  changes = {}
) {
  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  const before =
    deepClone(
      club
    );

  const allowedFields = [
    "name",
    "shortName",
    "code",
    "country",
    "leagueId",
    "division",
    "rating",
    "attack",
    "midfield",
    "defense",
    "budget",
    "wageBudget",
    "transferBudget",
    "reputation",
    "founded",
    "manager",
    "captainId",
    "active"
  ];

  allowedFields.forEach(
    field => {
      if (
        changes[field] !== undefined
      ) {
        club[field] =
          changes[field];
      }
    }
  );

  club.rating =
    clamp(
      Math.round(
        Number(
          club.rating
        ) || 50
      ),
      1,
      99
    );

  club.attack =
    clamp(
      Math.round(
        Number(
          club.attack
        ) || 50
      ),
      1,
      99
    );

  club.midfield =
    clamp(
      Math.round(
        Number(
          club.midfield
        ) || 50
      ),
      1,
      99
    );

  club.defense =
    clamp(
      Math.round(
        Number(
          club.defense
        ) || 50
      ),
      1,
      99
    );

  club.budget =
    Math.max(
      0,
      Number(
        club.budget
      ) || 0
    );

  club.transferBudget =
    Math.max(
      0,
      Number(
        club.transferBudget
      ) || 0
    );

  club.wageBudget =
    Math.max(
      0,
      Number(
        club.wageBudget
      ) || 0
    );

  club.reputation =
    clamp(
      Math.round(
        Number(
          club.reputation
        ) || 0
      ),
      0,
      100
    );

  club.updatedAt =
    new Date().toISOString();

  if (S.admin?.creatorMode) {
    addCreatorLog?.(
      "UPDATE_CLUB",
      club.name,
      before,
      club
    );
  }

  return club;
}


/* =========================================================
   CLUB COLLECTION LIMIT
   ========================================================= */

function trimClubCollection() {
  const clubs =
    getClubCollection();

  if (
    clubs.length >
    CLUB_CONFIG.maxClubs
  ) {
    clubs.splice(
      0,
      clubs.length -
        CLUB_CONFIG.maxClubs
    );
  }

  return true;
}


/* =========================================================
   CREATOR WORLD EDITOR
   ========================================================= */

function creatorAddClub(
  options = {}
) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  return addClub(
    options
  );
}


function creatorEditClub(
  clubId,
  changes = {}
) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  return updateClub(
    clubId,
    changes
  );
}


function creatorRemoveClub(
  clubId
) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  return removeClub(
    clubId
  );
}


function creatorSetClubRating(
  clubId,
  rating
) {
  if (!S.admin?.creatorMode) {
    return false;
  }

  const club =
    getClubById(
      clubId
    );

  if (!club) {
    return false;
  }

  const before =
    club.rating;

  club.rating =
    clamp(
      Math.round(
        Number(rating) || 0
      ),
      1,
      99
    );

  club.updatedAt =
    new Date().toISOString();

  addCreatorLog?.(
    "CREATOR_SET_CLUB_RATING",
    club.name,
    before,
    club.rating
  );

  return true;
}


/* =========================================================
   CLUB VALIDATION
   ========================================================= */

function validateClub(
  club
) {
  if (!club) {
    return false;
  }

  if (
    !club.id ||
    !club.name
  ) {
    return false;
  }

  if (
    !Number.isFinite(
      Number(club.rating)
    )
  ) {
    return false;
  }

  return true;
}


/* =========================================================
   CLUB REPAIR
   ========================================================= */

function repairClubData() {
  const clubs =
    getClubCollection();

  clubs.forEach(
    club => {
      if (!club.id) {
        club.id =
          createId("club");
      }

      if (!club.name) {
        club.name =
          "Unnamed Club";
      }

      club.rating =
        clamp(
          Math.round(
            Number(
              club.rating
            ) || 50
          ),
          1,
          99
        );

      club.attack =
        clamp(
          Math.round(
            Number(
              club.attack
            ) || 50
          ),
          1,
          99
        );

      club.midfield =
        clamp(
          Math.round(
            Number(
              club.midfield
            ) || 50
          ),
          1,
          99
        );

      club.defense =
        clamp(
          Math.round(
            Number(
              club.defense
            ) || 50
          ),
          1,
          99
        );

      if (!club.stadium) {
        club.stadium = {
          name:
            "Home Stadium",

          capacity:
            CLUB_CONFIG.defaultStadiumCapacity
        };
      }

      if (!club.colors) {
        club.colors = {
          primary: "",
          secondary: "",
          accent: ""
        };
      }

      if (!Array.isArray(club.squad)) {
        club.squad = [];
      }

      if (!Array.isArray(club.trophies)) {
        club.trophies = [];
      }

      if (!Array.isArray(club.achievements)) {
        club.achievements = [];
      }

      club.budget =
        Math.max(
          0,
          Number(
            club.budget
          ) || 0
        );

      club.wageBudget =
        Math.max(
          0,
          Number(
            club.wageBudget
          ) || 0
        );

      club.transferBudget =
        Math.max(
          0,
          Number(
            club.transferBudget
          ) || 0
        );

      club.reputation =
        clamp(
          Math.round(
            Number(
              club.reputation
            ) || 50
          ),
          0,
          100
        );

      if (!club.createdAt) {
        club.createdAt =
          new Date().toISOString();
      }

      club.updatedAt =
        new Date().toISOString();
    }
  );

  trimClubCollection();

  return true;
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeClubSystem() {
  if (!S.world) {
    return false;
  }

  if (!Array.isArray(S.world.clubs)) {
    S.world.clubs = [];
  }

  repairClubData();

  return true;
}


const CLUB_SYSTEM_READY =
  initializeClubSystem();
