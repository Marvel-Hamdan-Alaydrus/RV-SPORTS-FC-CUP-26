/*
==========================================================
RV SPORTS: FC CUP 26
PLAYER CARD UI SYSTEM
Version: 1.0.0
==========================================================
*/

(function () {
    "use strict";

    const SYSTEM_NAME = "RV SPORTS: FC CUP 26 Player Card";
    const VERSION = "1.0.0";

    let initialized = false;

    function log() {
        console.log("[PLAYERCARD]", ...arguments);
    }

    function warn() {
        console.warn("[PLAYERCARD]", ...arguments);
    }

    function $(id) {
        return document.getElementById(id);
    }

    function getState() {
        return window.S || null;
    }

    function getPlayer() {
        const state = getState();

        if (!state || !state.player) {
            return null;
        }

        return state.player;
    }

    function getStatValue(player, key) {
        if (!player) return 0;

        const stats = player.stats || {};

        const value =
            stats[key] ??
            player[key] ??
            0;

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return 0;
        }

        return Math.max(0, Math.min(99, Math.round(number)));
    }

    function getOVR(player) {
        if (!player) return 0;

        const possibleValues = [
            player.ovr,
            player.overall,
            player.rating,
            player.stats && player.stats.ovr
        ];

        for (let i = 0; i < possibleValues.length; i++) {
            const value = Number(possibleValues[i]);

            if (Number.isFinite(value) && value > 0) {
                return Math.max(1, Math.min(99, Math.round(value)));
            }
        }

        const stats = [
            getStatValue(player, "pac"),
            getStatValue(player, "sho"),
            getStatValue(player, "pas"),
            getStatValue(player, "dri"),
            getStatValue(player, "def"),
            getStatValue(player, "phy")
        ];

        const total = stats.reduce(function (sum, value) {
            return sum + value;
        }, 0);

        return Math.round(total / stats.length);
    }

    function getPosition(player) {
        if (!player) return "-";

        return (
            player.position ||
            player.pos ||
            "ST"
        ).toUpperCase();
    }

    function getPlayerName(player) {
        if (!player) return "PLAYER";

        return (
            player.name ||
            player.fullName ||
            "PLAYER"
        );
    }

    function getShirtName(player) {
        if (!player) return "";

        return (
            player.shirtName ||
            player.shirt ||
            ""
        );
    }

    function getPhoto(player) {
        if (!player) return "";

        return (
            player.photo ||
            player.photoUrl ||
            player.avatar ||
            player.image ||
            ""
        );
    }

    function setText(id, value) {
        const element = $(id);

        if (!element) {
            return false;
        }

        element.textContent = value ?? "";

        return true;
    }

function renderPhoto(player, prefix) {
    let imageId;
    let placeholderId;

    /*
     * Character card:
     * card-player-photo
     * card-player-placeholder
     *
     * Dashboard card:
     * dashboard-player-photo
     * dashboard-player-placeholder
     */
    if (prefix === "dashboard-card") {
        imageId = "dashboard-player-photo";
        placeholderId = "dashboard-player-placeholder";
    } else {
        imageId = prefix + "-player-photo";
        placeholderId = prefix + "-player-placeholder";
    }

    const image = $(imageId);
    const placeholder = $(placeholderId);

    if (!image) {
        warn("Image element tidak ditemukan:", imageId);
        return;
    }

    const photo = getPhoto(player);

    if (photo) {
        image.src = photo;
        image.alt = getPlayerName(player);

        image.classList.remove("hidden");

        if (placeholder) {
            placeholder.classList.add("hidden");
        }

        image.onerror = function () {
            image.classList.add("hidden");

            if (placeholder) {
                placeholder.classList.remove("hidden");
            }
        };

        return;
    }

    image.removeAttribute("src");
    image.classList.add("hidden");

    if (placeholder) {
        placeholder.classList.remove("hidden");
    }
}
    function renderStats(player, prefix) {
        setText(prefix + "-pac", getStatValue(player, "pac"));
        setText(prefix + "-sho", getStatValue(player, "sho"));
        setText(prefix + "-pas", getStatValue(player, "pas"));
        setText(prefix + "-dri", getStatValue(player, "dri"));
        setText(prefix + "-def", getStatValue(player, "def"));
        setText(prefix + "-phy", getStatValue(player, "phy"));
    }

    function renderCard(prefix, player) {
        if (!player) {
            warn("Player data tidak tersedia untuk:", prefix);
            return false;
        }

        const ovr = getOVR(player);
        const position = getPosition(player);
        const name = getPlayerName(player);
        const shirtName = getShirtName(player);

        setText(prefix + "-ovr", ovr);
        setText(prefix + "-position", position);

        setText(prefix + "-name", name);
        setText(prefix + "-position-name", position);

        if (shirtName) {
            setText(prefix + "-shirt-name", shirtName);
        }

        renderStats(player, prefix);
        renderPhoto(player, prefix);

        return true;
    }

    function renderCreationCard() {
        const player = getPlayer();

        if (!player) {
            log("Creation card belum punya player state.");
            return false;
        }

        return renderCard("card", player);
    }

    function renderDashboardCard() {
        const player = getPlayer();

        if (!player) {
            log("Dashboard card belum punya player state.");
            return false;
        }

        return renderCard("dashboard-card", player);
    }

    function refresh() {
        const player = getPlayer();

        if (!player) {
            warn("Tidak bisa refresh player card. Player tidak ditemukan.");
            return false;
        }

        renderCard("card", player);
        renderCard("dashboard-card", player);

        log("Player cards refreshed.");

        return true;
    }

    function initialize() {
        if (initialized) {
            return true;
        }

        initialized = true;

        log(SYSTEM_NAME + " loaded.");
        log("Version:", VERSION);
        log("API available:", true);

        /*
         * Tidak memaksa render saat boot.
         * App.js tetap mengontrol kapan data player tersedia.
         */
        const player = getPlayer();

        if (player) {
            renderCreationCard();
            renderDashboardCard();
        }

        return true;
    }

    function getData() {
        const player = getPlayer();

        if (!player) {
            return null;
        }

        return {
            id: player.id || null,
            name: getPlayerName(player),
            shirtName: getShirtName(player),
            position: getPosition(player),
            ovr: getOVR(player),
            pac: getStatValue(player, "pac"),
            sho: getStatValue(player, "sho"),
            pas: getStatValue(player, "pas"),
            dri: getStatValue(player, "dri"),
            def: getStatValue(player, "def"),
            phy: getStatValue(player, "phy"),
            photo: getPhoto(player)
        };
    }

    window.RVSportsPlayerCard = {
        initialize: initialize,
        refresh: refresh,
        render: refresh,
        renderCreationCard: renderCreationCard,
        renderDashboardCard: renderDashboardCard,
        getData: getData,
        getOVR: getOVR,
        getPosition: getPosition,
        getPlayerName: getPlayerName,
        version: VERSION
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }

})();
