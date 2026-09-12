/* =========================================================
   RV SPORTS: FC CUP 26
   CORE STATE
   File: js/core/state.js

   CENTRAL GAME STATE

   RULE:
   - Semua data utama game berada di S.
   - Gameplay systems membaca / mengubah S.
   - UI hanya menampilkan data.
   - Save system menyimpan S.
   - Creator Mode juga bekerja melalui S.
   - Tidak ada DOM manipulation di file ini.
   ========================================================= */


/* =========================================================
   01. GAME CONSTANTS
   ========================================================= */

const GAME_NAME = "RV SPORTS: FC CUP 26";
const GAME_VERSION = "1.0.0";

const DEFAULT_SEASON = 2026;
const DEFAULT_DATE = "2026-07-01";


/* =========================================================
   02. PLAYER STATE
   ========================================================= */

function createDefaultPlayer() {

    return {

        /* Identity */

        id: "",
        name: "",
        shirtName: "",
        email: "",

        birthDate: "",
        birthPlace: "",

        age: 18,

        nationality: "",
        position: "",

        shirtNumber: 0,

        photo: "",


        /* Football rating */

        ovr: 0,
        potential: 0,

        level: 1,
        experience: 0,

        form: 100,
        morale: 100,
        fitness: 100,
        energy: 100,
        health: 100,


        /* Main stats */

        stats: {

            pac: 0,
            sho: 0,
            pas: 0,
            dri: 0,
            def: 0,
            phy: 0

        },


        /* Career totals */

        career: {

            appearances: 0,
            goals: 0,
            assists: 0,

            cleanSheets: 0,

            wins: 0,
            losses: 0,
            draws: 0,

            minutesPlayed: 0

        },


        /* Current club */

        currentClub: {

            clubId: "",
            joined: null,
            contractUntil: null,

            shirtNumber: 0,

            role: "Player"

        },


        /* Club history */

        clubs: [],


        /* National team */

        nationalTeam: {

            country: "",

            caps: 0,
            goals: 0,
            assists: 0,

            trophies: []

        },


        /* Trophies */

        trophies: {

            club: [],
            national: [],
            individual: []

        },


        /* Economy */

        economy: {

            money: 0,

            salary: 0,

            marketValue: 0,

            releaseClause: 0,

            weeklyIncome: 0,

            careerEarnings: 0

        },


        /* Social */

        social: {

            fans: 0,

            followers: 0,

            popularity: 0,

            reputation: 0,

            socialReach: 0

        },


        /* Achievements */

        achievements: [],


        /* Preferences */

        preferences: {

            preferredFoot: "Right",

            playStyle: "",

            celebration: ""

        }

    };

}


/* =========================================================
   03. CAREER STATE
   ========================================================= */

function createDefaultCareer() {

    return {

        started: false,

        startDate: null,

        currentSeason: DEFAULT_SEASON,

        currentYear: DEFAULT_SEASON,
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

}


/* =========================================================
   04. WORLD STATE
   ========================================================= */

function createDefaultWorld() {

    return {

        currentDate: DEFAULT_DATE,

        currentSeason: DEFAULT_SEASON,

        currentCompetition: "",

        currentMatchday: 1,

        activeClubId: "",

        activeCountry: "",


        /* World database */

        clubs: [],
        countries: [],
        competitions: [],


        /* Match system */

        fixtures: [],
        results: [],
        standings: [],


        /* Transfers */

        transfers: [],


        /* Dynamic world events */

        worldEvents: [],


        /* Optional schedule */

        schedule: null

    };

}


/* =========================================================
   05. ECONOMY STATE
   ========================================================= */

function createDefaultEconomy() {

    return {

        currency: "EUR",

        inflation: 0,

        marketMultiplier: 1,

        sponsorships: [],

        businesses: [],

        transactions: [],

        incomeHistory: [],
        expenseHistory: []

    };

}


/* =========================================================
   06. SOCIAL STATE
   ========================================================= */

function createDefaultSocial() {

    return {

        posts: [],

        notifications: [],

        trendingScore: 0,

        mediaAppearances: [],

        endorsements: [],

        socialEvents: []

    };

}


/* =========================================================
   07. ADMIN / CREATOR STATE
   ========================================================= */

function createDefaultAdmin() {

    return {

        /* Authentication */

        creatorMode: false,

        authenticated: false,

        creatorEmail: "",


        /* OVR override */

        ovrOverride: false,

        forcedOvr: null,


        /* God mode */

        godMode: false,

        unlimitedMoney: false,

        unlimitedEnergy: false,

        unlimitedHealth: false,


        /* Logs */

        logs: [],


        /* Backup */

        lastBackup: null,

        backupCount: 0,


        /* Session */

        sessionStarted: null

    };

}


/* =========================================================
   08. SETTINGS STATE
   ========================================================= */

function createDefaultSettings() {

    return {

        language: "en",

        sound: true,

        music: true,

        vibration: true,

        notifications: true,

        reducedMotion: false,

        darkMode: true

    };

}


/* =========================================================
   09. GAME META
   ========================================================= */

function createDefaultMeta() {

    const now =
        new Date().toISOString();

    return {

        gameName: GAME_NAME,

        version: GAME_VERSION,

        createdAt: now,

        updatedAt: now,

        lastPlayedAt: null,

        lastSavedAt: null,

        lastLoadedAt: null,

        saveSlot: 1

    };

}


/* =========================================================
   10. COMPLETE GAME STATE
   ========================================================= */

function createDefaultGameState() {

    return {

        meta: createDefaultMeta(),

        account: {

            email: "",
            name: "",
            created: false

        },

        player: createDefaultPlayer(),

        career: createDefaultCareer(),

        world: createDefaultWorld(),

        economy: createDefaultEconomy(),

        social: createDefaultSocial(),

        admin: createDefaultAdmin(),

        settings: createDefaultSettings()

    };

}


/* =========================================================
   11. PLAYER ID
   ========================================================= */

function generatePlayerId() {

    const time =
        Date.now().toString(36);

    const random =
        Math.random()
            .toString(36)
            .slice(2, 8);

    return "player_" + time + "_" + random;

}


/* =========================================================
   12. INITIAL GAME STATE
   ========================================================= */

const S = createDefaultGameState();


/*
   Give the initial player a valid ID.

   Kita sengaja melakukan ini setelah S dibuat
   supaya createDefaultPlayer() tidak bergantung
   pada generatePlayerId() saat object dibuat.
*/

S.player.id = generatePlayerId();


/* =========================================================
   13. STATE RESET
   ========================================================= */

function resetGameState() {

    const fresh =
        createDefaultGameState();

    fresh.player.id =
        generatePlayerId();

    Object.keys(S).forEach(key => {

        delete S[key];

    });

    Object.assign(
        S,
        fresh
    );

    return S;

}


/* =========================================================
   14. TOUCH STATE
   ========================================================= */

function touchGameState() {

    if (!S.meta) {
        S.meta = createDefaultMeta();
    }

    S.meta.updatedAt =
        new Date().toISOString();

    S.meta.lastPlayedAt =
        new Date().toISOString();

}


/* =========================================================
   15. CLONE STATE
   ========================================================= */

function cloneGameState() {

    return JSON.parse(
        JSON.stringify(S)
    );

}


/* =========================================================
   16. CREATOR LOG
   ========================================================= */

function addCreatorLog(
    action,
    target,
    oldValue = null,
    newValue = null
) {

    if (!S.admin) {
        S.admin =
            createDefaultAdmin();
    }

    const log = {

        id:
            "log_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 7),

        timestamp:
            new Date().toISOString(),

        action: action,

        target: target,

        oldValue: oldValue,

        newValue: newValue

    };


    S.admin.logs.unshift(log);


    /* Maximum 200 logs */

    if (
        S.admin.logs.length > 200
    ) {

        S.admin.logs =
            S.admin.logs.slice(0, 200);

    }

}


/* =========================================================
   17. TROPHY FACTORY
   ========================================================= */

function createTrophy({

    name = "",

    year = null,

    type = "club",

    competition = "",

    clubId = "",

    country = "",

    description = ""

} = {}) {

    return {

        id:
            "trophy_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 8),

        name: name,

        year: year,

        type: type,

        competition: competition,

        clubId: clubId,

        country: country,

        description: description,

        createdAt:
            new Date().toISOString()

    };

}


/* =========================================================
   18. CLUB HISTORY FACTORY
   ========================================================= */

function createClubHistoryEntry({

    clubId = "",

    joined = null,

    left = null,

    appearances = 0,

    goals = 0,

    assists = 0,

    trophies = []

} = {}) {

    return {

        clubId: clubId,

        joined: joined,

        left: left,

        appearances: appearances,

        goals: goals,

        assists: assists,

        trophies: trophies

    };

}


/* =========================================================
   19. TRANSFER OFFER FACTORY
   ========================================================= */

function createTransferOffer({

    clubId = "",

    salary = 0,

    marketValue = 0,

    contractYears = 1,

    role = "Player"

} = {}) {

    return {

        id:
            "offer_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 7),

        clubId: clubId,

        salary: salary,

        marketValue: marketValue,

        contractYears: contractYears,

        role: role,

        status: "Pending",

        createdAt:
            new Date().toISOString()

    };

}


/* =========================================================
   20. TRANSACTION FACTORY
   ========================================================= */

function createTransaction({

    type = "expense",

    category = "",

    amount = 0,

    description = ""

} = {}) {

    return {

        id:
            "transaction_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 7),

        type: type,

        category: category,

        amount: Number(amount) || 0,

        description: description,

        date:
            new Date().toISOString()

    };

}


/* =========================================================
   21. STATE VALIDATION
   ========================================================= */

function validateInitialState() {

    const requiredPaths = [

        "meta",

        "account",

        "player",

        "career",

        "world",

        "economy",

        "social",

        "admin",

        "settings"

    ];


    const missing = [];


    requiredPaths.forEach(path => {

        if (
            !S[path] ||
            typeof S[path] !== "object"
        ) {

            missing.push(path);

        }

    });


    if (missing.length > 0) {

        console.error(
            "[STATE] Initialization failed:",
            missing
        );

        return false;

    }


    /* Player checks */

    if (!S.player.stats) {

        console.error(
            "[STATE] Player stats missing."
        );

        return false;

    }


    if (!S.player.career) {

        console.error(
            "[STATE] Player career data missing."
        );

        return false;

    }


    /* World checks */

    if (
        !Array.isArray(S.world.clubs)
    ) {

        S.world.clubs = [];

    }

    if (
        !Array.isArray(S.world.countries)
    ) {

        S.world.countries = [];

    }

    if (
        !Array.isArray(S.world.competitions)
    ) {

        S.world.competitions = [];

    }


    return true;

}


/* =========================================================
   22. STATE REPAIR
   ========================================================= */

function repairGameState() {

    const defaults =
        createDefaultGameState();


    /* Top level */

    Object.keys(defaults)
        .forEach(key => {

            if (
                S[key] === undefined ||
                S[key] === null
            ) {

                S[key] =
                    defaults[key];

            }

        });


    /* Player */

    if (!S.player.id) {

        S.player.id =
            generatePlayerId();

    }


    if (!S.player.stats) {

        S.player.stats =
            defaults.player.stats;

    }


    if (!S.player.career) {

        S.player.career =
            defaults.player.career;

    }


    if (!S.player.currentClub) {

        S.player.currentClub =
            defaults.player.currentClub;

    }


    if (!S.player.nationalTeam) {

        S.player.nationalTeam =
            defaults.player.nationalTeam;

    }


    if (!S.player.trophies) {

        S.player.trophies =
            defaults.player.trophies;

    }


    if (!S.player.economy) {

        S.player.economy =
            defaults.player.economy;

    }


    if (!S.player.social) {

        S.player.social =
            defaults.player.social;

    }


    if (!S.player.preferences) {

        S.player.preferences =
            defaults.player.preferences;

    }


    /* World arrays */

    const worldArrays = [

        "clubs",
        "countries",
        "competitions",
        "fixtures",
        "results",
        "standings",
        "transfers",
        "worldEvents"

    ];


    worldArrays.forEach(key => {

        if (
            !Array.isArray(
                S.world[key]
            )
        ) {

            S.world[key] = [];

        }

    });


    /* Economy arrays */

    [
        "sponsorships",
        "businesses",
        "transactions",
        "incomeHistory",
        "expenseHistory"

    ].forEach(key => {

        if (
            !Array.isArray(
                S.economy[key]
            )
        ) {

            S.economy[key] = [];

        }

    });


    /* Social arrays */

    [
        "posts",
        "notifications",
        "mediaAppearances",
        "endorsements",
        "socialEvents"

    ].forEach(key => {

        if (
            !Array.isArray(
                S.social[key]
            )
        ) {

            S.social[key] = [];

        }

    });


    /* Admin logs */

    if (
        !Array.isArray(
            S.admin.logs
        )
    ) {

        S.admin.logs = [];

    }


    touchGameState();


    return S;

}


/* =========================================================
   23. DEBUG
   ========================================================= */

function debugGameState() {

    console.log(
        "======================================"
    );

    console.log(
        GAME_NAME
    );

    console.log(
        "Version:",
        GAME_VERSION
    );

    console.log(
        "======================================"
    );

    console.log(
        "STATE:",
        S
    );

    console.log(
        "PLAYER:",
        S.player
    );

    console.log(
        "CAREER:",
        S.career
    );

    console.log(
        "WORLD:",
        S.world
    );

    console.log(
        "ADMIN:",
        S.admin
    );

    console.log(
        "======================================"
    );

}


/* =========================================================
   24. FINAL STATE CHECK
   ========================================================= */

const STATE_READY =
    validateInitialState();


if (STATE_READY) {

    console.log(
        `${GAME_NAME} state initialized.`
    );

    console.log(
        "[STATE] Version:",
        GAME_VERSION
    );

    console.log(
        "[STATE] Player ID:",
        S.player.id
    );

} else {

    console.error(
        "[STATE] State system failed."
    );

}
