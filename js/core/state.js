/* =========================================================
   RV SPORTS: FC CUP 26
   CORE STATE SYSTEM
   Version: 2.0.0
   ========================================================= */

(function () {
    "use strict";

    const GAME_NAME = "RV SPORTS: FC CUP 26";
    const GAME_VERSION = "2.0.0";

    const DEFAULT_SEASON = 2026;
    const DEFAULT_DATE = "2026-07-01";

    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    function uid(prefix = "id") {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).slice(2, 9)
        );
    }

    function nowISO() {
        return new Date().toISOString();
    }

    function safeNumber(value, fallback = 0) {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }

    function clamp(value, min, max) {
        return Math.min(
            Math.max(safeNumber(value, min), min),
            max
        );
    }

    function safeString(value, fallback = "") {
        return typeof value === "string"
            ? value
            : fallback;
    }

    /* =====================================================
       PLAYER
       ===================================================== */

    function createDefaultPlayer() {
        return {
            id: uid("player"),

            /* Identity */
            name: "",
            shirtName: "",
            email: "",
            birthDate: "",
            birthPlace: "",
            age: 16,
            nationality: "",
            position: "ST",
            shirtNumber: 9,
            photo: "",

            /* Football */
            ovr: 60,
            potential: 85,
            level: 1,
            experience: 0,

            form: 70,
            morale: 75,
            fitness: 100,
            energy: 100,
            health: 100,

            /* Main stats */
            stats: {
                pac: 60,
                sho: 60,
                pas: 60,
                dri: 60,
                def: 40,
                phy: 55
            },

            /* Career statistics */
            careerStats: {
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
                joined: "",
                contractUntil: "",
                shirtNumber: 9,
                role: "Prospect"
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

            /* Trophy room */
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

            /* Player preferences */
            preferences: {
                preferredFoot: "Right",
                preferredRole: "",
                favoriteNumber: 9
            }
        };
    }

    /* =====================================================
       CAREER
       ===================================================== */

    function createDefaultCareer() {
        return {
            started: false,
            startDate: "",
            currentSeason: DEFAULT_SEASON,

            currentYear: 2026,
            currentMonth: 7,
            currentDay: 1,

            currentClubId: "",
            previousClubId: "",

            totalSeasons: 0,

            careerStatus: "not_started",

            transferStatus: "none",
            transferOffers: [],

            matchesPlayedThisSeason: 0,
            goalsThisSeason: 0,
            assistsThisSeason: 0,
            trophiesThisSeason: [],

            seasonHistory: []
        };
    }

    /* =====================================================
       WORLD
       ===================================================== */

    function createDefaultWorld() {
        return {
            currentDate: DEFAULT_DATE,
            currentSeason: DEFAULT_SEASON,

            currentCompetition: "",
            currentMatchday: 0,

            activeClubId: "",
            activeCountry: "",

            clubs: [],
            countries: [],
            competitions: [],

            fixtures: [],
            results: [],
            standings: [],

            transfers: [],

            worldEvents: [],

            schedule: []
        };
    }

    /* =====================================================
       ECONOMY
       ===================================================== */

    function createDefaultEconomy() {
        return {
            currency: "EUR",

            inflation: 1,
            marketMultiplier: 1,

            sponsorships: [],
            businesses: [],

            transactions: [],
            incomeHistory: [],
            expenseHistory: []
        };
    }

    /* =====================================================
       SOCIAL
       ===================================================== */

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

    /* =====================================================
       ADMIN / CREATOR
       ===================================================== */

    function createDefaultAdmin() {
        return {
            creatorMode: false,

            authenticated: false,
            creatorEmail: "",

            /* OVR control */
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

            sessionStarted: ""
        };
    }

    /* =====================================================
       SETTINGS
       ===================================================== */

    function createDefaultSettings() {
        return {
            language: "id",

            sound: true,
            music: true,
            vibration: true,
            notifications: true,

            reducedMotion: false,

            darkMode: true
        };
    }

    /* =====================================================
       META
       ===================================================== */

    function createDefaultMeta() {
        const timestamp = nowISO();

        return {
            gameName: GAME_NAME,
            version: GAME_VERSION,

            createdAt: timestamp,
            updatedAt: timestamp,

            lastPlayedAt: null,
            lastSavedAt: null,
            lastLoadedAt: null,

            saveSlot: "main"
        };
    }

    /* =====================================================
       MAIN STATE
       ===================================================== */

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

    /* =====================================================
       GAME STATE
       ===================================================== */

    const S = createDefaultGameState();

    /*
     * IMPORTANT
     *
     * `const S` tidak otomatis menjadi `window.S`.
     *
     * app.js menggunakan window.S.
     * Jadi kita expose state secara eksplisit.
     */

    window.S = S;
    window.GAME_NAME = GAME_NAME;
    window.GAME_VERSION = GAME_VERSION;

    /* =====================================================
       STATE MUTATION
       ===================================================== */

    function touchGameState() {
        S.meta.updatedAt = nowISO();
        S.meta.lastPlayedAt = nowISO();

        return S;
    }

    function markSaved() {
        S.meta.lastSavedAt = nowISO();
        S.meta.updatedAt = nowISO();

        return S;
    }

    function markLoaded() {
        S.meta.lastLoadedAt = nowISO();
        S.meta.lastPlayedAt = nowISO();

        return S;
    }

    /* =====================================================
       RESET
       ===================================================== */

    function resetGameState() {
        const fresh = createDefaultGameState();

        /*
         * Jangan mengganti object S.
         * Kita pertahankan reference yang sudah dipakai
         * script lain.
         */

        Object.keys(S).forEach(function (key) {
            delete S[key];
        });

        Object.assign(S, fresh);

        window.S = S;

        return S;
    }

    /* =====================================================
       CLONE
       ===================================================== */

    function cloneGameState() {
        return JSON.parse(JSON.stringify(S));
    }

    /* =====================================================
       CREATOR LOG
       ===================================================== */

    function addCreatorLog(
        action,
        details = "",
        type = "info"
    ) {
        const log = {
            id: uid("log"),
            timestamp: nowISO(),
            type: safeString(type, "info"),
            action: safeString(action, "Unknown Action"),
            details: safeString(details, "")
        };

        S.admin.logs.unshift(log);

        /*
         * Batasi log supaya save tidak membengkak.
         */
        if (S.admin.logs.length > 500) {
            S.admin.logs.length = 500;
        }

        touchGameState();

        return log;
    }

    /* =====================================================
       TROPHY FACTORY
       ===================================================== */

    function createTrophy(data = {}) {
        return {
            id: data.id || uid("trophy"),

            name: safeString(data.name, "Unknown Trophy"),

            competition: safeString(
                data.competition,
                ""
            ),

            season: safeNumber(
                data.season,
                DEFAULT_SEASON
            ),

            year: safeNumber(
                data.year,
                DEFAULT_SEASON
            ),

            type: safeString(
                data.type,
                "club"
            ),

            clubId: safeString(
                data.clubId,
                ""
            ),

            country: safeString(
                data.country,
                ""
            ),

            date: safeString(
                data.date,
                ""
            )
        };
    }

    /* =====================================================
       CLUB HISTORY
       ===================================================== */

    function createClubHistoryEntry(data = {}) {
        return {
            id: data.id || uid("club_history"),

            clubId: safeString(
                data.clubId,
                ""
            ),

            joined: safeString(
                data.joined,
                ""
            ),

            left: safeString(
                data.left,
                ""
            ),

            shirtNumber: safeNumber(
                data.shirtNumber,
                S.player.shirtNumber || 9
            ),

            appearances: safeNumber(
                data.appearances,
                0
            ),

            goals: safeNumber(
                data.goals,
                0
            ),

            assists: safeNumber(
                data.assists,
                0
            ),

            trophies: Array.isArray(data.trophies)
                ? data.trophies
                : []
        };
    }

    /* =====================================================
       TRANSFER OFFER
       ===================================================== */

    function createTransferOffer(data = {}) {
        return {
            id: data.id || uid("transfer"),

            clubId: safeString(
                data.clubId,
                ""
            ),

            clubName: safeString(
                data.clubName,
                ""
            ),

            salary: safeNumber(
                data.salary,
                0
            ),

            contractYears: safeNumber(
                data.contractYears,
                3
            ),

            role: safeString(
                data.role,
                "Squad Player"
            ),

            transferFee: safeNumber(
                data.transferFee,
                0
            ),

            status: safeString(
                data.status,
                "pending"
            ),

            date: safeString(
                data.date,
                nowISO()
            )
        };
    }

    /* =====================================================
       TRANSACTION
       ===================================================== */

    function createTransaction(data = {}) {
        return {
            id: data.id || uid("transaction"),

            type: safeString(
                data.type,
                "other"
            ),

            amount: safeNumber(
                data.amount,
                0
            ),

            description: safeString(
                data.description,
                ""
            ),

            date: safeString(
                data.date,
                nowISO()
            ),

            balanceAfter: safeNumber(
                data.balanceAfter,
                S.player.economy.money
            )
        };
    }

    /* =====================================================
       ACHIEVEMENT
       ===================================================== */

    function createAchievement(data = {}) {
        return {
            id: data.id || uid("achievement"),

            name: safeString(
                data.name,
                ""
            ),

            description: safeString(
                data.description,
                ""
            ),

            unlocked: Boolean(
                data.unlocked
            ),

            unlockedAt: data.unlockedAt || null,

            progress: safeNumber(
                data.progress,
                0
            ),

            target: safeNumber(
                data.target,
                1
            )
        };
    }

    /* =====================================================
       NOTIFICATION
       ===================================================== */

    function createNotification(data = {}) {
        return {
            id: data.id || uid("notification"),

            title: safeString(
                data.title,
                "Notification"
            ),

            message: safeString(
                data.message,
                ""
            ),

            type: safeString(
                data.type,
                "info"
            ),

            read: Boolean(
                data.read
            ),

            date: safeString(
                data.date,
                nowISO()
            )
        };
    }

    /* =====================================================
       SEASON HISTORY
       ===================================================== */

    function createSeasonHistory(data = {}) {
        return {
            season: safeNumber(
                data.season,
                DEFAULT_SEASON
            ),

            clubId: safeString(
                data.clubId,
                ""
            ),

            appearances: safeNumber(
                data.appearances,
                0
            ),

            goals: safeNumber(
                data.goals,
                0
            ),

            assists: safeNumber(
                data.assists,
                0
            ),

            trophies: Array.isArray(data.trophies)
                ? data.trophies
                : [],

            finalOvr: safeNumber(
                data.finalOvr,
                S.player.ovr
            )
        };
    }

    /* =====================================================
       VALIDATION
       ===================================================== */

    function validateInitialState(state = S) {
        const errors = [];

        if (!state || typeof state !== "object") {
            errors.push("State tidak valid.");

            return {
                valid: false,
                errors
            };
        }

        if (!state.meta) {
            errors.push("meta missing");
        }

        if (!state.account) {
            errors.push("account missing");
        }

        if (!state.player) {
            errors.push("player missing");
        }

        if (!state.career) {
            errors.push("career missing");
        }

        if (!state.world) {
            errors.push("world missing");
        }

        if (!state.economy) {
            errors.push("economy missing");
        }

        if (!state.social) {
            errors.push("social missing");
        }

        if (!state.admin) {
            errors.push("admin missing");
        }

        if (!state.settings) {
            errors.push("settings missing");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /* =====================================================
       REPAIR STATE
       ===================================================== */

    function repairGameState(state = S) {
        if (!state || typeof state !== "object") {
            return createDefaultGameState();
        }

        /*
         * Top-level repair
         */

        if (!state.meta) {
            state.meta = createDefaultMeta();
        }

        if (!state.account) {
            state.account = {
                email: "",
                name: "",
                created: false
            };
        }

        if (!state.player) {
            state.player = createDefaultPlayer();
        }

        if (!state.career) {
            state.career = createDefaultCareer();
        }

        if (!state.world) {
            state.world = createDefaultWorld();
        }

        if (!state.economy) {
            state.economy = createDefaultEconomy();
        }

        if (!state.social) {
            state.social = createDefaultSocial();
        }

        if (!state.admin) {
            state.admin = createDefaultAdmin();
        }

        if (!state.settings) {
            state.settings = createDefaultSettings();
        }

        /*
         * Player repair
         */

        const defaultPlayer = createDefaultPlayer();

        Object.keys(defaultPlayer).forEach(function (key) {
            if (
                state.player[key] === undefined ||
                state.player[key] === null
            ) {
                state.player[key] = defaultPlayer[key];
            }
        });

        /*
         * Nested player objects
         */

        if (!state.player.stats) {
            state.player.stats = {
                ...defaultPlayer.stats
            };
        }

        if (!state.player.careerStats) {
            state.player.careerStats = {
                ...defaultPlayer.careerStats
            };
        }

        if (!state.player.currentClub) {
            state.player.currentClub = {
                ...defaultPlayer.currentClub
            };
        }

        if (!Array.isArray(state.player.clubs)) {
            state.player.clubs = [];
        }

        if (!state.player.nationalTeam) {
            state.player.nationalTeam = {
                ...defaultPlayer.nationalTeam
            };
        }

        if (!state.player.trophies) {
            state.player.trophies = {
                ...defaultPlayer.trophies
            };
        }

        if (!state.player.economy) {
            state.player.economy = {
                ...defaultPlayer.economy
            };
        }

        if (!state.player.social) {
            state.player.social = {
                ...defaultPlayer.social
            };
        }

        if (!Array.isArray(state.player.achievements)) {
            state.player.achievements = [];
        }

        if (!state.player.preferences) {
            state.player.preferences = {
                ...defaultPlayer.preferences
            };
        }

        /*
         * Career repair
         */

        const defaultCareer = createDefaultCareer();

        Object.keys(defaultCareer).forEach(function (key) {
            if (
                state.career[key] === undefined ||
                state.career[key] === null
            ) {
                state.career[key] = defaultCareer[key];
            }
        });

        if (!Array.isArray(state.career.transferOffers)) {
            state.career.transferOffers = [];
        }

        if (!Array.isArray(state.career.seasonHistory)) {
            state.career.seasonHistory = [];
        }

        if (!Array.isArray(state.career.trophiesThisSeason)) {
            state.career.trophiesThisSeason = [];
        }

        /*
         * World repair
         */

        const defaultWorld = createDefaultWorld();

        Object.keys(defaultWorld).forEach(function (key) {
            if (
                state.world[key] === undefined ||
                state.world[key] === null
            ) {
                state.world[key] = defaultWorld[key];
            }
        });

        [
            "clubs",
            "countries",
            "competitions",
            "fixtures",
            "results",
            "standings",
            "transfers",
            "worldEvents",
            "schedule"
        ].forEach(function (key) {
            if (!Array.isArray(state.world[key])) {
                state.world[key] = [];
            }
        });

        /*
         * Economy repair
         */

        const defaultEconomy = createDefaultEconomy();

        Object.keys(defaultEconomy).forEach(function (key) {
            if (
                state.economy[key] === undefined ||
                state.economy[key] === null
            ) {
                state.economy[key] = defaultEconomy[key];
            }
        });

        [
            "sponsorships",
            "businesses",
            "transactions",
            "incomeHistory",
            "expenseHistory"
        ].forEach(function (key) {
            if (!Array.isArray(state.economy[key])) {
                state.economy[key] = [];
            }
        });

        /*
         * Social repair
         */

        const defaultSocial = createDefaultSocial();

        Object.keys(defaultSocial).forEach(function (key) {
            if (
                state.social[key] === undefined ||
                state.social[key] === null
            ) {
                state.social[key] = defaultSocial[key];
            }
        });

        [
            "posts",
            "notifications",
            "mediaAppearances",
            "endorsements",
            "socialEvents"
        ].forEach(function (key) {
            if (!Array.isArray(state.social[key])) {
                state.social[key] = [];
            }
        });

        /*
         * Admin repair
         */

        const defaultAdmin = createDefaultAdmin();

        Object.keys(defaultAdmin).forEach(function (key) {
            if (
                state.admin[key] === undefined ||
                state.admin[key] === null
            ) {
                state.admin[key] = defaultAdmin[key];
            }
        });

        if (!Array.isArray(state.admin.logs)) {
            state.admin.logs = [];
        }

        /*
         * Settings repair
         */

        const defaultSettings = createDefaultSettings();

        Object.keys(defaultSettings).forEach(function (key) {
            if (
                state.settings[key] === undefined ||
                state.settings[key] === null
            ) {
                state.settings[key] = defaultSettings[key];
            }
        });

        /*
         * Normalize important values
         */

        state.player.ovr = clamp(
            state.player.ovr,
            1,
            99
        );

        state.player.potential = clamp(
            state.player.potential,
            1,
            99
        );

        state.player.form = clamp(
            state.player.form,
            0,
            100
        );

        state.player.morale = clamp(
            state.player.morale,
            0,
            100
        );

        state.player.fitness = clamp(
            state.player.fitness,
            0,
            100
        );

        state.player.energy = clamp(
            state.player.energy,
            0,
            100
        );

        state.player.health = clamp(
            state.player.health,
            0,
            100
        );

        /*
         * OVR override
         */

        if (
            state.admin.ovrOverride &&
            state.admin.forcedOvr !== null
        ) {
            state.admin.forcedOvr = clamp(
                state.admin.forcedOvr,
                1,
                99
            );
        }

        state.meta.updatedAt = nowISO();

        return state;
    }

    /* =====================================================
       DEBUG
       ===================================================== */

    function debugGameState() {
        const validation =
            validateInitialState(S);

        console.group(
            "RV SPORTS: FC CUP 26 STATE"
        );

        console.log(
            "Version:",
            GAME_VERSION
        );

        console.log(
            "Valid:",
            validation.valid
        );

        if (validation.errors.length) {
            console.warn(
                "Errors:",
                validation.errors
            );
        }

        console.log(
            "State:",
            S
        );

        console.log(
            "window.S:",
            window.S
        );

        console.log(
            "Same reference:",
            window.S === S
        );

        console.groupEnd();

        return validation;
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RVSportsState = {
        GAME_NAME,
        GAME_VERSION,

        getState: function () {
            return S;
        },

        createDefaultGameState,

        createDefaultPlayer,
        createDefaultCareer,
        createDefaultWorld,
        createDefaultEconomy,
        createDefaultSocial,
        createDefaultAdmin,
        createDefaultSettings,
        createDefaultMeta,

        touchGameState,
        markSaved,
        markLoaded,

        resetGameState,
        cloneGameState,

        addCreatorLog,

        createTrophy,
        createClubHistoryEntry,
        createTransferOffer,
        createTransaction,
        createAchievement,
        createNotification,
        createSeasonHistory,

        validateInitialState,
        repairGameState,
        debugGameState,

        uid,
        clamp,
        safeNumber,
        safeString
    };

    /* =====================================================
       LEGACY / GLOBAL COMPATIBILITY
       ===================================================== */

    /*
     * app.js versi sekarang membutuhkan window.touchState().
     */

    window.touchState = touchGameState;
    window.touchGameState = touchGameState;

    window.markSaved = markSaved;
    window.markLoaded = markLoaded;

    window.resetGameState = resetGameState;
    window.cloneGameState = cloneGameState;

    window.addCreatorLog = addCreatorLog;

    window.createTrophy = createTrophy;
    window.createClubHistoryEntry =
        createClubHistoryEntry;

    window.createTransferOffer =
        createTransferOffer;

    window.createTransaction =
        createTransaction;

    window.createAchievement =
        createAchievement;

    window.createNotification =
        createNotification;

    window.createSeasonHistory =
        createSeasonHistory;

    window.validateInitialState =
        validateInitialState;

    window.repairGameState =
        repairGameState;

    window.debugGameState =
        debugGameState;

    /* =====================================================
       INITIAL VALIDATION
       ===================================================== */

    repairGameState(S);

    const initialValidation =
        validateInitialState(S);

    if (!initialValidation.valid) {
        console.error(
            "[STATE] Initial state invalid:",
            initialValidation.errors
        );
    }

    console.log(
        "RV SPORTS: FC CUP 26 State System loaded."
    );

    console.log(
        "[STATE] Version:",
        GAME_VERSION
    );

    console.log(
        "[STATE] Player ID:",
        S.player.id
    );

    console.log(
        "[STATE] window.S available:",
        window.S === S
    );

    console.log(
        "[STATE] Global API available:",
        Boolean(window.RVSportsState)
    );

})();
