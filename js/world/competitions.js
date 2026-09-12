/* =========================================================
   RV SPORTS: FC CUP 26
   WORLD / COMPETITIONS SYSTEM
   File: js/world/competitions.js
   ========================================================= */

const COMPETITION_CONFIG = {
  maxCompetitions: 500,
  minRating: 1,
  maxRating: 99,
  defaultSeason: 2026,
  defaultCountry: "",
  defaultTier: 1
};

/* =========================================================
   COMPETITION TYPES
   ========================================================= */

const COMPETITION_TYPES = {
  LEAGUE: "league",
  DOMESTIC_CUP: "domestic_cup",
  DOMESTIC_SUPER_CUP: "domestic_super_cup",

  CONTINENTAL_LEAGUE: "continental_league",
  CONTINENTAL_CUP: "continental_cup",
  CONTINENTAL_SUPER_CUP: "continental_super_cup",

  INTERNATIONAL_LEAGUE: "international_league",
  INTERNATIONAL_CUP: "international_cup",

  FRIENDLY: "friendly"
};

/* =========================================================
   COMPETITION TIERS
   ========================================================= */

const COMPETITION_TIERS = {
  local: {
    min: 1,
    max: 39,
    label: "Local"
  },

  regional: {
    min: 40,
    max: 59,
    label: "Regional"
  },

  national: {
    min: 60,
    max: 74,
    label: "National"
  },

  continental: {
    min: 75,
    max: 89,
    label: "Continental"
  },

  world: {
    min: 90,
    max: 99,
    label: "World"
  }
};

/* =========================================================
   COMPETITION STATUS
   ========================================================= */

const COMPETITION_STATUS = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  FINISHED: "finished",
  INACTIVE: "inactive"
};

/* =========================================================
   COMPETITION CREATOR
   ========================================================= */

function createCompetition(data = {}) {
  const now = new Date().toISOString();

  const competition = {
    id: data.id || createId("competition"),

    name: data.name || "New Competition",

    shortName:
      data.shortName ||
      data.name ||
      "New Competition",

    code: String(
      data.code || "NEW"
    ).toUpperCase(),

    type:
      data.type ||
      COMPETITION_TYPES.LEAGUE,

    tier: Number(
      data.tier ??
      COMPETITION_CONFIG.defaultTier
    ),

    country:
      data.country ||
      COMPETITION_CONFIG.defaultCountry,

    continent:
      data.continent ||
      "",

    rating: clamp(
      Number(data.rating ?? 50),
      COMPETITION_CONFIG.minRating,
      COMPETITION_CONFIG.maxRating
    ),

    reputation: clamp(
      Number(data.reputation ?? 50),
      0,
      100
    ),

    season:
      Number(
        data.season ??
        COMPETITION_CONFIG.defaultSeason
      ),

    format: {
      pointsForWin:
        Number(
          data.format?.pointsForWin ?? 3
        ),

      pointsForDraw:
        Number(
          data.format?.pointsForDraw ?? 1
        ),

      pointsForLoss:
        Number(
          data.format?.pointsForLoss ?? 0
        ),

      homeAway:
        data.format?.homeAway !== false,

      roundRobin:
        data.format?.roundRobin !== false,

      knockout:
        data.format?.knockout === true,

      groupStage:
        data.format?.groupStage === true,

      legs:
        Number(data.format?.legs ?? 1)
    },

    participants:
      Array.isArray(data.participants)
        ? [...data.participants]
        : [],

    qualifiedTeams:
      Array.isArray(data.qualifiedTeams)
        ? [...data.qualifiedTeams]
        : [],

    fixtures:
      Array.isArray(data.fixtures)
        ? [...data.fixtures]
        : [],

    results:
      Array.isArray(data.results)
        ? [...data.results]
        : [],

    standings:
      Array.isArray(data.standings)
        ? [...data.standings]
        : [],

    rounds:
      Array.isArray(data.rounds)
        ? [...data.rounds]
        : [],

    currentRound:
      Number(data.currentRound ?? 0),

    totalRounds:
      Number(data.totalRounds ?? 0),

    startDate:
      data.startDate || null,

    endDate:
      data.endDate || null,

    winnerId:
      data.winnerId || "",

    runnerUpId:
      data.runnerUpId || "",

    trophyId:
      data.trophyId || "",

    prizeMoney:
      Number(data.prizeMoney || 0),

    active:
      data.active !== false,

    status:
      data.status ||
      COMPETITION_STATUS.UPCOMING,

    createdAt:
      data.createdAt || now,

    updatedAt: now
  };

  return competition;
}

/* =========================================================
   COLLECTION
   ========================================================= */

function getCompetitionCollection() {
  if (
    !S.world ||
    !Array.isArray(S.world.competitions)
  ) {
    return [];
  }

  return S.world.competitions;
}

function addCompetition(
  competitionData
) {
  const competitions =
    getCompetitionCollection();

  if (
    competitions.length >=
    COMPETITION_CONFIG.maxCompetitions
  ) {
    return {
      success: false,
      message:
        "Competition collection limit reached.",
      competition: null
    };
  }

  const competition =
    createCompetition(
      competitionData || {}
    );

  if (
    competitions.some(
      item => item.id === competition.id
    )
  ) {
    return {
      success: false,
      message:
        "Competition ID already exists.",
      competition: null
    };
  }

  competitions.push(competition);

  touchGameState();

  addCreatorLog(
    "ADD_COMPETITION",
    competition.id,
    null,
    competition.name
  );

  return {
    success: true,
    message: "Competition added.",
    competition
  };
}

function removeCompetition(
  competitionId
) {
  const competitions =
    getCompetitionCollection();

  const index =
    competitions.findIndex(
      item => item.id === competitionId
    );

  if (index === -1) {
    return {
      success: false,
      message: "Competition not found."
    };
  }

  const removed =
    competitions.splice(index, 1)[0];

  touchGameState();

  addCreatorLog(
    "REMOVE_COMPETITION",
    competitionId,
    removed.name,
    null
  );

  return {
    success: true,
    message: "Competition removed.",
    competition: removed
  };
}

/* =========================================================
   GETTERS
   ========================================================= */

function getCompetitionById(
  competitionId
) {
  return getCompetitionCollection()
    .find(
      competition =>
        competition.id === competitionId
    ) || null;
}

function getCompetitionByName(
  name
) {
  if (!name) {
    return null;
  }

  const query =
    String(name)
      .trim()
      .toLowerCase();

  return getCompetitionCollection()
    .find(competition => {
      return (
        competition.name
          .toLowerCase() === query ||

        competition.shortName
          .toLowerCase() === query ||

        competition.code
          .toLowerCase() === query
      );
    }) || null;
}

function searchCompetitions(
  query
) {
  if (!query) {
    return getCompetitionCollection();
  }

  const normalized =
    String(query)
      .trim()
      .toLowerCase();

  return getCompetitionCollection()
    .filter(competition => {
      return (
        competition.name
          .toLowerCase()
          .includes(normalized) ||

        competition.shortName
          .toLowerCase()
          .includes(normalized) ||

        competition.code
          .toLowerCase()
          .includes(normalized) ||

        competition.type
          .toLowerCase()
          .includes(normalized) ||

        competition.country
          .toLowerCase()
          .includes(normalized) ||

        competition.continent
          .toLowerCase()
          .includes(normalized)
      );
    });
}

function getCompetitionsByType(
  type
) {
  return getCompetitionCollection()
    .filter(
      competition =>
        competition.type === type
    );
}

function getCompetitionsByCountry(
  country
) {
  if (!country) {
    return [];
  }

  return getCompetitionCollection()
    .filter(
      competition =>
        competition.country
          .toLowerCase() ===
        String(country).toLowerCase()
    );
}

function getCompetitionsByContinent(
  continent
) {
  if (!continent) {
    return [];
  }

  return getCompetitionCollection()
    .filter(
      competition =>
        competition.continent
          .toLowerCase() ===
        String(continent).toLowerCase()
    );
}

function getCompetitionsBySeason(
  season
) {
  return getCompetitionCollection()
    .filter(
      competition =>
        Number(competition.season) ===
        Number(season)
    );
}

/* =========================================================
   TYPE HELPERS
   ========================================================= */

function isLeagueCompetition(
  competition
) {
  return (
    competition?.type ===
    COMPETITION_TYPES.LEAGUE
  );
}

function isCupCompetition(
  competition
) {
  if (!competition) {
    return false;
  }

  return [
    COMPETITION_TYPES.DOMESTIC_CUP,
    COMPETITION_TYPES.DOMESTIC_SUPER_CUP,
    COMPETITION_TYPES.CONTINENTAL_CUP,
    COMPETITION_TYPES.CONTINENTAL_SUPER_CUP,
    COMPETITION_TYPES.INTERNATIONAL_CUP
  ].includes(competition.type);
}

function isInternationalCompetition(
  competition
) {
  if (!competition) {
    return false;
  }

  return [
    COMPETITION_TYPES.INTERNATIONAL_LEAGUE,
    COMPETITION_TYPES.INTERNATIONAL_CUP
  ].includes(competition.type);
}

function isContinentalCompetition(
  competition
) {
  if (!competition) {
    return false;
  }

  return [
    COMPETITION_TYPES.CONTINENTAL_LEAGUE,
    COMPETITION_TYPES.CONTINENTAL_CUP,
    COMPETITION_TYPES.CONTINENTAL_SUPER_CUP
  ].includes(competition.type);
}

/* =========================================================
   COMPETITION TIER
   ========================================================= */

function getCompetitionTierByRating(
  rating
) {
  const value = clamp(
    Number(rating || 0),
    1,
    99
  );

  if (
    value >=
    COMPETITION_TIERS.world.min
  ) {
    return "world";
  }

  if (
    value >=
    COMPETITION_TIERS.continental.min
  ) {
    return "continental";
  }

  if (
    value >=
    COMPETITION_TIERS.national.min
  ) {
    return "national";
  }

  if (
    value >=
    COMPETITION_TIERS.regional.min
  ) {
    return "regional";
  }

  return "local";
}

function getCompetitionTier(
  competition
) {
  if (!competition) {
    return "local";
  }

  return getCompetitionTierByRating(
    competition.rating
  );
}

/* =========================================================
   COMPETITION RATING
   ========================================================= */

function calculateCompetitionRating(
  competition
) {
  if (!competition) {
    return 0;
  }

  const participantIds =
    Array.isArray(
      competition.participants
    )
      ? competition.participants
      : [];

  if (
    participantIds.length === 0
  ) {
    return Number(
      competition.rating || 0
    );
  }

  const clubRatings =
    participantIds
      .map(id => {
        const club =
          getClubById(id);

        return club
          ? Number(club.rating || 0)
          : 0;
      })
      .filter(
        rating => rating > 0
      );

  if (
    clubRatings.length === 0
  ) {
    return Number(
      competition.rating || 0
    );
  }

  return Math.round(
    average(clubRatings)
  );
}

function refreshCompetitionRating(
  competitionId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return null;
  }

  const oldRating =
    competition.rating;

  competition.rating =
    clamp(
      calculateCompetitionRating(
        competition
      ),
      1,
      99
    );

  competition.updatedAt =
    new Date().toISOString();

  touchGameState();

  if (
    oldRating !==
    competition.rating
  ) {
    addCreatorLog(
      "REFRESH_COMPETITION_RATING",
      competitionId,
      oldRating,
      competition.rating
    );
  }

  return competition.rating;
}

/* =========================================================
   PARTICIPANTS
   ========================================================= */

function getCompetitionParticipants(
  competitionId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return [];
  }

  return competition.participants;
}

function addCompetitionParticipant(
  competitionId,
  clubId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition || !clubId) {
    return false;
  }

  if (
    competition.participants
      .includes(clubId)
  ) {
    return false;
  }

  competition.participants
    .push(clubId);

  competition.updatedAt =
    new Date().toISOString();

  touchGameState();

  return true;
}

function removeCompetitionParticipant(
  competitionId,
  clubId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  const index =
    competition.participants
      .indexOf(clubId);

  if (index === -1) {
    return false;
  }

  competition.participants
    .splice(index, 1);

  competition.qualifiedTeams =
    competition.qualifiedTeams
      .filter(
        id => id !== clubId
      );

  touchGameState();

  return true;
}

function isClubInCompetition(
  competitionId,
  clubId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  return competition.participants
    .includes(clubId);
}

/* =========================================================
   QUALIFICATION
   ========================================================= */

function addQualifiedTeam(
  competitionId,
  clubId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition || !clubId) {
    return false;
  }

  if (
    !competition.qualifiedTeams
      .includes(clubId)
  ) {
    competition.qualifiedTeams
      .push(clubId);

    touchGameState();
  }

  return true;
}

function clearQualifiedTeams(
  competitionId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  competition.qualifiedTeams = [];

  touchGameState();

  return true;
}

/* =========================================================
   STANDINGS
   ========================================================= */

function createStandingEntry(
  clubId
) {
  return {
    clubId,

    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,

    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,

    points: 0,

    rank: 0
  };
}

function initializeCompetitionStandings(
  competitionId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  competition.standings =
    competition.participants
      .map(clubId =>
        createStandingEntry(clubId)
      );

  updateCompetitionStandingsRanks(
    competition
  );

  touchGameState();

  return true;
}

function getCompetitionStandings(
  competitionId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return [];
  }

  return competition.standings;
}

function updateCompetitionStanding(
  competitionId,
  clubId,
  changes = {}
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  let standing =
    competition.standings
      .find(
        item =>
          item.clubId === clubId
      );

  if (!standing) {
    standing =
      createStandingEntry(
        clubId
      );

    competition.standings
      .push(standing);
  }

  const numericFields = [
    "played",
    "wins",
    "draws",
    "losses",
    "goalsFor",
    "goalsAgainst",
    "points"
  ];

  numericFields.forEach(
    field => {
      if (
        Object.prototype
          .hasOwnProperty.call(
            changes,
            field
          )
      ) {
        standing[field] =
          Number(changes[field]) || 0;
      }
    }
  );

  standing.goalDifference =
    standing.goalsFor -
    standing.goalsAgainst;

  updateCompetitionStandingsRanks(
    competition
  );

  touchGameState();

  return true;
}

function updateCompetitionStandingsRanks(
  competition
) {
  if (!competition) {
    return;
  }

  competition.standings.sort(
    (a, b) => {
      if (
        b.points !== a.points
      ) {
        return b.points - a.points;
      }

      if (
        b.goalDifference !==
        a.goalDifference
      ) {
        return (
          b.goalDifference -
          a.goalDifference
        );
      }

      if (
        b.goalsFor !==
        a.goalsFor
      ) {
        return (
          b.goalsFor -
          a.goalsFor
        );
      }

      return a.clubId
        .localeCompare(
          b.clubId
        );
    }
  );

  competition.standings
    .forEach(
      (standing, index) => {
        standing.rank =
          index + 1;
      }
    );
}

/* =========================================================
   FIXTURES
   ========================================================= */

function addCompetitionFixture(
  competitionId,
  fixture
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition || !fixture) {
    return false;
  }

  const newFixture = {
    id:
      fixture.id ||
      createId("fixture"),

    competitionId,

    homeClubId:
      fixture.homeClubId || "",

    awayClubId:
      fixture.awayClubId || "",

    date:
      fixture.date || null,

    round:
      Number(fixture.round || 1),

    status:
      fixture.status || "scheduled",

    homeScore:
      fixture.homeScore ?? null,

    awayScore:
      fixture.awayScore ?? null
  };

  competition.fixtures
    .push(newFixture);

  touchGameState();

  return newFixture;
}

function getCompetitionFixtures(
  competitionId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return [];
  }

  return competition.fixtures;
}

function getCompetitionFixtureById(
  competitionId,
  fixtureId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return null;
  }

  return competition.fixtures
    .find(
      fixture =>
        fixture.id === fixtureId
    ) || null;
}

/* =========================================================
   RESULTS
   ========================================================= */

function addCompetitionResult(
  competitionId,
  result
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition || !result) {
    return false;
  }

  const finalResult = {
    id:
      result.id ||
      createId("result"),

    fixtureId:
      result.fixtureId || "",

    competitionId,

    homeClubId:
      result.homeClubId || "",

    awayClubId:
      result.awayClubId || "",

    homeScore:
      Number(result.homeScore || 0),

    awayScore:
      Number(result.awayScore || 0),

    date:
      result.date || null
  };

  competition.results
    .push(finalResult);

  touchGameState();

  return finalResult;
}

/* =========================================================
   ROUNDS
   ========================================================= */

function addCompetitionRound(
  competitionId,
  roundData = {}
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  const round = {
    id:
      roundData.id ||
      createId("round"),

    number:
      Number(
        roundData.number ??
        competition.rounds.length + 1
      ),

    name:
      roundData.name ||
      `Round ${
        competition.rounds.length + 1
      }`,

    type:
      roundData.type ||
      "league",

    status:
      roundData.status ||
      "upcoming",

    fixtureIds:
      Array.isArray(
        roundData.fixtureIds
      )
        ? [...roundData.fixtureIds]
        : []
  };

  competition.rounds
    .push(round);

  competition.totalRounds =
    competition.rounds.length;

  touchGameState();

  return round;
}

function setCompetitionCurrentRound(
  competitionId,
  roundNumber
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  competition.currentRound =
    Math.max(
      0,
      Number(roundNumber) || 0
    );

  touchGameState();

  return true;
}

/* =========================================================
   SEASON
   ========================================================= */

function setCompetitionSeason(
  competitionId,
  season
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  competition.season =
    Number(season) ||
    COMPETITION_CONFIG.defaultSeason;

  competition.updatedAt =
    new Date().toISOString();

  touchGameState();

  return true;
}

function startCompetitionSeason(
  competitionId,
  season = null
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  if (season !== null) {
    competition.season =
      Number(season);
  }

  competition.status =
    COMPETITION_STATUS.ACTIVE;

  competition.currentRound = 0;

  competition.winnerId = "";
  competition.runnerUpId = "";

  competition.results = [];
  competition.fixtures = [];
  competition.rounds = [];

  initializeCompetitionStandings(
    competitionId
  );

  competition.updatedAt =
    new Date().toISOString();

  touchGameState();

  return true;
}

function finishCompetitionSeason(
  competitionId,
  winnerId = "",
  runnerUpId = ""
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  competition.status =
    COMPETITION_STATUS.FINISHED;

  competition.winnerId =
    winnerId || "";

  competition.runnerUpId =
    runnerUpId || "";

  competition.updatedAt =
    new Date().toISOString();

  touchGameState();

  return true;
}

/* =========================================================
   TROPHY
   ========================================================= */

function setCompetitionTrophy(
  competitionId,
  trophyId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  competition.trophyId =
    String(trophyId || "");

  touchGameState();

  return true;
}

function getCompetitionWinner(
  competitionId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  return competition
    ? competition.winnerId
    : "";
}

/* =========================================================
   PRIZE MONEY
   ========================================================= */

function getCompetitionPrizeMoney(
  competitionId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  return competition
    ? Number(
        competition.prizeMoney || 0
      )
    : 0;
}

function setCompetitionPrizeMoney(
  competitionId,
  amount
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return false;
  }

  const oldValue =
    competition.prizeMoney;

  competition.prizeMoney =
    Math.max(
      0,
      Number(amount) || 0
    );

  touchGameState();

  addCreatorLog(
    "SET_COMPETITION_PRIZE",
    competitionId,
    oldValue,
    competition.prizeMoney
  );

  return true;
}

/* =========================================================
   UPDATE
   ========================================================= */

function updateCompetition(
  competitionId,
  changes = {}
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return {
      success: false,
      message:
        "Competition not found.",
      competition: null
    };
  }

  const oldData =
    deepClone(competition);

  const allowedFields = [
    "name",
    "shortName",
    "code",
    "type",
    "tier",
    "country",
    "continent",
    "rating",
    "reputation",
    "season",
    "startDate",
    "endDate",
    "prizeMoney",
    "active",
    "status"
  ];

  allowedFields.forEach(
    field => {
      if (
        Object.prototype
          .hasOwnProperty.call(
            changes,
            field
          )
      ) {
        competition[field] =
          changes[field];
      }
    }
  );

  competition.rating =
    clamp(
      Number(
        competition.rating || 50
      ),
      1,
      99
    );

  competition.updatedAt =
    new Date().toISOString();

  touchGameState();

  addCreatorLog(
    "UPDATE_COMPETITION",
    competitionId,
    oldData,
    competition
  );

  return {
    success: true,
    message:
      "Competition updated.",
    competition
  };
}

/* =========================================================
   SORTING
   ========================================================= */

function sortCompetitionsByRating(
  descending = true
) {
  return [
    ...getCompetitionCollection()
  ].sort((a, b) => {
    return descending
      ? b.rating - a.rating
      : a.rating - b.rating;
  });
}

function getTopCompetitions(
  limit = 10
) {
  return sortCompetitionsByRating(
    true
  ).slice(
    0,
    Math.max(
      1,
      Number(limit)
    )
  );
}

/* =========================================================
   DISPLAY DATA
   ========================================================= */

function getCompetitionDisplayData(
  competitionId
) {
  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return null;
  }

  return {
    id: competition.id,

    name: competition.name,

    shortName:
      competition.shortName,

    code: competition.code,

    type: competition.type,

    tier:
      getCompetitionTier(
        competition
      ),

    rating:
      competition.rating,

    reputation:
      competition.reputation,

    season:
      competition.season,

    country:
      competition.country,

    continent:
      competition.continent,

    participantCount:
      competition.participants.length,

    currentRound:
      competition.currentRound,

    totalRounds:
      competition.totalRounds,

    winnerId:
      competition.winnerId,

    status:
      competition.status,

    prizeMoney:
      competition.prizeMoney
  };
}

/* =========================================================
   CREATOR WORLD EDITOR
   ========================================================= */

function creatorAddCompetition(
  data = {}
) {
  if (!S.admin?.creatorMode) {
    return {
      success: false,
      message:
        "Creator Mode required."
    };
  }

  return addCompetition(data);
}

function creatorEditCompetition(
  competitionId,
  changes = {}
) {
  if (!S.admin?.creatorMode) {
    return {
      success: false,
      message:
        "Creator Mode required."
    };
  }

  return updateCompetition(
    competitionId,
    changes
  );
}

function creatorRemoveCompetition(
  competitionId
) {
  if (!S.admin?.creatorMode) {
    return {
      success: false,
      message:
        "Creator Mode required."
    };
  }

  return removeCompetition(
    competitionId
  );
}

function creatorSetCompetitionRating(
  competitionId,
  rating
) {
  if (!S.admin?.creatorMode) {
    return {
      success: false,
      message:
        "Creator Mode required."
    };
  }

  const competition =
    getCompetitionById(
      competitionId
    );

  if (!competition) {
    return {
      success: false,
      message:
        "Competition not found."
    };
  }

  const oldRating =
    competition.rating;

  competition.rating =
    clamp(
      Number(rating) || 1,
      1,
      99
    );

  competition.updatedAt =
    new Date().toISOString();

  touchGameState();

  addCreatorLog(
    "CREATOR_SET_COMPETITION_RATING",
    competitionId,
    oldRating,
    competition.rating
  );

  return {
    success: true,
    message:
      "Competition rating updated.",
    competition
  };
}

/* =========================================================
   VALIDATION
   ========================================================= */

function validateCompetition(
  competition
) {
  if (!competition) {
    return {
      valid: false,
      errors: [
        "Competition is missing."
      ]
    };
  }

  const errors = [];

  if (!competition.id) {
    errors.push(
      "Competition ID is missing."
    );
  }

  if (!competition.name) {
    errors.push(
      "Competition name is missing."
    );
  }

  if (!competition.code) {
    errors.push(
      "Competition code is missing."
    );
  }

  if (
    competition.rating < 1 ||
    competition.rating > 99
  ) {
    errors.push(
      "Competition rating must be between 1 and 99."
    );
  }

  if (
    !Array.isArray(
      competition.participants
    )
  ) {
    errors.push(
      "Participants must be an array."
    );
  }

  if (
    !Array.isArray(
      competition.fixtures
    )
  ) {
    errors.push(
      "Fixtures must be an array."
    );
  }

  if (
    !Array.isArray(
      competition.standings
    )
  ) {
    errors.push(
      "Standings must be an array."
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateCompetitionCollection() {
  return getCompetitionCollection()
    .map(competition => ({
      id: competition.id,
      name: competition.name,
      ...validateCompetition(
        competition
      )
    }));
}

/* =========================================================
   REPAIR
   ========================================================= */

function repairCompetitionData() {
  const competitions =
    getCompetitionCollection();

  competitions.forEach(
    competition => {
      if (!competition.id) {
        competition.id =
          createId("competition");
      }

      if (!competition.name) {
        competition.name =
          "Unknown Competition";
      }

      if (!competition.shortName) {
        competition.shortName =
          competition.name;
      }

      if (!competition.code) {
        competition.code = "NEW";
      }

      competition.code =
        String(
          competition.code
        ).toUpperCase();

      competition.rating =
        clamp(
          Number(
            competition.rating || 50
          ),
          1,
          99
        );

      competition.reputation =
        clamp(
          Number(
            competition.reputation || 50
          ),
          0,
          100
        );

      if (
        !Array.isArray(
          competition.participants
        )
      ) {
        competition.participants = [];
      }

      if (
        !Array.isArray(
          competition.qualifiedTeams
        )
      ) {
        competition.qualifiedTeams = [];
      }

      if (
        !Array.isArray(
          competition.fixtures
        )
      ) {
        competition.fixtures = [];
      }

      if (
        !Array.isArray(
          competition.results
        )
      ) {
        competition.results = [];
      }

      if (
        !Array.isArray(
          competition.standings
        )
      ) {
        competition.standings = [];
      }

      if (
        !Array.isArray(
          competition.rounds
        )
      ) {
        competition.rounds = [];
      }

      if (!competition.format) {
        competition.format = {};
      }

      if (
        competition.format
          .pointsForWin === undefined
      ) {
        competition.format.pointsForWin = 3;
      }

      if (
        competition.format
          .pointsForDraw === undefined
      ) {
        competition.format.pointsForDraw = 1;
      }

      if (
        competition.format
          .pointsForLoss === undefined
      ) {
        competition.format.pointsForLoss = 0;
      }

      if (
        competition.format
          .homeAway === undefined
      ) {
        competition.format.homeAway = true;
      }

      if (
        competition.format
          .roundRobin === undefined
      ) {
        competition.format.roundRobin = true;
      }

      if (
        competition.format
          .knockout === undefined
      ) {
        competition.format.knockout = false;
      }

      if (
        competition.format
          .groupStage === undefined
      ) {
        competition.format.groupStage = false;
      }

      if (
        competition.format.legs === undefined
      ) {
        competition.format.legs = 1;
      }

      competition.updatedAt =
        new Date().toISOString();
    }
  );

  touchGameState();

  return competitions;
}

/* =========================================================
   DEFAULT COMPETITIONS
   ========================================================= */

function createDefaultCompetitions() {
  return [

    /* =========================
       ENGLAND
       ========================= */

    createCompetition({
      id: "comp_premier_league",
      name: "Premier League",
      shortName: "Premier League",
      code: "EPL",
      type:
        COMPETITION_TYPES.LEAGUE,
      tier: 1,
      country: "England",
      continent: "Europe",
      rating: 91,
      reputation: 100,
      season: 2026
    }),

    createCompetition({
      id: "comp_fa_cup",
      name: "FA Cup",
      shortName: "FA Cup",
      code: "FAC",
      type:
        COMPETITION_TYPES.DOMESTIC_CUP,
      tier: 1,
      country: "England",
      continent: "Europe",
      rating: 84,
      reputation: 94,
      season: 2026
    }),

    createCompetition({
      id: "comp_community_shield",
      name: "Community Shield",
      shortName: "Community Shield",
      code: "CS",
      type:
        COMPETITION_TYPES.DOMESTIC_SUPER_CUP,
      tier: 1,
      country: "England",
      continent: "Europe",
      rating: 80,
      reputation: 88,
      season: 2026
    }),

    /* =========================
       SPAIN
       ========================= */

    createCompetition({
      id: "comp_la_liga",
      name: "La Liga",
      shortName: "La Liga",
      code: "LAL",
      type:
        COMPETITION_TYPES.LEAGUE,
      tier: 1,
      country: "Spain",
      continent: "Europe",
      rating: 90,
      reputation: 99,
      season: 2026
    }),

    createCompetition({
      id: "comp_copa_del_rey",
      name: "Copa del Rey",
      shortName: "Copa del Rey",
      code: "CDR",
      type:
        COMPETITION_TYPES.DOMESTIC_CUP,
      tier: 1,
      country: "Spain",
      continent: "Europe",
      rating: 82,
      reputation: 91,
      season: 2026
    }),

    /* =========================
       GERMANY
       ========================= */

    createCompetition({
      id: "comp_bundesliga",
      name: "Bundesliga",
      shortName: "Bundesliga",
      code: "BUN",
      type:
        COMPETITION_TYPES.LEAGUE,
      tier: 1,
      country: "Germany",
      continent: "Europe",
      rating: 89,
      reputation: 98,
      season: 2026
    }),

    createCompetition({
      id: "comp_dfb_pokal",
      name: "DFB-Pokal",
      shortName: "DFB-Pokal",
      code: "DFB",
      type:
        COMPETITION_TYPES.DOMESTIC_CUP,
      tier: 1,
      country: "Germany",
      continent: "Europe",
      rating: 81,
      reputation: 90,
      season: 2026
    }),

    /* =========================
       ITALY
       ========================= */

    createCompetition({
      id: "comp_serie_a",
      name: "Serie A",
      shortName: "Serie A",
      code: "SEA",
      type:
        COMPETITION_TYPES.LEAGUE,
      tier: 1,
      country: "Italy",
      continent: "Europe",
      rating: 88,
      reputation: 97,
      season: 2026
    }),

    createCompetition({
      id: "comp_coppa_italia",
      name: "Coppa Italia",
      shortName: "Coppa Italia",
      code: "CI",
      type:
        COMPETITION_TYPES.DOMESTIC_CUP,
      tier: 1,
      country: "Italy",
      continent: "Europe",
      rating: 80,
      reputation: 89,
      season: 2026
    }),

    /* =========================
       FRANCE
       ========================= */

    createCompetition({
      id: "comp_ligue_1",
      name: "Ligue 1",
      shortName: "Ligue 1",
      code: "L1",
      type:
        COMPETITION_TYPES.LEAGUE,
      tier: 1,
      country: "France",
      continent: "Europe",
      rating: 87,
      reputation: 96,
      season: 2026
    }),

    createCompetition({
      id: "comp_coupe_de_france",
      name: "Coupe de France",
      shortName: "Coupe de France",
      code: "CDF",
      type:
        COMPETITION_TYPES.DOMESTIC_CUP,
      tier: 1,
      country: "France",
      continent: "Europe",
      rating: 79,
      reputation: 88,
      season: 2026
    }),

    /* =========================
       EUROPE
       ========================= */

    createCompetition({
      id: "comp_champions_league",
      name: "UEFA Champions League",
      shortName: "Champions League",
      code: "UCL",
      type:
        COMPETITION_TYPES.CONTINENTAL_LEAGUE,
      tier: 1,
      country: "",
      continent: "Europe",
      rating: 99,
      reputation: 100,
      season: 2026,
      format: {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
        homeAway: true,
        roundRobin: false,
        knockout: true,
        groupStage: true,
        legs: 2
      }
    }),

    createCompetition({
      id: "comp_europa_league",
      name: "UEFA Europa League",
      shortName: "Europa League",
      code: "UEL",
      type:
        COMPETITION_TYPES.CONTINENTAL_CUP,
      tier: 1,
      country: "",
      continent: "Europe",
      rating: 88,
      reputation: 96,
      season: 2026,
      format: {
        knockout: true,
        groupStage: true,
        legs: 2
      }
    }),

    createCompetition({
      id: "comp_conference_league",
      name: "UEFA Conference League",
      shortName: "Conference League",
      code: "UECL",
      type:
        COMPETITION_TYPES.CONTINENTAL_CUP,
      tier: 2,
      country: "",
      continent: "Europe",
      rating: 78,
      reputation: 88,
      season: 2026,
      format: {
        knockout: true,
        groupStage: true,
        legs: 2
      }
    }),

    /* =========================
       INTERNATIONAL
       ========================= */

    createCompetition({
      id: "comp_world_cup",
      name: "FIFA World Cup",
      shortName: "World Cup",
      code: "WC",
      type:
        COMPETITION_TYPES.INTERNATIONAL_CUP,
      tier: 1,
      country: "",
      continent: "World",
      rating: 99,
      reputation: 100,
      season: 2026,
      format: {
        knockout: true,
        groupStage: true,
        legs: 1
      }
    }),

    createCompetition({
      id: "comp_euro",
      name: "UEFA European Championship",
      shortName: "Euro",
      code: "EURO",
      type:
        COMPETITION_TYPES.INTERNATIONAL_CUP,
      tier: 1,
      country: "",
      continent: "Europe",
      rating: 96,
      reputation: 99,
      season: 2026,
      format: {
        knockout: true,
        groupStage: true,
        legs: 1
      }
    }),

    createCompetition({
      id: "comp_copa_america",
      name: "Copa America",
      shortName: "Copa America",
      code: "COPA",
      type:
        COMPETITION_TYPES.INTERNATIONAL_CUP,
      tier: 1,
      country: "",
      continent: "South America",
      rating: 94,
      reputation: 98,
      season: 2026,
      format: {
        knockout: true,
        groupStage: true,
        legs: 1
      }
    }),

    createCompetition({
      id: "comp_afcon",
      name: "Africa Cup of Nations",
      shortName: "AFCON",
      code: "AFCON",
      type:
        COMPETITION_TYPES.INTERNATIONAL_CUP,
      tier: 1,
      country: "",
      continent: "Africa",
      rating: 87,
      reputation: 93,
      season: 2026,
      format: {
        knockout: true,
        groupStage: true,
        legs: 1
      }
    }),

    createCompetition({
      id: "comp_asian_cup",
      name: "AFC Asian Cup",
      shortName: "Asian Cup",
      code: "AC",
      type:
        COMPETITION_TYPES.INTERNATIONAL_CUP,
      tier: 1,
      country: "",
      continent: "Asia",
      rating: 84,
      reputation: 92,
      season: 2026,
      format: {
        knockout: true,
        groupStage: true,
        legs: 1
      }
    })

  ];
}

/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeCompetitionSystem() {
  if (!S.world) {
    console.warn(
      "[COMPETITIONS] World state missing."
    );

    return false;
  }

  if (
    !Array.isArray(
      S.world.competitions
    )
  ) {
    S.world.competitions = [];
  }

  repairCompetitionData();

  /*
   * Populate default competitions only
   * when the world is empty.
   */
  if (
    S.world.competitions.length === 0
  ) {
    S.world.competitions =
      createDefaultCompetitions();

    touchGameState();
  }

  return true;
}

const COMPETITION_SYSTEM_READY =
  initializeCompetitionSystem();

console.log(
  `[COMPETITIONS] ${GAME_NAME} competition system ready.`
);
