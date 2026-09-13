/* =========================================================
   RV SPORTS: FC CUP 26
   COUNTRIES SYSTEM
   Version: 2.1.0
   ========================================================= */

(function () {
    "use strict";

    const VERSION = "2.1.0";

    function getState() {
        return window.S || null;
    }

    function log() {
        console.log("[COUNTRIES]", ...arguments);
    }

    function warn() {
        console.warn("[COUNTRIES]", ...arguments);
    }

    function uid(prefix) {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).slice(2, 8)
        );
    }

    function touchState() {
        if (typeof window.touchGameState === "function") {
            window.touchGameState();
        } else if (typeof window.touchState === "function") {
            window.touchState();
        }
    }

    /* =========================================================
       COUNTRY CONFIG
       ========================================================= */

    const COUNTRY_CONFIG = {
        england: {
            id: "country_england",
            code: "ENG",
            name: "England",
            flag: "🏴",
            continent: "Europe",
            tier: "elite",
            fifaRank: 4,
            reputation: 92
        },

        france: {
            id: "country_france",
            code: "FRA",
            name: "France",
            flag: "🇫🇷",
            continent: "Europe",
            tier: "elite",
            fifaRank: 2,
            reputation: 95
        },

        spain: {
            id: "country_spain",
            code: "ESP",
            name: "Spain",
            flag: "🇪🇸",
            continent: "Europe",
            tier: "elite",
            fifaRank: 1,
            reputation: 94
        },

        germany: {
            id: "country_germany",
            code: "GER",
            name: "Germany",
            flag: "🇩🇪",
            continent: "Europe",
            tier: "elite",
            fifaRank: 10,
            reputation: 90
        },

        italy: {
            id: "country_italy",
            code: "ITA",
            name: "Italy",
            flag: "🇮🇹",
            continent: "Europe",
            tier: "elite",
            fifaRank: 13,
            reputation: 88
        },

        brazil: {
            id: "country_brazil",
            code: "BRA",
            name: "Brazil",
            flag: "🇧🇷",
            continent: "South America",
            tier: "elite",
            fifaRank: 5,
            reputation: 96
        },

        argentina: {
            id: "country_argentina",
            code: "ARG",
            name: "Argentina",
            flag: "🇦🇷",
            continent: "South America",
            tier: "elite",
            fifaRank: 3,
            reputation: 96
        },

        portugal: {
            id: "country_portugal",
            code: "POR",
            name: "Portugal",
            flag: "🇵🇹",
            continent: "Europe",
            tier: "high",
            fifaRank: 6,
            reputation: 91
        },

        netherlands: {
            id: "country_netherlands",
            code: "NED",
            name: "Netherlands",
            flag: "🇳🇱",
            continent: "Europe",
            tier: "high",
            fifaRank: 7,
            reputation: 89
        },

        indonesia: {
            id: "country_indonesia",
            code: "IDN",
            name: "Indonesia",
            flag: "🇮🇩",
            continent: "Asia",
            tier: "developing",
            fifaRank: 130,
            reputation: 70
        }
    };

    const COUNTRY_TIERS = {
        elite: {
            label: "Elite",
            reputation: 90
        },

        high: {
            label: "High",
            reputation: 80
        },

        developing: {
            label: "Developing",
            reputation: 65
        }
    };

    /* =========================================================
       COUNTRY FACTORY
       ========================================================= */

    function createCountry(data) {
        data = data || {};

        return {
            id: data.id || uid("country"),

            code: String(data.code || "UNK").toUpperCase(),

            name: data.name || "Unknown Country",

            flag: data.flag || "🌐",

            continent: data.continent || "Unknown",

            tier: data.tier || "developing",

            fifaRank:
                Number.isFinite(Number(data.fifaRank))
                    ? Number(data.fifaRank)
                    : 999,

            reputation:
                Number.isFinite(Number(data.reputation))
                    ? Number(data.reputation)
                    : 50,

            nationalTeamId:
                data.nationalTeamId || null,

            clubs:
                Array.isArray(data.clubs)
                    ? data.clubs
                    : [],

            trophies:
                Array.isArray(data.trophies)
                    ? data.trophies
                    : [],

            playerCount:
                Number.isFinite(Number(data.playerCount))
                    ? Number(data.playerCount)
                    : 0,

            metadata: {
                createdAt:
                    data.metadata?.createdAt ||
                    new Date().toISOString(),

                updatedAt:
                    data.metadata?.updatedAt ||
                    new Date().toISOString()
            }
        };
    }

    /* =========================================================
       DEFAULT COUNTRIES
       ========================================================= */

    function createDefaultCountries() {
        return Object.keys(COUNTRY_CONFIG).map(function (key) {
            return createCountry(COUNTRY_CONFIG[key]);
        });
    }

    /* =========================================================
       STATE ACCESS
       ========================================================= */

    function ensureWorld() {
        const state = getState();

        if (!state) {
            warn("Global state S belum tersedia.");
            return false;
        }

        if (!state.world) {
            state.world = {};
        }

        if (!Array.isArray(state.world.countries)) {
            state.world.countries = [];
        }

        return true;
    }

    function getCountries() {
        if (!ensureWorld()) {
            return [];
        }

        return getState().world.countries;
    }

    /* =========================================================
       INITIALIZATION
       ========================================================= */

    function initializeCountrySystem() {
        if (!ensureWorld()) {
            return false;
        }

        const state = getState();

        if (state.world.countries.length === 0) {
            state.world.countries = createDefaultCountries();

            if (!state.world.activeCountry) {
                state.world.activeCountry = "IDN";
            }

            touchState();

            log(
                "Default country database created:",
                state.world.countries.length
            );
        }

        repairCountryData();

        return true;
    }

    /* =========================================================
       REPAIR
       ========================================================= */

    function repairCountryData() {
        if (!ensureWorld()) {
            return false;
        }

        const countries = getCountries();

        countries.forEach(function (country) {
            if (!country.id) {
                country.id = uid("country");
            }

            if (!country.code) {
                country.code = "UNK";
            }

            country.code = String(country.code).toUpperCase();

            if (!country.name) {
                country.name = "Unknown Country";
            }

            if (!country.flag) {
                country.flag = "🌐";
            }

            if (!country.continent) {
                country.continent = "Unknown";
            }

            if (!country.tier) {
                country.tier = "developing";
            }

            if (!Array.isArray(country.clubs)) {
                country.clubs = [];
            }

            if (!Array.isArray(country.trophies)) {
                country.trophies = [];
            }

            if (!Number.isFinite(Number(country.fifaRank))) {
                country.fifaRank = 999;
            }

            if (!Number.isFinite(Number(country.reputation))) {
                country.reputation = 50;
            }

            if (!Number.isFinite(Number(country.playerCount))) {
                country.playerCount = 0;
            }

            if (!country.metadata) {
                country.metadata = {};
            }

            if (!country.metadata.createdAt) {
                country.metadata.createdAt =
                    new Date().toISOString();
            }

            country.metadata.updatedAt =
                new Date().toISOString();
        });

        return true;
    }

    /* =========================================================
       FIND
       ========================================================= */

    function getCountryById(id) {
        if (!id) return null;

        return (
            getCountries().find(function (country) {
                return country.id === id;
            }) || null
        );
    }

    function getCountryByCode(code) {
        if (!code) return null;

        const normalized = String(code).toUpperCase();

        return (
            getCountries().find(function (country) {
                return country.code === normalized;
            }) || null
        );
    }

    function getCountryByName(name) {
        if (!name) return null;

        const normalized = String(name)
            .trim()
            .toLowerCase();

        return (
            getCountries().find(function (country) {
                return (
                    String(country.name)
                        .trim()
                        .toLowerCase() === normalized
                );
            }) || null
        );
    }

    function getCountry(value) {
        if (!value) return null;

        return (
            getCountryById(value) ||
            getCountryByCode(value) ||
            getCountryByName(value)
        );
    }

    /* =========================================================
       SEARCH
       ========================================================= */

    function searchCountries(query) {
        const countries = getCountries();

        if (!query) {
            return countries.slice();
        }

        const q = String(query)
            .trim()
            .toLowerCase();

        return countries.filter(function (country) {
            return (
                String(country.name)
                    .toLowerCase()
                    .includes(q) ||

                String(country.code)
                    .toLowerCase()
                    .includes(q) ||

                String(country.continent)
                    .toLowerCase()
                    .includes(q)
            );
        });
    }

    /* =========================================================
       CONTINENT
       ========================================================= */

    function getCountriesByContinent(continent) {
        if (!continent) return [];

        return getCountries().filter(function (country) {
            return (
                String(country.continent).toLowerCase() ===
                String(continent).toLowerCase()
            );
        });
    }

    /* =========================================================
       TIER
       ========================================================= */

    function getCountriesByTier(tier) {
        if (!tier) return [];

        return getCountries().filter(function (country) {
            return country.tier === tier;
        });
    }

    function getTierInfo(tier) {
        return COUNTRY_TIERS[tier] || COUNTRY_TIERS.developing;
    }

    /* =========================================================
       FIFA RANKING
       ========================================================= */

    function getFIFARanking() {
        return getCountries()
            .slice()
            .sort(function (a, b) {
                return (
                    Number(a.fifaRank) -
                    Number(b.fifaRank)
                );
            });
    }

    function updateFIFARank(codeOrId, rank) {
        const country = getCountry(codeOrId);

        if (!country) {
            warn("Country tidak ditemukan:", codeOrId);
            return null;
        }

        country.fifaRank = Math.max(
            1,
            Number(rank) || 999
        );

        country.metadata.updatedAt =
            new Date().toISOString();

        touchState();

        return country;
    }

    /* =========================================================
       REPUTATION
       ========================================================= */

    function updateReputation(codeOrId, reputation) {
        const country = getCountry(codeOrId);

        if (!country) {
            warn("Country tidak ditemukan:", codeOrId);
            return null;
        }

        country.reputation = Math.max(
            0,
            Math.min(100, Number(reputation) || 0)
        );

        country.metadata.updatedAt =
            new Date().toISOString();

        touchState();

        return country;
    }

    /* =========================================================
       CLUB RELATION
       ========================================================= */

    function addClubToCountry(codeOrId, clubId) {
        const country = getCountry(codeOrId);

        if (!country || !clubId) {
            return false;
        }

        if (!country.clubs.includes(clubId)) {
            country.clubs.push(clubId);
            country.metadata.updatedAt =
                new Date().toISOString();

            touchState();
        }

        return true;
    }

    function removeClubFromCountry(codeOrId, clubId) {
        const country = getCountry(codeOrId);

        if (!country || !clubId) {
            return false;
        }

        country.clubs = country.clubs.filter(function (id) {
            return id !== clubId;
        });

        country.metadata.updatedAt =
            new Date().toISOString();

        touchState();

        return true;
    }

    /* =========================================================
       PLAYER COUNT
       ========================================================= */

    function updatePlayerCount(codeOrId, amount) {
        const country = getCountry(codeOrId);

        if (!country) {
            return false;
        }

        country.playerCount = Math.max(
            0,
            Number(amount) || 0
        );

        country.metadata.updatedAt =
            new Date().toISOString();

        touchState();

        return true;
    }

    /* =========================================================
       NATIONAL TEAM
       ========================================================= */

    function setNationalTeam(codeOrId, teamId) {
        const country = getCountry(codeOrId);

        if (!country) {
            return null;
        }

        country.nationalTeamId = teamId || null;

        country.metadata.updatedAt =
            new Date().toISOString();

        touchState();

        return country;
    }

    function getNationalTeam(codeOrId) {
        const country = getCountry(codeOrId);

        if (!country) {
            return null;
        }

        return country.nationalTeamId || null;
    }

    /* =========================================================
       TROPHIES
       ========================================================= */

    function addCountryTrophy(codeOrId, trophy) {
        const country = getCountry(codeOrId);

        if (!country || !trophy) {
            return false;
        }

        country.trophies.push(trophy);

        country.metadata.updatedAt =
            new Date().toISOString();

        touchState();

        return true;
    }

    function getCountryTrophies(codeOrId) {
        const country = getCountry(codeOrId);

        if (!country) {
            return [];
        }

        return country.trophies;
    }

    /* =========================================================
       ACTIVE COUNTRY
       ========================================================= */

    function setActiveCountry(codeOrId) {
        if (!ensureWorld()) {
            return false;
        }

        const country = getCountry(codeOrId);

        if (!country) {
            warn("Tidak bisa set active country:", codeOrId);
            return false;
        }

        getState().world.activeCountry = country.code;

        touchState();

        return true;
    }

    function getActiveCountry() {
        if (!ensureWorld()) {
            return null;
        }

        const active =
            getState().world.activeCountry;

        return getCountry(active);
    }

    /* =========================================================
       CREATOR FUNCTIONS
       ========================================================= */

    function addCountry(data) {
        if (!ensureWorld()) {
            return null;
        }

        const country = createCountry(data);

        const duplicate = getCountries().some(
            function (existing) {
                return (
                    existing.code === country.code ||
                    existing.name.toLowerCase() ===
                        country.name.toLowerCase()
                );
            }
        );

        if (duplicate) {
            warn(
                "Country duplicate:",
                country.name,
                country.code
            );

            return null;
        }

        getCountries().push(country);

        touchState();

        log("Country added:", country.name);

        return country;
    }

    function updateCountry(codeOrId, updates) {
        const country = getCountry(codeOrId);

        if (!country || !updates) {
            return null;
        }

        Object.keys(updates).forEach(function (key) {
            if (key === "id") return;

            country[key] = updates[key];
        });

        country.metadata =
            country.metadata || {};

        country.metadata.updatedAt =
            new Date().toISOString();

        touchState();

        return country;
    }

    function deleteCountry(codeOrId) {
        if (!ensureWorld()) {
            return false;
        }

        const countries = getCountries();

        const index = countries.findIndex(
            function (country) {
                return (
                    country.id === codeOrId ||
                    country.code ===
                        String(codeOrId).toUpperCase()
                );
            }
        );

        if (index === -1) {
            return false;
        }

        const removed = countries.splice(index, 1)[0];

        if (
            getState().world.activeCountry ===
            removed.code
        ) {
            getState().world.activeCountry = null;
        }

        touchState();

        log("Country deleted:", removed.name);

        return true;
    }

    /* =========================================================
       VALIDATION
       ========================================================= */

    function validateCountries() {
        const countries = getCountries();

        const ids = new Set();
        const codes = new Set();

        const errors = [];

        countries.forEach(function (country) {
            if (!country.id) {
                errors.push("Missing country ID");
            }

            if (!country.code) {
                errors.push(
                    "Missing country code: " +
                    country.name
                );
            }

            if (ids.has(country.id)) {
                errors.push(
                    "Duplicate country ID: " +
                    country.id
                );
            }

            if (codes.has(country.code)) {
                errors.push(
                    "Duplicate country code: " +
                    country.code
                );
            }

            ids.add(country.id);
            codes.add(country.code);
        });

        return {
            valid: errors.length === 0,
            count: countries.length,
            errors: errors
        };
    }

    /* =========================================================
       DEBUG
       ========================================================= */

    function debug() {
        const countries = getCountries();

        console.table(
            countries.map(function (country) {
                return {
                    ID: country.id,
                    Code: country.code,
                    Country: country.name,
                    Flag: country.flag,
                    Continent: country.continent,
                    Tier: country.tier,
                    FIFA: country.fifaRank,
                    Reputation: country.reputation
                };
            })
        );

        return countries;
    }

    /* =========================================================
       PUBLIC API
       ========================================================= */

    window.RVCountries = {
        VERSION: VERSION,

        COUNTRY_CONFIG: COUNTRY_CONFIG,
        COUNTRY_TIERS: COUNTRY_TIERS,

        createCountry:
            createCountry,

        createDefaultCountries:
            createDefaultCountries,

        initialize:
            initializeCountrySystem,

        repair:
            repairCountryData,

        getAll:
            getCountries,

        getById:
            getCountryById,

        getByCode:
            getCountryByCode,

        getByName:
            getCountryByName,

        get:
            getCountry,

        search:
            searchCountries,

        byContinent:
            getCountriesByContinent,

        byTier:
            getCountriesByTier,

        getTierInfo:
            getTierInfo,

        fifaRanking:
            getFIFARanking,

        updateFIFARank:
            updateFIFARank,

        updateReputation:
            updateReputation,

        addClub:
            addClubToCountry,

        removeClub:
            removeClubFromCountry,

        updatePlayerCount:
            updatePlayerCount,

        setNationalTeam:
            setNationalTeam,

        getNationalTeam:
            getNationalTeam,

        addTrophy:
            addCountryTrophy,

        getTrophies:
            getCountryTrophies,

        setActive:
            setActiveCountry,

        getActive:
            getActiveCountry,

        add:
            addCountry,

        update:
            updateCountry,

        remove:
            deleteCountry,

        validate:
            validateCountries,

        debug:
            debug
    };

    /* =========================================================
       INITIALIZE
       ========================================================= */

    if (getState()) {
        initializeCountrySystem();
    } else {
        window.addEventListener(
            "load",
            function () {
                initializeCountrySystem();
            },
            { once: true }
        );
    }

    log(
        "RV SPORTS: FC CUP 26 Country System loaded."
    );

    log(
        "[COUNTRIES] Version:",
        VERSION
    );

    log(
        "[COUNTRIES] Available:",
        getCountries().length,
        "countries"
    );
})();
