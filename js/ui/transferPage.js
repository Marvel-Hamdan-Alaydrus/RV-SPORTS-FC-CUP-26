/* =========================================================
   RV SPORTS: FC CUP 26
   TRANSFER PAGE UI
   File: js/ui/transferPage.js
   Version: 1.0.0
   ========================================================= */

(function () {
    "use strict";

    const TRANSFER_PAGE_VERSION = "1.0.0";

    let initialized = false;

    /* =========================================================
       HELPERS
    ========================================================= */

    function log() {
        console.log(
            "[TRANSFER UI]",
            ...Array.from(arguments)
        );
    }

    function getState() {
        return window.S || null;
    }

    function getPlayer() {
        const S = getState();

        if (!S || !S.player) {
            return null;
        }

        return S.player;
    }

    function getCareer() {
        const S = getState();

        if (!S || !S.career) {
            return null;
        }

        return S.career;
    }

    function getTransferSystem() {
        if (
            window.RVSportsTransfer &&
            typeof window.RVSportsTransfer === "object"
        ) {
            return window.RVSportsTransfer;
        }

        return null;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatNumber(value) {
        return (
            Number(value) || 0
        ).toLocaleString("en-US");
    }

    function getPlayerOVR() {
        const player = getPlayer();

        if (!player) {
            return 0;
        }

        return Number(
            player.ovr
        ) || 0;
    }

    function getPlayerPosition() {
        const player = getPlayer();

        if (!player) {
            return "ST";
        }

        return player.position || "ST";
    }

    function getPlayerName() {
        const player = getPlayer();

        if (!player) {
            return "Player";
        }

        return player.name || "Player";
    }

    function getCurrentClub() {
        const player = getPlayer();
        const career = getCareer();

        if (
            player &&
            player.career &&
            player.career.currentClubName
        ) {
            return player.career.currentClubName;
        }

        if (
            career &&
            career.currentClubName
        ) {
            return career.currentClubName;
        }

        return "Free Agent";
    }

    /* =========================================================
       DEFAULT CLUB DATA
    ========================================================= */

    function getAvailableClubs() {
        const S = getState();

        if (
            S &&
            S.world &&
            Array.isArray(S.world.clubs) &&
            S.world.clubs.length
        ) {
            return S.world.clubs
                .filter(function (club) {
                    return (
                        club &&
                        club.active !== false
                    );
                })
                .slice(0, 12);
        }

        /*
         * Fallback sementara.
         *
         * Nanti data ini akan otomatis
         * digantikan oleh world.js / clubs.js.
         */

        return [
            {
                id: "club_jakarta",
                name: "Jakarta United",
                country: "Indonesia",
                rating: 65,
                salary: 2500
            },
            {
                id: "club_surabaya",
                name: "Surabaya FC",
                country: "Indonesia",
                rating: 70,
                salary: 3500
            },
            {
                id: "club_bandung",
                name: "Bandung Athletic",
                country: "Indonesia",
                rating: 68,
                salary: 3000
            },
            {
                id: "club_london",
                name: "London City",
                country: "England",
                rating: 76,
                salary: 8000
            },
            {
                id: "club_paris",
                name: "Paris Royale",
                country: "France",
                rating: 80,
                salary: 12000
            },
            {
                id: "club_madrid",
                name: "Madrid Stars",
                country: "Spain",
                rating: 82,
                salary: 15000
            }
        ];
    }

    /* =========================================================
       CLUB OFFER
    ========================================================= */

    function calculateOffer(club) {
        const ovr = getPlayerOVR();

        const clubRating =
            Number(
                club.rating ||
                club.ovr ||
                club.overall ||
                60
            );

        const baseSalary =
            Number(
                club.salary ||
                club.weeklySalary ||
                2000
            );

        const difference =
            ovr - clubRating;

        let multiplier = 1;

        if (difference >= 10) {
            multiplier = 1.25;
        } else if (difference >= 5) {
            multiplier = 1.1;
        } else if (difference <= -10) {
            multiplier = 0.75;
        } else if (difference <= -5) {
            multiplier = 0.9;
        }

        return Math.max(
            500,
            Math.round(
                baseSalary * multiplier
            )
        );
    }

    /* =========================================================
       TRANSFER ACTION
    ========================================================= */

    function acceptTransfer(club) {
        const player = getPlayer();
        const career = getCareer();

        if (!player) {
            alert(
                "Player belum tersedia."
            );

            return;
        }

        const clubName =
            club.name ||
            "Unknown Club";

        const salary =
            calculateOffer(club);

        const oldClub =
            getCurrentClub();

        /*
         * Kalau sistem transfer asli
         * sudah menyediakan function,
         * coba gunakan terlebih dahulu.
         */

        const transferSystem =
            getTransferSystem();

        if (
            transferSystem &&
            typeof transferSystem.acceptTransfer ===
                "function"
        ) {
            try {
                transferSystem.acceptTransfer(
                    club.id ||
                    clubName,
                    {
                        salary: salary
                    }
                );

                renderTransferPage();

                return;
            } catch (error) {
                console.warn(
                    "[TRANSFER UI] Transfer system action failed. Using UI fallback.",
                    error
                );
            }
        }

        /*
         * Fallback sementara.
         */

        if (!player.career) {
            player.career = {};
        }

        player.career.currentClub =
            club.id ||
            clubName;

        player.career.currentClubName =
            clubName;

        player.career.salary =
            salary;

        if (career) {
            career.currentClub =
                club.id ||
                clubName;

            career.currentClubName =
                clubName;

            career.salary =
                salary;

            if (
                !Array.isArray(
                    career.clubHistory
                )
            ) {
                career.clubHistory = [];
            }

            career.clubHistory.push({
                clubId:
                    club.id ||
                    clubName,

                clubName:
                    clubName,

                joinedDate:
                    new Date()
                        .toISOString()
                        .slice(
                            0,
                            10
                        ),

                transferFee: 0,

                salary: salary
            });
        }

        /*
         * Tambahkan entry ke history
         * jika state menyediakan transfer history.
         */

        const S = getState();

        if (S) {
            if (
                !Array.isArray(
                    S.transferHistory
                )
            ) {
                S.transferHistory = [];
            }

            S.transferHistory.push({
                id:
                    "transfer_" +
                    Date.now(),

                from:
                    oldClub,

                to:
                    clubName,

                salary:
                    salary,

                date:
                    new Date()
                        .toISOString()
            });

            if (
                typeof window.touchState ===
                "function"
            ) {
                window.touchState();
            }

            if (
                typeof window.saveGame ===
                "function"
            ) {
                window.saveGame();
            }
        }

        log(
            "Transfer accepted:",
            clubName
        );

        if (
            window.RVSportsNotifications &&
            typeof window.RVSportsNotifications.success ===
                "function"
        ) {
            window.RVSportsNotifications.success(
                "Transfer berhasil! Kamu sekarang bermain untuk " +
                clubName +
                "."
            );
        } else {
            alert(
                "Transfer berhasil!\n\n" +
                clubName
            );
        }

        renderTransferPage();
    }

    function rejectTransfer(club) {
        const clubName =
            club.name ||
            "Unknown Club";

        if (
            window.RVSportsNotifications &&
            typeof window.RVSportsNotifications.info ===
                "function"
        ) {
            window.RVSportsNotifications.info(
                "Offer dari " +
                clubName +
                " ditolak."
            );
        }

        log(
            "Transfer rejected:",
            clubName
        );
    }

    /* =========================================================
       OFFER CARD
    ========================================================= */

    function createClubCard(club) {
        const name =
            club.name ||
            "Unknown Club";

        const country =
            club.country ||
            "Unknown";

        const rating =
            Number(
                club.rating ||
                club.ovr ||
                club.overall ||
                60
            );

        const salary =
            calculateOffer(club);

        return `
            <div class="transfer-club-card">

                <div class="transfer-club-header">

                    <div>
                        <span class="transfer-club-country">
                            ${escapeHTML(country)}
                        </span>

                        <h3>
                            ${escapeHTML(name)}
                        </h3>
                    </div>

                    <div class="transfer-club-rating">
                        <strong>
                            ${rating}
                        </strong>

                        <span>
                            OVR
                        </span>
                    </div>

                </div>

                <div class="transfer-offer-info">

                    <div>
                        <span>
                            Weekly Salary
                        </span>

                        <strong>
                            ${formatNumber(salary)}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Your OVR
                        </span>

                        <strong>
                            ${getPlayerOVR()}
                        </strong>
                    </div>

                </div>

                <div class="transfer-card-actions">

                    <button
                        type="button"
                        class="transfer-view-button"
                        data-transfer-view="${escapeHTML(
                            club.id ||
                            name
                        )}"
                    >
                        View Offer
                    </button>

                </div>

            </div>
        `;
    }

    /* =========================================================
       OFFER MODAL
    ========================================================= */

    function showOffer(club) {
        const name =
            club.name ||
            "Unknown Club";

        const salary =
            calculateOffer(club);

        const rating =
            Number(
                club.rating ||
                club.ovr ||
                club.overall ||
                60
            );

        const content = `
            <div class="transfer-offer-modal">

                <span class="transfer-modal-label">
                    TRANSFER OFFER
                </span>

                <h2>
                    ${escapeHTML(name)}
                </h2>

                <p>
                    ${escapeHTML(
                        club.country ||
                        "International Club"
                    )}
                </p>

                <div class="transfer-modal-stats">

                    <div>
                        <span>Club OVR</span>
                        <strong>${rating}</strong>
                    </div>

                    <div>
                        <span>Your OVR</span>
                        <strong>${getPlayerOVR()}</strong>
                    </div>

                    <div>
                        <span>Weekly Salary</span>
                        <strong>
                            ${formatNumber(salary)}
                        </strong>
                    </div>

                </div>

                <div class="transfer-modal-actions">

                    <button
                        type="button"
                        id="transfer-accept-button"
                        class="transfer-accept-button"
                    >
                        Accept Offer
                    </button>

                    <button
                        type="button"
                        id="transfer-reject-button"
                        class="transfer-reject-button"
                    >
                        Reject
                    </button>

                </div>

            </div>
        `;

        if (
            window.RVSportsModal &&
            typeof window.RVSportsModal.showHTML ===
                "function"
        ) {
            window.RVSportsModal.showHTML(
                "Transfer Offer",
                content
            );

            setTimeout(function () {
                const accept =
                    document.getElementById(
                        "transfer-accept-button"
                    );

                const reject =
                    document.getElementById(
                        "transfer-reject-button"
                    );

                if (accept) {
                    accept.onclick =
                        function () {
                            if (
                                window.RVSportsModal &&
                                typeof window.RVSportsModal.close ===
                                    "function"
                            ) {
                                window.RVSportsModal.close();
                            }

                            acceptTransfer(
                                club
                            );
                        };
                }

                if (reject) {
                    reject.onclick =
                        function () {
                            if (
                                window.RVSportsModal &&
                                typeof window.RVSportsModal.close ===
                                    "function"
                            ) {
                                window.RVSportsModal.close();
                            }

                            rejectTransfer(
                                club
                            );
                        };
                }
            }, 0);

            return;
        }

        /*
         * Fallback kalau modal belum tersedia.
         */

        const accepted =
            window.confirm(
                "Transfer ke " +
                name +
                "?\n\n" +
                "Weekly Salary: " +
                formatNumber(salary)
            );

        if (accepted) {
            acceptTransfer(club);
        } else {
            rejectTransfer(club);
        }
    }

    /* =========================================================
       EVENT BINDING
    ========================================================= */

    function bindTransferEvents() {
        const container =
            document.getElementById(
                "transfer-page-content"
            );

        if (!container) {
            return;
        }

        if (
            container.dataset
                .transferBound ===
            "true"
        ) {
            return;
        }

        container.dataset
            .transferBound =
            "true";

        container.addEventListener(
            "click",
            function (event) {
                const button =
                    event.target.closest(
                        "[data-transfer-view]"
                    );

                if (!button) {
                    return;
                }

                const clubId =
                    button.getAttribute(
                        "data-transfer-view"
                    );

                const clubs =
                    getAvailableClubs();

                const club =
                    clubs.find(
                        function (item) {
                            return (
                                String(
                                    item.id ||
                                    item.name
                                ) ===
                                String(
                                    clubId
                                )
                            );
                        }
                    );

                if (!club) {
                    return;
                }

                showOffer(club);
            }
        );
    }

    /* =========================================================
       RENDER
    ========================================================= */

    function renderTransferPage() {
        const dashboard =
            document.getElementById(
                "main-dashboard"
            );

        if (!dashboard) {
            console.warn(
                "[TRANSFER UI] Dashboard tidak ditemukan."
            );

            return false;
        }

        let container =
            document.getElementById(
                "transfer-page-content"
            );

        if (!container) {
            container =
                document.createElement(
                    "div"
                );

            container.id =
                "transfer-page-content";

            container.className =
                "transfer-page-content";

            dashboard.appendChild(
                container
            );
        }

        const playerName =
            getPlayerName();

        const position =
            getPlayerPosition();

        const ovr =
            getPlayerOVR();

        const currentClub =
            getCurrentClub();

        const clubs =
            getAvailableClubs();

        container.innerHTML = `
            <section class="transfer-page">

                <div class="transfer-page-header">

                    <div>
                        <span class="transfer-kicker">
                            CAREER
                        </span>

                        <h1>
                            Transfer Market
                        </h1>

                        <p>
                            Cari klub berikutnya dan
                            tentukan langkah kariermu.
                        </p>
                    </div>

                    <div class="transfer-player-summary">

                        <strong>
                            ${escapeHTML(playerName)}
                        </strong>

                        <span>
                            ${escapeHTML(position)}
                            • OVR ${ovr}
                        </span>

                        <small>
                            ${escapeHTML(currentClub)}
                        </small>

                    </div>

                </div>

                <div class="transfer-status-card">

                    <div>
                        <span>
                            CURRENT CLUB
                        </span>

                        <strong>
                            ${escapeHTML(currentClub)}
                        </strong>
                    </div>

                    <div>
                        <span>
                            PLAYER OVR
                        </span>

                        <strong>
                            ${ovr}
                        </strong>
                    </div>

                    <div>
                        <span>
                            AVAILABLE OFFERS
                        </span>

                        <strong>
                            ${clubs.length}
                        </strong>
                    </div>

                </div>

                <div class="transfer-section-heading">
                    <h2>
                        Available Clubs
                    </h2>

                    <p>
                        Pilih klub untuk melihat
                        detail tawaran.
                    </p>
                </div>

                <div class="transfer-club-grid">

                    ${
                        clubs.length
                            ? clubs
                                .map(
                                    createClubCard
                                )
                                .join("")
                            : `
                                <div class="transfer-empty">
                                    <h3>
                                        No clubs available
                                    </h3>

                                    <p>
                                        Belum ada klub
                                        yang tersedia.
                                    </p>
                                </div>
                            `
                    }

                </div>

            </section>
        `;

        bindTransferEvents();

        log(
            "Transfer page rendered:",
            clubs.length,
            "clubs."
        );

        return true;
    }

    /* =========================================================
       INITIALIZE
    ========================================================= */

    function initializeTransferPage() {
        if (initialized) {
            return true;
        }

        initialized = true;

        log(
            "RV SPORTS: FC CUP 26 Transfer Page UI loaded."
        );

        log(
            "Version:",
            TRANSFER_PAGE_VERSION
        );

        return true;
    }

    /* =========================================================
       PUBLIC API
    ========================================================= */

    window.RVSportsTransferPage = {
        version:
            TRANSFER_PAGE_VERSION,

        initialize:
            initializeTransferPage,

        render:
            renderTransferPage,

        showOffer:
            showOffer,

        acceptTransfer:
            acceptTransfer,

        rejectTransfer:
            rejectTransfer
    };

    initializeTransferPage();

})();
