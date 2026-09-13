/* =========================================================
   RV SPORTS: FC CUP 26
   SOCIAL SYSTEM
   Version: 1.0.0
   ========================================================= */

(function () {
    "use strict";

    const SYSTEM_NAME = "RV SPORTS: FC CUP 26 Social System";
    const VERSION = "1.0.0";

    function log() {
        console.log("[SOCIAL]", ...arguments);
    }

    function warn() {
        console.warn("[SOCIAL]", ...arguments);
    }

    function ensureState() {
        if (!window.S) {
            warn("Game state tidak ditemukan.");
            return false;
        }

        if (!S.player) {
            S.player = {};
        }

        if (!S.player.social) {
            S.player.social = {};
        }

        if (!Array.isArray(S.player.social.posts)) {
            S.player.social.posts = [];
        }

        if (!Array.isArray(S.player.social.events)) {
            S.player.social.events = [];
        }

        if (typeof S.player.social.followers !== "number") {
            S.player.social.followers = 0;
        }

        if (typeof S.player.social.following !== "number") {
            S.player.social.following = 0;
        }

        if (typeof S.player.social.likes !== "number") {
            S.player.social.likes = 0;
        }

        if (typeof S.player.social.comments !== "number") {
            S.player.social.comments = 0;
        }

        if (typeof S.player.social.reputation !== "number") {
            S.player.social.reputation = 0;
        }

        return true;
    }

    function getPlayer() {
        if (!ensureState()) {
            return null;
        }

        return S.player;
    }

    function getSocial() {
        if (!ensureState()) {
            return null;
        }

        return S.player.social;
    }

    function saveState() {
        try {
            if (typeof window.touchGameState === "function") {
                window.touchGameState();
            }

            if (
                window.RVSportsSave &&
                typeof window.RVSportsSave.save === "function"
            ) {
                window.RVSportsSave.save();
            } else if (
                window.RVSportsSave &&
                typeof window.RVSportsSave.saveGame === "function"
            ) {
                window.RVSportsSave.saveGame();
            }
        } catch (error) {
            warn("Gagal menyimpan state:", error);
        }
    }

    function addFollowers(amount) {
        const social = getSocial();

        if (!social) {
            return 0;
        }

        amount = Number(amount) || 0;

        social.followers = Math.max(
            0,
            Math.floor(social.followers + amount)
        );

        saveState();

        return social.followers;
    }

    function removeFollowers(amount) {
        amount = Number(amount) || 0;

        return addFollowers(-Math.abs(amount));
    }

    function addLikes(amount) {
        const social = getSocial();

        if (!social) {
            return 0;
        }

        amount = Number(amount) || 0;

        social.likes = Math.max(
            0,
            Math.floor(social.likes + amount)
        );

        saveState();

        return social.likes;
    }

    function addComments(amount) {
        const social = getSocial();

        if (!social) {
            return 0;
        }

        amount = Number(amount) || 0;

        social.comments = Math.max(
            0,
            Math.floor(social.comments + amount)
        );

        saveState();

        return social.comments;
    }

    function changeReputation(amount) {
        const social = getSocial();

        if (!social) {
            return 0;
        }

        amount = Number(amount) || 0;

        social.reputation = Math.max(
            0,
            Math.min(100, social.reputation + amount)
        );

        saveState();

        return social.reputation;
    }

    function createPost(data) {
        if (!ensureState()) {
            return null;
        }

        data = data || {};

        const player = getPlayer();

        const post = {
            id:
                "post_" +
                Date.now().toString(36) +
                "_" +
                Math.random().toString(36).slice(2, 8),

            text: String(data.text || "").trim(),

            type: String(data.type || "general"),

            date: new Date().toISOString(),

            likes: Math.max(0, Number(data.likes) || 0),

            comments: Math.max(0, Number(data.comments) || 0),

            followersGained: Math.max(
                0,
                Number(data.followersGained) || 0
            ),

            author: player && player.name
                ? player.name
                : "Player"
        };

        if (!post.text) {
            warn("Post tidak dibuat karena text kosong.");
            return null;
        }

        S.player.social.posts.unshift(post);

        if (S.player.social.posts.length > 50) {
            S.player.social.posts =
                S.player.social.posts.slice(0, 50);
        }

        if (post.likes > 0) {
            addLikes(post.likes);
        }

        if (post.comments > 0) {
            addComments(post.comments);
        }

        if (post.followersGained > 0) {
            addFollowers(post.followersGained);
        }

        saveState();

        log("Post dibuat:", post);

        return post;
    }

    function createSocialEvent(data) {
        if (!ensureState()) {
            return null;
        }

        data = data || {};

        const event = {
            id:
                "social_" +
                Date.now().toString(36) +
                "_" +
                Math.random().toString(36).slice(2, 8),

            type: String(data.type || "general"),

            title: String(data.title || "Social Event"),

            description: String(
                data.description || ""
            ),

            date: new Date().toISOString(),

            followersChange:
                Number(data.followersChange) || 0,

            reputationChange:
                Number(data.reputationChange) || 0,

            likesChange:
                Number(data.likesChange) || 0,

            commentsChange:
                Number(data.commentsChange) || 0
        };

        S.player.social.events.unshift(event);

        if (event.followersChange > 0) {
            addFollowers(event.followersChange);
        } else if (event.followersChange < 0) {
            removeFollowers(Math.abs(event.followersChange));
        }

        if (event.likesChange) {
            addLikes(event.likesChange);
        }

        if (event.commentsChange) {
            addComments(event.commentsChange);
        }

        if (event.reputationChange) {
            changeReputation(event.reputationChange);
        }

        if (S.player.social.events.length > 100) {
            S.player.social.events =
                S.player.social.events.slice(0, 100);
        }

        saveState();

        log("Social event dibuat:", event);

        return event;
    }

    function getStats() {
        const social = getSocial();

        if (!social) {
            return null;
        }

        return {
            followers: social.followers,
            following: social.following,
            likes: social.likes,
            comments: social.comments,
            reputation: social.reputation,
            posts: social.posts.length,
            events: social.events.length
        };
    }

    function getPosts(limit) {
        const social = getSocial();

        if (!social) {
            return [];
        }

        limit = Number(limit);

        if (!Number.isFinite(limit) || limit <= 0) {
            return social.posts.slice();
        }

        return social.posts.slice(0, limit);
    }

    function getEvents(limit) {
        const social = getSocial();

        if (!social) {
            return [];
        }

        limit = Number(limit);

        if (!Number.isFinite(limit) || limit <= 0) {
            return social.events.slice();
        }

        return social.events.slice(0, limit);
    }

    function follow(amount) {
        const social = getSocial();

        if (!social) {
            return 0;
        }

        amount = Math.max(
            0,
            Math.floor(Number(amount) || 0)
        );

        social.following += amount;

        saveState();

        return social.following;
    }

    function unfollow(amount) {
        const social = getSocial();

        if (!social) {
            return 0;
        }

        amount = Math.max(
            0,
            Math.floor(Number(amount) || 0)
        );

        social.following = Math.max(
            0,
            social.following - amount
        );

        saveState();

        return social.following;
    }

    function resetSocial() {
        if (!ensureState()) {
            return false;
        }

        S.player.social = {
            followers: 0,
            following: 0,
            likes: 0,
            comments: 0,
            reputation: 0,
            posts: [],
            events: []
        };

        saveState();

        log("Social data berhasil di-reset.");

        return true;
    }

    function initialize() {
        if (!ensureState()) {
            return false;
        }

        log("Social System initialized.");

        return true;
    }

    const API = {
        initialize: initialize,

        getPlayer: getPlayer,
        getSocial: getSocial,
        getStats: getStats,

        addFollowers: addFollowers,
        removeFollowers: removeFollowers,

        addLikes: addLikes,
        addComments: addComments,

        changeReputation: changeReputation,

        follow: follow,
        unfollow: unfollow,

        createPost: createPost,
        createSocialEvent: createSocialEvent,

        getPosts: getPosts,
        getEvents: getEvents,

        resetSocial: resetSocial,

        version: VERSION
    };

    window.RVSportsSocial = API;

    initialize();

    log(SYSTEM_NAME + " loaded.");
    log("Version:", VERSION);
    log("API available:", !!window.RVSportsSocial);

})();
