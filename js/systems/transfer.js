/* =========================================================
   RV SPORTS: FC CUP 26
   TRANSFER SYSTEM
   File: js/systems/transfer.js
   Version: 1.0.0
   ========================================================= */

(function () {
    "use strict";

    const TRANSFER_VERSION = "1.0.0";

    /* =====================================================
       HELPERS
    ===================================================== */

    function log() {
        console.log(
            "[TRANSFER]",
            ...Array.from(arguments)
        );
    }

    function warn() {
        console.warn(
            "[TRANSFER]",
            ...Array.from(arguments)
        );
    }

    function getState() {
        return window.S || null;
    }

    function getPlayer() {
        const S = getState();

        if (!S) {
            return null;
        }

        if (!S.player) {
            S.player = {};
        }

        return S.player;
    }

    function getCareer() {
        const S = getState();

        if (!S) {
            return null;
        }

        if (!S.career) {
            S.career = {};
        }

        return S.career;
    }

    function touchState() {
        if (
            typeof window.touchState === "function"
        ) {
            window.touchState();
        }
    }

    function saveGame() {
        if (
            typeof window.saveGame !== "function"
        ) {
            warn(
                "saveGame() belum tersedia."
            );

            return false;
        }

        try {
            return window.saveGame();
        } catch (error) {
            console.error(
                "[TRANSFER] Save failed:",
                error
            );

            return false;
        }
    }

    function createId(prefix) {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );
    }

    function safeNumber(value, fallback) {
        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : (
                typeof fallback === "number"
                    ? fallback
                    : 0
            );
    }

    function safeString(value, fallback) {
        const text =
            String(
                value == null
                    ? ""
                    : value
            ).trim();

        return text || (
            fallback == null
                ? ""
                : String(fallback)
        );
    }

    /* =====================================================
       TRANSFER STATE
    ===================================================== */

    function ensureTransferState() {
        const S = getState();

        if (!S) {
            return null;
        }

        if (!S.transfer) {
            S.transfer = {};
        }

        if (
            !Array.isArray(
                S.transfer.offers
            )
        ) {
            S.transfer.offers = [];
        }

        if (
            !Array.isArray(
                S.transfer.history
            )
        ) {
            S.transfer.history = [];
        }

        if (
            typeof S.transfer.status !==
            "string"
        ) {
            S.transfer.status =
                "free_agent";
        }

        if (
            S.transfer.currentOfferId ===
            undefined
        ) {
            S.transfer.currentOfferId =
                null;
        }

        if (
            typeof S.transfer.transferCount !==
            "number"
        ) {
            S.transfer.transferCount =
                S.transfer.history.length;
        }

        return S.transfer;
    }

    /* =====================================================
       CLUB DATA
    ===================================================== */

    function getClubs() {
        const S = getState();

        if (
            !S ||
            !S.world ||
            !Array.isArray(
                S.world.clubs
            )
        ) {
            return [];
        }

        return S.world.clubs.filter(
            function (club) {
                return (
                    club &&
                    club.active !== false
                );
            }
        );
    }

    function findClub(identifier) {
        const clubs =
            getClubs();

        if (!identifier) {
            return null;
        }

        const value =
            String(identifier)
                .toLowerCase()
                .trim();

        return (
            clubs.find(
                function (club) {
                    return (
                        String(
                            club.id || ""
                        ).toLowerCase() ===
                            value ||
                        String(
                            club.name || ""
                        ).toLowerCase() ===
                            value ||
                        String(
                            club.code || ""
                        ).toLowerCase() ===
                            value
                    );
                }
            ) || null
        );
    }

    /* =====================================================
       CURRENT CLUB
    ===================================================== */

    function getCurrentClub() {
        const player =
            getPlayer();

        const career =
            getCareer();

        if (
            player &&
            player.career &&
            player.career.currentClubId
        ) {
            const club =
                findClub(
                    player.career
                        .currentClubId
                );

            if (club) {
                return club;
            }
        }

        if (
            career &&
            career.currentClubId
        ) {
            const club =
                findClub(
                    career.currentClubId
                );

            if (club) {
                return club;
            }
        }

        return null;
    }

    /* =====================================================
       CLUB RATING
    ===================================================== */

    function getClubStrength(club) {
        if (!club) {
            return 60;
        }

        return Math.max(
            1,
            Math.min(
                99,
                safeNumber(
                    club.rating ||
                    club.strength ||
                    club.overall ||
                    club.ovr,
                    60
                )
            )
        );
    }

    /* =====================================================
       OFFER VALUE
    ===================================================== */

    function calculateOfferValue(
        club,
        player
    ) {
        const ovr =
            safeNumber(
                player &&
                player.ovr,
                50
            );

        const clubStrength =
            getClubStrength(
                club
            );

        const base =
            50000 +
            (
                ovr *
                25000
            );

        const clubBonus =
            clubStrength *
            5000;

        return Math.round(
            (
                base +
                clubBonus
            ) / 10000
        ) * 10000;
    }

    /* =====================================================
       CREATE OFFER
    ===================================================== */

    function createOffer(
        clubIdentifier,
        options
    ) {
        options =
            options || {};

        const transfer =
            ensureTransferState();

        const player =
            getPlayer();

        if (!transfer) {
            return null;
        }

        if (!player) {
            warn(
                "Player belum tersedia."
            );

            return null;
        }

        const club =
            findClub(
                clubIdentifier
            );

        /*
         * Untuk fase awal game,
         * kalau database klub belum dibuat,
         * sistem tetap bisa membuat offer
         * menggunakan nama klub yang diberikan.
         */
        const clubId =
            club
                ? club.id
                : safeString(
                    options.clubId,
                    createId("club")
                );

        const clubName =
            club
                ? club.name
                : safeString(
                    options.clubName,
                    "New Club"
                );

        const offer =
            {
                id:
                    createId(
                        "offer"
                    ),

                clubId:
                    clubId,

                clubName:
                    clubName,

                clubCode:
                    club
                        ? (
                            club.code ||
                            ""
                        )
                        : "",

                value:
                    safeNumber(
                        options.value,
                        calculateOfferValue(
                            club,
                            player
                        )
                    ),

                wage:
                    safeNumber(
                        options.wage,
                        Math.round(
                            (
                                safeNumber(
                                    player.ovr,
                                    50
                                ) *
                                100
                            ) / 10
                        ) * 10
                    ),

                contractYears:
                    safeNumber(
                        options.contractYears,
                        3
                    ),

                status:
                    "pending",

                createdAt:
                    new Date()
                        .toISOString()
            };

        transfer.offers.push(
            offer
        );

        transfer.currentOfferId =
            offer.id;

        transfer.status =
            "offer_received";

        touchState();

        saveGame();

        log(
            "Transfer offer created:",
            offer
        );

        return offer;
    }

    /* =====================================================
       GET OFFERS
    ===================================================== */

    function getOffers(
        status
    ) {
        const transfer =
            ensureTransferState();

        if (!transfer) {
            return [];
        }

        if (!status) {
            return transfer.offers
                .slice();
        }

        return transfer.offers
            .filter(
                function (offer) {
                    return (
                        offer.status ===
                        status
                    );
                }
            );
    }

    function getPendingOffers() {
        return getOffers(
            "pending"
        );
    }

    /* =====================================================
       FIND OFFER
    ===================================================== */

    function findOffer(
        offerIdentifier
    ) {
        const transfer =
            ensureTransferState();

        if (
            !transfer ||
            !offerIdentifier
        ) {
            return null;
        }

        const value =
            String(
                offerIdentifier
            ).toLowerCase();

        return (
            transfer.offers.find(
                function (offer) {
                    return (
                        String(
                            offer.id || ""
                        ).toLowerCase() ===
                            value
                    );
                }
            ) || null
        );
    }

    /* =====================================================
       ACCEPT OFFER
    ===================================================== */

    function acceptOffer(
        offerIdentifier
    ) {
        const transfer =
            ensureTransferState();

        const player =
            getPlayer();

        const career =
            getCareer();

        if (
            !transfer ||
            !player ||
            !career
        ) {
            return {
                success: false,
                reason:
                    "Game state belum siap."
            };
        }

        const offer =
            findOffer(
                offerIdentifier
            );

        if (!offer) {
            return {
                success: false,
                reason:
                    "Transfer offer tidak ditemukan."
            };
        }

        if (
            offer.status !==
            "pending"
        ) {
            return {
                success: false,
                reason:
                    "Offer sudah tidak tersedia."
            };
        }

        const previousClub =
            getCurrentClub();

        const previousClubId =
            previousClub
                ? previousClub.id
                : (
                    career.currentClubId ||
                    player.career &&
                    player.career.currentClubId ||
                    null
                );

        const previousClubName =
            previousClub
                ? previousClub.name
                : (
                    career.currentClubName ||
                    player.career &&
                    player.career.currentClubName ||
                    "Free Agent"
                );

        /*
         * Reject all other pending offers.
         */

        transfer.offers.forEach(
            function (item) {
                if (
                    item.status ===
                    "pending"
                ) {
                    item.status =
                        item.id ===
                        offer.id
                            ? "accepted"
                            : "rejected";
                }
            }
        );

        /*
         * Update career.
         */

        career.currentClubId =
            offer.clubId;

        career.currentClubName =
            offer.clubName;

        career.currentClub =
            offer.clubName;

        career.club =
            offer.clubName;

        /*
         * Update player career
         * without destroying existing data.
         */

        if (!player.career) {
            player.career = {};
        }

        player.career.currentClubId =
            offer.clubId;

        player.career.currentClubName =
            offer.clubName;

        player.career.currentClub =
            offer.clubName;

        /*
         * Transfer history.
         */

        const historyEntry =
            {
                id:
                    createId(
                        "transfer"
                    ),

                playerId:
                    player.id ||
                    null,

                fromClubId:
                    previousClubId,

                fromClubName:
                    previousClubName,

                toClubId:
                    offer.clubId,

                toClubName:
                    offer.clubName,

                fee:
                    offer.value,

                wage:
                    offer.wage,

                contractYears:
                    offer.contractYears,

                date:
                    new Date()
                        .toISOString(),

                type:
                    previousClubId
                        ? "transfer"
                        : "free_agent_signing"
            };

        transfer.history.push(
            historyEntry
        );

        transfer.transferCount =
            transfer.history.length;

        transfer.currentOfferId =
            null;

        transfer.status =
            "signed";

        touchState();

        saveGame();

        log(
            "Transfer accepted:",
            historyEntry
        );

        return {
            success: true,
            offer: offer,
            history: historyEntry
        };
    }

    /* =====================================================
       REJECT OFFER
    ===================================================== */

    function rejectOffer(
        offerIdentifier
    ) {
        const transfer =
            ensureTransferState();

        if (!transfer) {
            return {
                success: false,
                reason:
                    "Transfer state belum siap."
            };
        }

        const offer =
            findOffer(
                offerIdentifier
            );

        if (!offer) {
            return {
                success: false,
                reason:
                    "Transfer offer tidak ditemukan."
            };
        }

        if (
            offer.status !==
            "pending"
        ) {
            return {
                success: false,
                reason:
                    "Offer sudah tidak tersedia."
            };
        }

        offer.status =
            "rejected";

        if (
            transfer.currentOfferId ===
            offer.id
        ) {
            transfer.currentOfferId =
                null;
        }

        const hasPending =
            transfer.offers.some(
                function (item) {
                    return (
                        item.status ===
                        "pending"
                    );
                }
            );

        transfer.status =
            hasPending
                ? "offer_received"
                : "no_offer";

        touchState();

        saveGame();

        log(
            "Transfer offer rejected:",
            offer
        );

        return {
            success: true,
            offer: offer
        };
    }

    /* =====================================================
       REQUEST TRANSFER
    ===================================================== */

    function requestTransfer(
        clubIdentifier
    ) {
        const player =
            getPlayer();

        if (!player) {
            return {
                success: false,
                reason:
                    "Player belum tersedia."
            };
        }

        const targetClub =
            findClub(
                clubIdentifier
            );

        if (!targetClub) {
            return {
                success: false,
                reason:
                    "Klub tidak ditemukan."
            };
        }

        const currentClub =
            getCurrentClub();

        if (
            currentClub &&
            currentClub.id ===
            targetClub.id
        ) {
            return {
                success: false,
                reason:
                    "Player sudah berada di klub tersebut."
            };
        }

        const offer =
            createOffer(
                targetClub.id
            );

        if (!offer) {
            return {
                success: false,
                reason:
                    "Gagal membuat transfer offer."
            };
        }

        return {
            success: true,
            offer: offer
        };
    }

    /* =====================================================
       FREE AGENT
    ===================================================== */

    function signAsFreeAgent(
        clubIdentifier,
        options
    ) {
        options =
            options || {};

        const transfer =
            ensureTransferState();

        const player =
            getPlayer();

        const career =
            getCareer();

        if (
            !transfer ||
            !player ||
            !career
        ) {
            return {
                success: false,
                reason:
                    "Game state belum siap."
            };
        }

        const club =
            findClub(
                clubIdentifier
            );

        if (!club) {
            return {
                success: false,
                reason:
                    "Klub tidak ditemukan."
            };
        }

        const previousClub =
            getCurrentClub();

        const previousClubId =
            previousClub
                ? previousClub.id
                : null;

        const previousClubName =
            previousClub
                ? previousClub.name
                : "Free Agent";

        career.currentClubId =
            club.id;

        career.currentClubName =
            club.name;

        career.currentClub =
            club.name;

        career.club =
            club.name;

        if (!player.career) {
            player.career = {};
        }

        player.career.currentClubId =
            club.id;

        player.career.currentClubName =
            club.name;

        player.career.currentClub =
            club.name;

        const historyEntry =
            {
                id:
                    createId(
                        "transfer"
                    ),

                playerId:
                    player.id ||
                    null,

                fromClubId:
                    previousClubId,

                fromClubName:
                    previousClubName,

                toClubId:
                    club.id,

                toClubName:
                    club.name,

                fee:
                    0,

                wage:
                    safeNumber(
                        options.wage,
                        0
                    ),

                contractYears:
                    safeNumber(
                        options.contractYears,
                        3
                    ),

                date:
                    new Date()
                        .toISOString(),

                type:
                    "free_agent_signing"
            };

        transfer.history.push(
            historyEntry
        );

        transfer.transferCount =
            transfer.history.length;

        transfer.status =
            "signed";

        touchState();

        saveGame();

        log(
            "Free agent signing:",
            historyEntry
        );

        return {
            success: true,
            history:
                historyEntry
        };
    }

    /* =====================================================
       TRANSFER HISTORY
    ===================================================== */

    function getHistory() {
        const transfer =
            ensureTransferState();

        if (!transfer) {
            return [];
        }

        return transfer.history
            .slice()
            .reverse();
    }

    /* =====================================================
       TRANSFER STATUS
    ===================================================== */

    function getStatus() {
        const transfer =
            ensureTransferState();

        if (!transfer) {
            return "unavailable";
        }

        return transfer.status;
    }

    /* =====================================================
       CURRENT CONTRACT
    ===================================================== */

    function getCurrentContract() {
        const history =
            getHistory();

        if (!history.length) {
            return null;
        }

        const latest =
            history[0];

        return {
            clubId:
                latest.toClubId,

            clubName:
                latest.toClubName,

            wage:
                latest.wage,

            contractYears:
                latest.contractYears,

            signedAt:
                latest.date
        };
    }

    /* =====================================================
       TRANSFER TOTALS
    ===================================================== */

    function getTotals() {
        const transfer =
            ensureTransferState();

        if (!transfer) {
            return {
                transfers: 0,
                fees: 0,
                wages: 0
            };
        }

        const history =
            transfer.history;

        let fees = 0;
        let wages = 0;

        history.forEach(
            function (item) {
                fees += safeNumber(
                    item.fee,
                    0
                );

                wages += safeNumber(
                    item.wage,
                    0
                );
            }
        );

        return {
            transfers:
                history.length,

            fees:
                fees,

            wages:
                wages
        };
    }

    /* =====================================================
       CLEAR OLD OFFERS
    ===================================================== */

    function clearCompletedOffers() {
        const transfer =
            ensureTransferState();

        if (!transfer) {
            return false;
        }

        transfer.offers =
            transfer.offers.filter(
                function (offer) {
                    return (
                        offer.status ===
                        "pending"
                    );
                }
            );

        if (
            transfer.currentOfferId
        ) {
            const current =
                findOffer(
                    transfer.currentOfferId
                );

            if (!current) {
                transfer.currentOfferId =
                    null;
            }
        }

        if (
            !transfer.offers.length
        ) {
            transfer.status =
                "no_offer";
        }

        touchState();

        return true;
    }

    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializeTransferSystem() {
        const transfer =
            ensureTransferState();

        if (!transfer) {
            warn(
                "State belum tersedia."
            );

            return false;
        }

        log(
            "Transfer System initialized."
        );

        return true;
    }

    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.RVSportsTransfer = {
        version:
            TRANSFER_VERSION,

        initialize:
            initializeTransferSystem,

        ensureState:
            ensureTransferState,

        getClubs:
            getClubs,

        findClub:
            findClub,

        getCurrentClub:
            getCurrentClub,

        createOffer:
            createOffer,

        getOffers:
            getOffers,

        getPendingOffers:
            getPendingOffers,

        findOffer:
            findOffer,

        acceptOffer:
            acceptOffer,

        rejectOffer:
            rejectOffer,

        requestTransfer:
            requestTransfer,

        signAsFreeAgent:
            signAsFreeAgent,

        getHistory:
            getHistory,

        getStatus:
            getStatus,

        getCurrentContract:
            getCurrentContract,

        getTotals:
            getTotals,

        clearCompletedOffers:
            clearCompletedOffers
    };

    initializeTransferSystem();

    console.log(
        "RV SPORTS: FC CUP 26 Transfer System loaded."
    );

    console.log(
        "[TRANSFER] Version:",
        TRANSFER_VERSION
    );

    console.log(
        "[TRANSFER] API available:",
        !!window.RVSportsTransfer
    );

})();
