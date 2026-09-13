/*
==========================================================
RV SPORTS: FC CUP 26
MATCH SYSTEM
Version: 1.0.0
==========================================================
*/

(function () {
    "use strict";

    const SYSTEM_NAME = "RV SPORTS: FC CUP 26 Match System";
    const VERSION = "1.0.0";

    let initialized = false;

    function log() {
        console.log("[MATCH]", ...arguments);
    }

    function warn() {
        console.warn("[MATCH]", ...arguments);
    }

    function getState() {
        return window.S || null;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomInt(min, max) {
        return Math.floor(random(min, max + 1));
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

    function getPlayer() {
        const state = getState();

        if (!state || !state.player) {
            return null;
        }

        return state.player;
    }

    function getPlayerOVR() {
        const player = getPlayer();

        if (!player) {
            return 50;
        }

        const possibleValues = [
            player.ovr,
            player.overall,
            player.rating,
            player.stats && player.stats.ovr
        ];

        for (let i = 0; i < possibleValues.length; i++) {
            const value = Number(possibleValues[i]);

            if (Number.isFinite(value) && value > 0) {
                return clamp(Math.round(value), 1, 99);
            }
        }

        if (window.RVSportsPlayerCard &&
            typeof window.RVSportsPlayerCard.getOVR === "function") {
            return window.RVSportsPlayerCard.getOVR(player);
        }

        return 50;
    }

    function getPosition() {
        const player = getPlayer();

        if (!player) {
            return "ST";
        }

        return String(
            player.position ||
            player.pos ||
            "ST"
        ).toUpperCase();
    }

    function ensureMatchState() {
        const state = getState();

        if (!state) {
            return null;
        }

        if (!state.match) {
            state.match = {
                active: false,
                current: null,
                history: [],
                totals: {
                    appearances: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goals: 0,
                    assists: 0,
                    ratings: []
                }
            };
        }

        if (!Array.isArray(state.match.history)) {
            state.match.history = [];
        }

        if (!state.match.totals) {
            state.match.totals = {
                appearances: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goals: 0,
                assists: 0,
                ratings: []
            };
        }

        return state.match;
    }

    function createMatch(options) {
        options = options || {};

        const player = getPlayer();

        const homeTeam = options.homeTeam || "Home FC";
        const awayTeam = options.awayTeam || "Away FC";

        const isHome = options.isHome !== false;

        const match = {
            id: uid("match"),

            status: "scheduled",

            competition:
                options.competition ||
                "Friendly Match",

            season:
                options.season ||
                (getState() && getState().meta
                    ? getState().meta.season
                    : 2026),

            date:
                options.date ||
                new Date().toISOString().slice(0, 10),

            homeTeam: homeTeam,
            awayTeam: awayTeam,

            playerTeam: isHome
                ? homeTeam
                : awayTeam,

            opponent: isHome
                ? awayTeam
                : homeTeam,

            isHome: isHome,

            minute: 0,

            score: {
                home: 0,
                away: 0
            },

            player: {
                id: player ? player.id : null,
                name: player ? player.name : "Player",
                position: getPosition(),
                rating: 6.0,
                goals: 0,
                assists: 0,
                minutes: 0,
                started: true,
                substituted: false
            },

            events: [],

            result: null,

            reward: {
                money: 0,
                popularity: 0,
                followers: 0
            }
        };

        return match;
    }

    function addEvent(match, type, data) {
        if (!match) {
            return;
        }

        match.events.push({
            id: uid("event"),
            minute: match.minute,
            type: type,
            data: data || {}
        });
    }

    function simulateMinute(match) {
        if (!match || match.status !== "live") {
            return false;
        }

        match.minute++;

        /*
         * Base chance untuk terjadi gol.
         * Sengaja dibuat kecil supaya pertandingan
         * terasa seperti pertandingan, bukan mesin pinball.
         */
        const baseChance = 0.018;

        const playerOVR = getPlayerOVR();

        const playerFactor =
            1 + ((playerOVR - 50) / 500);

        const chance = baseChance * playerFactor;

        if (Math.random() < chance) {
            const playerScores =
                Math.random() < 0.55;

            if (playerScores) {
                match.score[match.isHome ? "home" : "away"]++;

                match.player.goals++;

                match.player.rating += 0.45;

                addEvent(match, "goal", {
                    player: true,
                    scorer: match.player.name
                });

                log(
                    "Player scored at minute",
                    match.minute
                );
            } else {
                const side =
                    match.isHome
                        ? "away"
                        : "home";

                match.score[side]++;

                match.player.rating -= 0.05;

                addEvent(match, "goal", {
                    player: false,
                    team:
                        side === "home"
                            ? match.homeTeam
                            : match.awayTeam
                });
            }
        }

        /*
         * Peluang assist.
         */
        if (
            match.player.goals === 0 &&
            Math.random() < 0.004
        ) {
            match.player.assists++;

            match.player.rating += 0.25;

            addEvent(match, "assist", {
                player: match.player.name
            });
        }

        /*
         * Rating perlahan berubah selama pertandingan.
         */
        if (Math.random() < 0.08) {
            match.player.rating += random(-0.04, 0.06);
        }

        match.player.rating =
            clamp(
                Number(match.player.rating.toFixed(2)),
                4.0,
                10.0
            );

        return true;
    }

    function startMatch(options) {
        const matchState = ensureMatchState();

        if (!matchState) {
            warn("State tidak tersedia.");
            return null;
        }

        if (matchState.active) {
            warn("Sudah ada pertandingan aktif.");
            return matchState.current;
        }

        const match = createMatch(options);

        match.status = "live";

        matchState.active = true;
        matchState.current = match;

        addEvent(match, "kickoff", {
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam
        });

        log(
            "Match started:",
            match.homeTeam,
            "vs",
            match.awayTeam
        );

        return match;
    }

    function finishMatch() {
        const matchState = ensureMatchState();

        if (!matchState || !matchState.current) {
            warn("Tidak ada pertandingan aktif.");
            return null;
        }

        const match = matchState.current;

        if (match.status !== "live") {
            return match;
        }

        /*
         * Pastikan pertandingan selalu selesai di menit 90.
         */
        while (match.minute < 90) {
            simulateMinute(match);
        }

        match.minute = 90;
        match.player.minutes = 90;

        const playerScore =
            match.isHome
                ? match.score.home
                : match.score.away;

        const opponentScore =
            match.isHome
                ? match.score.away
                : match.score.home;

        if (playerScore > opponentScore) {
            match.result = "win";
        } else if (playerScore < opponentScore) {
            match.result = "loss";
        } else {
            match.result = "draw";
        }

        /*
         * Bonus rating berdasarkan hasil.
         */
        if (match.result === "win") {
            match.player.rating += 0.35;
        } else if (match.result === "loss") {
            match.player.rating -= 0.15;
        } else {
            match.player.rating += 0.05;
        }

        /*
         * Bonus kontribusi gol.
         */
        match.player.rating +=
            match.player.goals * 0.30;

        match.player.rating +=
            match.player.assists * 0.20;

        match.player.rating =
            clamp(
                Number(match.player.rating.toFixed(2)),
                4.0,
                10.0
            );

        match.reward = calculateReward(match);

        match.status = "finished";

        addEvent(match, "fulltime", {
            result: match.result,
            homeScore: match.score.home,
            awayScore: match.score.away
        });

        updateCareerTotals(match);

        matchState.history.unshift(
            JSON.parse(JSON.stringify(match))
        );

        if (matchState.history.length > 100) {
            matchState.history =
                matchState.history.slice(0, 100);
        }

        matchState.active = false;
        matchState.current = null;

        log(
            "Match finished:",
            match.result,
            match.score
        );

        return match;
    }

    function calculateReward(match) {
        if (!match) {
            return {
                money: 0,
                popularity: 0,
                followers: 0
            };
        }

        let money = 500;
        let popularity = 1;
        let followers = 2;

        if (match.result === "win") {
            money += 1500;
            popularity += 4;
            followers += 10;
        } else if (match.result === "draw") {
            money += 750;
            popularity += 2;
            followers += 5;
        }

        money += match.player.goals * 1000;
        money += match.player.assists * 500;

        popularity += match.player.goals * 3;
        popularity += match.player.assists * 2;

        followers += match.player.goals * 20;
        followers += match.player.assists * 10;

        return {
            money: money,
            popularity: popularity,
            followers: followers
        };
    }

    function updateCareerTotals(match) {
        const state = getState();

        if (!state || !match) {
            return;
        }

        const totals =
            ensureMatchState().totals;

        totals.appearances++;

        if (match.result === "win") {
            totals.wins++;
        } else if (match.result === "draw") {
            totals.draws++;
        } else if (match.result === "loss") {
            totals.losses++;
        }

        totals.goals += match.player.goals;
        totals.assists += match.player.assists;

        totals.ratings.push(match.player.rating);

        if (totals.ratings.length > 100) {
            totals.ratings =
                totals.ratings.slice(-100);
        }

        /*
         * Update career jika struktur career tersedia.
         */
        if (!state.career) {
            return;
        }

        state.career.matches =
            Number(state.career.matches || 0) + 1;

        state.career.goals =
            Number(state.career.goals || 0) +
            match.player.goals;

        state.career.assists =
            Number(state.career.assists || 0) +
            match.player.assists;

        if (match.result === "win") {
            state.career.wins =
                Number(state.career.wins || 0) + 1;
        }

        if (match.result === "draw") {
            state.career.draws =
                Number(state.career.draws || 0) + 1;
        }

        if (match.result === "loss") {
            state.career.losses =
                Number(state.career.losses || 0) + 1;
        }
    }

    function getCurrentMatch() {
        const matchState = ensureMatchState();

        return matchState
            ? matchState.current
            : null;
    }

    function getHistory(limit) {
        const matchState = ensureMatchState();

        if (!matchState) {
            return [];
        }

        const amount =
            Number.isFinite(Number(limit))
                ? Math.max(1, Number(limit))
                : 10;

        return matchState.history.slice(0, amount);
    }

    function getTotals() {
        const matchState = ensureMatchState();

        if (!matchState) {
            return null;
        }

        return JSON.parse(
            JSON.stringify(matchState.totals)
        );
    }

    function initialize() {
        if (initialized) {
            return true;
        }

        ensureMatchState();

        initialized = true;

        log(SYSTEM_NAME + " loaded.");
        log("Version:", VERSION);
        log("API available:", true);

        return true;
    }

    window.RVSportsMatch = {
        initialize: initialize,

        createMatch: createMatch,
        startMatch: startMatch,
        simulateMinute: simulateMinute,
        finishMatch: finishMatch,

        getCurrentMatch: getCurrentMatch,
        getHistory: getHistory,
        getTotals: getTotals,

        calculateReward: calculateReward,

        version: VERSION
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    } else {
        initialize();
    }

})();
