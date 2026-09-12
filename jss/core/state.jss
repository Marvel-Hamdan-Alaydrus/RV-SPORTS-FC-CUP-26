```javascript
/* =========================================================
   RV SPORTS: FC CUP 26
   CORE STATE
   ========================================================= */

/*
    File ini adalah pusat data game.

    RULE:
    - Gameplay boleh membaca state.
    - Gameplay boleh mengubah state melalui system masing-masing.
    - Save system nanti bertugas menyimpan state.
    - UI hanya menampilkan state.
    - Creator Mode juga mengubah state.

    Jangan taruh DOM manipulation di file ini.
*/


/* =========================================================
   01. GAME VERSION
   ========================================================= */

const GAME_VERSION = "1.0.0";

const GAME_NAME = "RV SPORTS: FC CUP 26";


/* =========================================================
   02. DEFAULT PLAYER
   ========================================================= */

function createDefaultPlayer() {

    return {

        /* ---------------------------------------------
           Identity
        ---------------------------------------------- */

        id: generatePlayerId(),

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


        /* ---------------------------------------------
           Football Rating
        ---------------------------------------------- */

        ovr: 0,

        potential: 0,

        level: 1,

        experience: 0,

        form: 100,

        morale: 100,

        fitness: 100,

        energy: 100,

        health: 100,


        /* ---------------------------------------------
           Main Stats
        ---------------------------------------------- */

        stats: {

            pac: 0,

            sho: 0,

            pas: 0,

            dri: 0,

            def: 0,

            phy: 0

        },


        /* ---------------------------------------------
           Career Statistics
        ---------------------------------------------- */

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


        /* ---------------------------------------------
           Current Club
        ---------------------------------------------- */

        currentClub: {

            clubId: "",

            joined: null,

            contractUntil: null,

            shirtNumber: 0,

            role: "Player"

        },


        /* ---------------------------------------------
           Club History
        ---------------------------------------------- */

        clubs: [],


        /*
            Example:

            {
                clubId: "club_001",
                joined: 2026,
                left: 2029,
                appearances: 91,
                goals: 47,
                assists: 22,
                trophies: []
            }
        */


        /* ---------------------------------------------
           National Team
        ---------------------------------------------- */

        nationalTeam: {

            country: "",

            caps: 0,

            goals: 0,

            assists: 0,

            trophies: []

        },


        /* ---------------------------------------------
           Trophies
        ---------------------------------------------- */

        trophies: {

            club: [],

            national: [],

            individual: []

        },


        /* ---------------------------------------------
           Economy
        ---------------------------------------------- */

        economy: {

            money: 0,

            salary: 0,

            marketValue: 0,

            releaseClause: 0,

            weeklyIncome: 0,

            careerEarnings: 0

        },


        /* ---------------------------------------------
           Social
        ---------------------------------------------- */

        social: {

            fans: 0,

            followers: 0,

            popularity: 0,

            reputation: 0,

            socialReach: 0

        },


        /* ---------------------------------------------
           Personal Achievements
        ---------------------------------------------- */

        achievements: [],


        /* ---------------------------------------------
           Player Preferences
        ---------------------------------------------- */

        preferences: {

            preferredFoot: "Right",

            playStyle: "",

            celebration: ""

        }

    };

}


/* =========================================================
   03. DEFAULT CAREER STATE
   ========================================================= */

function createDefaultCareer() {

    return {

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

}


/* =========================================================
   04. WORLD STATE
   ========================================================= */

function createDefaultWorld() {

    return {

        currentDate: "2026-07-01",

        currentSeason: 2026,

        currentCompetition: "",

        currentMatchday: 1,

        activeClubId: "",

        activeCountry: "",

        clubs: [],

        countries: [],

        competitions: [],

        fixtures: [],

        results: [],

        standings: [],

        transfers: [],

        worldEvents: []

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
   07. ADMIN STATE
   ========================================================= */

function createDefaultAdmin() {

    return {

        /* ---------------------------------------------
           Authentication
        ---------------------------------------------- */

        creatorMode: false,

        authenticated: false,

        creatorEmail: "",


        /* ---------------------------------------------
           OVR Override
        ---------------------------------------------- */

        ovrOverride: false,

        forcedOvr: null,


        /* ---------------------------------------------
           Creator Controls
        ---------------------------------------------- */

        godMode: false,

        unlimitedMoney: false,

        unlimitedEnergy: false,

        unlimitedHealth: false,


        /* ---------------------------------------------
           Logs
        ---------------------------------------------- */

        logs: [],


        /* ---------------------------------------------
           Backup
        ---------------------------------------------- */

        lastBackup: null,

        backupCount: 0,


        /* ---------------------------------------------
           Security
        ---------------------------------------------- */

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
   09. COMPLETE GAME STATE
   ========================================================= */

function createDefaultGameState() {

    return {

        /* Game metadata */

        meta: {

            gameName: GAME_NAME,

            version: GAME_VERSION,

            createdAt: new Date().toISOString(),

            lastPlayedAt: null,

            saveSlot: 1

        },


        /* Account */

        account: {

            email: "",

            name: "",

            created: false

        },


        /* Player */

        player: createDefaultPlayer(),


        /* Career */

        career: createDefaultCareer(),


        /* Football world */

        world: createDefaultWorld(),


        /* Economy */

        economy: createDefaultEconomy(),


        /* Social */

        social: createDefaultSocial(),


        /* Admin / Creator */

        admin: createDefaultAdmin(),


        /* Settings */

        settings: createDefaultSettings()

    };

}


/* =========================================================
   10. GLOBAL GAME STATE
   ========================================================= */

/*
    S adalah singkatan dari State.

    Semua system nanti membaca object ini.

    Contoh:

        S.player.name

        S.player.ovr

        S.player.stats.pac

        S.player.economy.money

        S.player.social.followers

        S.player.trophies.club

        S.career.currentSeason

        S.admin.creatorMode
*/

const S = createDefaultGameState();


/* =========================================================
   11. STATE HELPERS
   ========================================================= */


/*
    Reset seluruh game state.
*/

function resetGameState() {

    const freshState = createDefaultGameState();

    Object.keys(S).forEach(key => {

        delete S[key];

    });

    Object.assign(S, freshState);

}


/*
    Update last played timestamp.
*/

function touchGameState() {

    S.meta.lastPlayedAt =
        new Date().toISOString();

}


/*
    Get a safe copy of state.

    Berguna untuk backup atau debugging.
*/

function cloneGameState() {

    return JSON.parse(
        JSON.stringify(S)
    );

}


/* =========================================================
   12. PLAYER ID
   ========================================================= */

function generatePlayerId() {

    const timestamp =
        Date.now().toString(36);

    const random =
        Math.random()
            .toString(36)
            .substring(2, 8);

    return `player_${timestamp}_${random}`;

}


/* =========================================================
   13. CREATOR LOG
   ========================================================= */

function addCreatorLog(
    action,
    target,
    oldValue,
    newValue
) {

    const log = {

        id:
            `log_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 7)}`,

        timestamp:
            new Date().toISOString(),

        action: action,

        target: target,

        oldValue: oldValue,

        newValue: newValue

    };


    S.admin.logs.unshift(log);


    /*
        Limit log supaya state tidak
        tumbuh tanpa batas.
    */

    if (S.admin.logs.length > 200) {

        S.admin.logs =
            S.admin.logs.slice(0, 200);

    }

}


/* =========================================================
   14. TROPHY FACTORY
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
            `trophy_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 8)}`,

        name,

        year,

        type,

        competition,

        clubId,

        country,

        description,

        createdAt:
            new Date().toISOString()

    };

}


/* =========================================================
   15. CLUB HISTORY FACTORY
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

        clubId,

        joined,

        left,

        appearances,

        goals,

        assists,

        trophies

    };

}


/* =========================================================
   16. TRANSFER OFFER FACTORY
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
            `offer_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 7)}`,

        clubId,

        salary,

        marketValue,

        contractYears,

        role,

        status: "Pending",

        createdAt:
            new Date().toISOString()

    };

}


/* =========================================================
   17. TRANSACTION FACTORY
   ========================================================= */

function createTransaction({

    type = "expense",

    category = "",

    amount = 0,

    description = ""

} = {}) {

    return {

        id:
            `transaction_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 7)}`,

        type,

        category,

        amount,

        description,

        date:
            new Date().toISOString()

    };

}


/* =========================================================
   18. STATE DEBUG
   ========================================================= */

/*
    Dipakai nanti saat development.

    Console:

        debugGameState()

*/

function debugGameState() {

    console.log(
        "========== FC CUP 26 STATE =========="
    );

    console.log(S);

    console.log(
        "======================================"
    );

}


/* =========================================================
   19. INITIALIZATION CHECK
   ========================================================= */

function validateInitialState() {

    const requiredPaths = [

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
            "FC CUP 26 state initialization failed:",
            missing
        );

        return false;

    }


    return true;

}


/* =========================================================
   20. BOOT STATE
   ========================================================= */

const STATE_READY =
    validateInitialState();


if (STATE_READY) {

    console.log(
        `${GAME_NAME} state initialized.`
    );

}
```
