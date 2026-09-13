/* =========================================================
   RV SPORTS: FC CUP 26
   MAIN APPLICATION
   File: js/app.js
   Version: 2.1.0
   ========================================================= */

(function () {
    "use strict";

    const APP_VERSION = "2.1.0";

    const AppState = {
        booted: false,
        starting: false,
        characterReady: false
    };

    let selectedPosition = "ST";

    const POSITION_NAMES = {
        GK: "Goalkeeper",
        LB: "Left Back",
        CB: "Centre Back",
        RB: "Right Back",
        LWB: "Left Wing Back",
        RWB: "Right Wing Back",
        CDM: "Defensive Midfielder",
        CM: "Central Midfielder",
        CAM: "Attacking Midfielder",
        LW: "Left Winger",
        RW: "Right Winger",
        ST: "Striker"
    };

    /* =========================================================
       HELPER
    ========================================================= */

    function $(id) {
        return document.getElementById(id);
    }

    function log() {
        console.log(
            "[APP]",
            ...Array.from(arguments)
        );
    }

    function warn() {
        console.warn(
            "[APP]",
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

    function getPlayerStats() {
        const player = getPlayer();

        if (!player) {
            return {};
        }

        if (!player.stats) {
            player.stats = {};
        }

        return player.stats;
    }

    function getAccount() {
        const S = getState();

        if (!S) {
            return null;
        }

        if (!S.account) {
            S.account = {
                email: "",
                name: "",
                created: false
            };
        }

        return S.account;
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
                "[APP] Save failed:",
                error
            );

            return false;
        }
    }

    function navigate(route) {
        if (
            window.Router &&
            typeof window.Router.navigate === "function"
        ) {
            window.Router.navigate(route);
            return true;
        }

        warn(
            "Router belum tersedia:",
            route
        );

        return false;
    }

    function showError(message) {
        const error = $("start-error");

        if (error) {
            error.textContent = message;
            error.classList.remove("hidden");
        } else {
            alert(message);
        }
    }

    function clearError() {
        const error = $("start-error");

        if (error) {
            error.textContent = "";
            error.classList.add("hidden");
        }
    }

    /* =========================================================
       SCREEN
    ========================================================= */

    function hideAllScreens() {
        const screens =
            document.querySelectorAll(
                ".screen"
            );

        screens.forEach(function (screen) {
            screen.classList.add("hidden");

            /*
             * Jangan kasih aria-hidden ke screen yang
             * sedang memiliki focus.
             */
            if (
                document.activeElement &&
                screen.contains(
                    document.activeElement
                )
            ) {
                try {
                    document.activeElement.blur();
                } catch (error) {
                    // Ignore
                }
            }

            screen.setAttribute(
                "aria-hidden",
                "true"
            );
        });
    }

    function showScreen(id) {
        const screen = $(id);

        if (!screen) {
            warn(
                "Screen tidak ditemukan:",
                id
            );

            return false;
        }

        hideAllScreens();

        screen.classList.remove(
            "hidden"
        );

        screen.setAttribute(
            "aria-hidden",
            "false"
        );

        return true;
    }

    function showStartScreen() {
        showScreen(
            "start-screen"
        );

        navigate("start");
    }

    function showCharacterCreation() {
        showScreen(
            "character-creation-screen"
        );

        bindCharacterCreation();

        populateCountrySelect();

        updateCharacterPreview();

        navigate("character");

        log(
            "Character creation screen opened."
        );
    }

    function showDashboard() {
        showScreen(
            "main-dashboard"
        );

        refreshDashboard();

        navigate("home");

        log(
            "Dashboard opened."
        );
    }

    /* =========================================================
       START FORM
    ========================================================= */

    function getStartFormData() {
        const email =
            $("player-email");

        const accountName =
            $("player-account-name");

        return {
            email: email
                ? email.value.trim()
                : "",

            accountName: accountName
                ? accountName.value.trim()
                : ""
        };
    }

    function validateStartForm(data) {
        if (!data.email) {
            showError(
                "Email wajib diisi."
            );

            $("player-email")?.focus();

            return false;
        }

        if (!data.accountName) {
            showError(
                "Nama akun wajib diisi."
            );

            $("player-account-name")?.focus();

            return false;
        }

        if (
            !data.email.includes("@")
        ) {
            showError(
                "Masukkan email yang valid."
            );

            $("player-email")?.focus();

            return false;
        }

        return true;
    }

    function saveStartData(data) {
        const S = getState();

        if (!S) {
            showError(
                "Game state belum siap."
            );

            return false;
        }

        const account =
            getAccount();

        if (!account) {
            return false;
        }

        account.email =
            data.email;

        account.name =
            data.accountName;

        account.created = true;

        touchState();

        log(
            "Start data saved:",
            {
                email:
                    account.email,

                accountName:
                    account.name
            }
        );

        return true;
    }

    function handleStartGame() {
        if (AppState.starting) {
            return;
        }

        AppState.starting = true;

        clearError();

        try {
            const data =
                getStartFormData();

            if (
                !validateStartForm(
                    data
                )
            ) {
                return;
            }

            if (
                !saveStartData(
                    data
                )
            ) {
                return;
            }

            saveGame();

            showCharacterCreation();

        } catch (error) {
            console.error(
                "[APP] Start game error:",
                error
            );

            showError(
                "Terjadi kesalahan saat memulai game."
            );

        } finally {
            AppState.starting = false;
        }
    }

    function bindStartForm() {
        const button =
            $("start-game-button");

        if (!button) {
            warn(
                "start-game-button tidak ditemukan."
            );

            return;
        }

        if (
            button.dataset.bound ===
            "true"
        ) {
            return;
        }

        button.dataset.bound =
            "true";

        button.addEventListener(
            "click",
            handleStartGame
        );

        log(
            "Start form ready."
        );
    }

    /* =========================================================
       CHARACTER FORM
    ========================================================= */

    function getCharacterFormData() {
        const name =
            $("character-name");

        const birthdate =
            $("character-birthdate");

        const shirtName =
            $("character-shirt-name");

        const country =
            $("character-country");

        return {
            name: name
                ? name.value.trim()
                : "",

            birthdate: birthdate
                ? birthdate.value
                : "",

            shirtName: shirtName
                ? shirtName.value.trim()
                : "",

            country: country
                ? country.value
                : "",

            position:
                selectedPosition
        };
    }

    /* =========================================================
       COUNTRY DROPDOWN
    ========================================================= */

    function getCountries() {
        const S =
            getState();

        if (
            !S ||
            !S.world ||
            !Array.isArray(
                S.world.countries
            )
        ) {
            return [];
        }

        return S.world.countries
            .filter(function (country) {
                return (
                    country &&
                    country.active !== false
                );
            })
            .sort(function (a, b) {
                return String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                );
            });
    }

    function populateCountrySelect() {
        const select =
            $("character-country");

        if (!select) {
            warn(
                "character-country tidak ditemukan."
            );

            return;
        }

        const countries =
            getCountries();

        if (!countries.length) {
            warn(
                "Country database kosong."
            );

            return;
        }

        const currentValue =
            select.value;

        select.innerHTML = "";

        const placeholder =
            document.createElement(
                "option"
            );

        placeholder.value = "";

        placeholder.textContent =
            "Pilih negara";

        select.appendChild(
            placeholder
        );

        countries.forEach(
            function (country) {
                const option =
                    document.createElement(
                        "option"
                    );

                /*
                 * Simpan CODE sebagai value.
                 * Contoh: IDN, BRA, FRA
                 */
                option.value =
                    country.code ||
                    country.id;

                option.textContent =
                    country.flag
                        ? country.flag +
                          " " +
                          country.name
                        : country.name;

                option.dataset.countryId =
                    country.id || "";

                option.dataset.countryCode =
                    country.code || "";

                select.appendChild(
                    option
                );
            }
        );

        if (currentValue) {
            const exists =
                Array.from(
                    select.options
                ).some(function (
                    option
                ) {
                    return (
                        option.value ===
                        currentValue
                    );
                });

            if (exists) {
                select.value =
                    currentValue;
            }
        }

        log(
            "Country dropdown populated:",
            countries.length,
            "countries."
        );
    }

    function getSelectedCountry() {
        const select =
            $("character-country");

        if (!select) {
            return null;
        }

        const value =
            select.value;

        if (!value) {
            return null;
        }

        const countries =
            getCountries();

        return (
            countries.find(
                function (country) {
                    return (
                        country.code ===
                            value ||
                        country.id ===
                            value
                    );
                }
            ) || null
        );
    }

    /* =========================================================
       AGE
    ========================================================= */

    function calculateAge(
        birthdate
    ) {
        if (!birthdate) {
            return 18;
        }

        const birth =
            new Date(
                birthdate
            );

        if (
            Number.isNaN(
                birth.getTime()
            )
        ) {
            return 18;
        }

        const today =
            new Date();

        let age =
            today.getFullYear() -
            birth.getFullYear();

        const monthDifference =
            today.getMonth() -
            birth.getMonth();

        if (
            monthDifference < 0 ||
            (
                monthDifference === 0 &&
                today.getDate() <
                    birth.getDate()
            )
        ) {
            age--;
        }

        return Math.max(
            1,
            age
        );
    }

    /* =========================================================
       SAVE CHARACTER
    ========================================================= */

    function saveCharacterData(
        data
    ) {
        const S =
            getState();

        if (!S) {
            return false;
        }

        const player =
            getPlayer();

        if (!player) {
            return false;
        }

        player.name =
            data.name;

        player.birthDate =
            data.birthdate;

        player.shirtName =
            data.shirtName ||
            data.name;

        player.nationality =
            data.country;

        player.position =
            data.position;

        player.age =
            calculateAge(
                data.birthdate
            );

        /*
         * Simpan countryId juga.
         */
        const selectedCountry =
            getSelectedCountry();

        if (selectedCountry) {
            player.countryId =
                selectedCountry.id;
        } else {
            player.countryId =
                data.country;
        }

        touchState();

        log(
            "Character data saved:",
            {
                name:
                    player.name,

                birthDate:
                    player.birthDate,

                nationality:
                    player.nationality,

                countryId:
                    player.countryId,

                position:
                    player.position,

                age:
                    player.age
            }
        );

        return true;
    }

    /* =========================================================
       POSITION
    ========================================================= */

    function bindPositionButtons() {
        const buttons =
            document.querySelectorAll(
                "[data-position]"
            );

        if (!buttons.length) {
            warn(
                "Position buttons tidak ditemukan."
            );

            return;
        }

        buttons.forEach(
            function (button) {
                if (
                    button.dataset
                        .positionBound ===
                    "true"
                ) {
                    return;
                }

                button.dataset
                    .positionBound =
                    "true";

                button.addEventListener(
                    "click",
                    function () {
                        selectedPosition =
                            button.dataset
                                .position;

                        buttons.forEach(
                            function (
                                item
                            ) {
                                item.classList
                                    .remove(
                                        "active"
                                    );

                                item.classList
                                    .remove(
                                        "selected"
                                    );
                            }
                        );

                        button.classList.add(
                            "active"
                        );

                        button.classList.add(
                            "selected"
                        );

                        updateCharacterPreview();

                        /*
                         * Gacha lama dibuang ketika
                         * posisi berubah supaya player
                         * tidak memakai hasil posisi lama.
                         */
                        window.characterGacha =
                            null;

                        log(
                            "Position selected:",
                            selectedPosition
                        );
                    }
                );
            }
        );

        const defaultButton =
            document.querySelector(
                '[data-position="' +
                selectedPosition +
                '"]'
            );

        if (defaultButton) {
            defaultButton.classList.add(
                "active"
            );

            defaultButton.classList.add(
                "selected"
            );
        }

        log(
            "Position buttons ready."
        );
    }

    /* =========================================================
       CHARACTER PREVIEW
    ========================================================= */

    function updateCharacterPreview() {
        const data =
            getCharacterFormData();

        const cardName =
            $("card-name");

        const cardPosition =
            $("card-position");

        const cardPositionName =
            $("card-position-name");

        const cardShirtName =
            $("card-shirt-name");

        if (cardName) {
            cardName.textContent =
                data.name ||
                "YOUR PLAYER";
        }

        if (cardPosition) {
            cardPosition.textContent =
                selectedPosition;
        }

        if (cardPositionName) {
            cardPositionName.textContent =
                POSITION_NAMES[
                    selectedPosition
                ] ||
                selectedPosition;
        }

        if (cardShirtName) {
            cardShirtName.textContent =
                (
                    data.shirtName ||
                    data.name ||
                    "PLAYER"
                ).toUpperCase();
        }
    }

    /* =========================================================
       GACHA
    ========================================================= */

    function randomStat(
        min,
        max
    ) {
        return Math.floor(
            Math.random() *
                (
                    max -
                    min +
                    1
                )
        ) + min;
    }

    function calculateCharacterOVR(
        stats
    ) {
        const values = [
            Number(
                stats.pac
            ) || 0,

            Number(
                stats.sho
            ) || 0,

            Number(
                stats.pas
            ) || 0,

            Number(
                stats.dri
            ) || 0,

            Number(
                stats.def
            ) || 0,

            Number(
                stats.phy
            ) || 0
        ];

        const total =
            values.reduce(
                function (
                    sum,
                    value
                ) {
                    return (
                        sum +
                        value
                    );
                },
                0
            );

        return Math.round(
            total /
                values.length
        );
    }

    function updateGachaDisplay(
        stats,
        ovr
    ) {
        const elements = {
            pac: "gacha-pac",
            sho: "gacha-sho",
            pas: "gacha-pas",
            dri: "gacha-dri",
            def: "gacha-def",
            phy: "gacha-phy"
        };

        Object.keys(
            elements
        ).forEach(
            function (key) {
                const element =
                    $(
                        elements[key]
                    );

                if (element) {
                    element.textContent =
                        stats[key];
                }
            }
        );

        const ovrElement =
            $("gacha-ovr");

        if (ovrElement) {
            ovrElement.textContent =
                ovr;
        }
    }

    function updateCardStats(
        stats,
        ovr
    ) {
        const elements = {
            pac: "card-pac",
            sho: "card-sho",
            pas: "card-pas",
            dri: "card-dri",
            def: "card-def",
            phy: "card-phy"
        };

        Object.keys(
            elements
        ).forEach(
            function (key) {
                const element =
                    $(
                        elements[key]
                    );

                if (element) {
                    element.textContent =
                        stats[key];
                }
            }
        );

        const ovrElement =
            $("card-ovr");

        if (ovrElement) {
            ovrElement.textContent =
                ovr;
        }
    }

    function runCharacterGacha() {
        const stats = {
            pac: randomStat(
                45,
                75
            ),

            sho: randomStat(
                45,
                75
            ),

            pas: randomStat(
                45,
                75
            ),

            dri: randomStat(
                45,
                75
            ),

            def: randomStat(
                35,
                70
            ),

            phy: randomStat(
                45,
                75
            )
        };

        switch (
            selectedPosition
        ) {
            case "ST":
                stats.sho += 10;
                stats.pac += 5;
                break;

            case "LW":
            case "RW":
                stats.pac += 8;
                stats.dri += 8;
                break;

            case "CAM":
            case "CM":
            case "CDM":
                stats.pas += 7;
                stats.dri += 5;
                break;

            case "CB":
            case "LB":
            case "RB":
            case "LWB":
            case "RWB":
                stats.def += 8;
                stats.phy += 4;
                break;

            case "GK":
                stats.def += 10;
                stats.phy += 5;
                break;
        }

        Object.keys(
            stats
        ).forEach(
            function (key) {
                stats[key] =
                    Math.min(
                        99,
                        Math.max(
                            1,
                            Math.round(
                                stats[key]
                            )
                        )
                    );
            }
        );

        const ovr =
            calculateCharacterOVR(
                stats
            );

        window.characterGacha = {
            stats: stats,
            ovr: ovr
        };

        updateGachaDisplay(
            stats,
            ovr
        );

        updateCardStats(
            stats,
            ovr
        );

        log(
            "Gacha result:",
            window.characterGacha
        );

        return (
            window.characterGacha
        );
    }

    /* =========================================================
       CREATE PLAYER
    ========================================================= */

    function handleCreatePlayer() {
        const data =
            getCharacterFormData();

        if (!data.name) {
            alert(
                "Nama pemain wajib diisi."
            );

            $("character-name")
                ?.focus();

            return;
        }

        if (!data.birthdate) {
            alert(
                "Tanggal lahir wajib diisi."
            );

            $("character-birthdate")
                ?.focus();

            return;
        }

        if (!data.country) {
            alert(
                "Pilih negara terlebih dahulu."
            );

            $("character-country")
                ?.focus();

            return;
        }

        data.position =
            selectedPosition;

        /*
         * Kalau belum gacha,
         * otomatis gacha sekali.
         */
        if (
            !window.characterGacha
        ) {
            runCharacterGacha();
        }

        if (
            !saveCharacterData(
                data
            )
        ) {
            alert(
                "Gagal menyimpan karakter."
            );

            return;
        }

        const player =
            getPlayer();

        const stats =
            window.characterGacha
                .stats;

        const ovr =
            window.characterGacha
                .ovr;

        /* Player stats */

        player.stats = {
            pac: stats.pac,
            sho: stats.sho,
            pas: stats.pas,
            dri: stats.dri,
            def: stats.def,
            phy: stats.phy
        };

        player.ovr =
            ovr;

        player.potential =
            Math.min(
                99,
                Math.max(
                    ovr + 15,
                    75
                )
            );

        /* Career */

        const S =
            getState();

        if (S.career) {
            S.career.started =
                true;

            S.career.startDate =
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    );

            S.career.careerStatus =
                "active";
        }

        /* World */

        if (S.world) {
            S.world.activeCountry =
                data.country;

            S.world.activeCountryId =
                player.countryId;
        }

        /* Default player economy */

        if (
            !player.economy
        ) {
            player.economy = {};
        }

        if (
            typeof player
                .economy.money !==
            "number"
        ) {
            player.economy.money =
                0;
        }

        /* Default player social */

        if (
            !player.social
        ) {
            player.social = {};
        }

        if (
            typeof player
                .social.followers !==
            "number"
        ) {
            player.social.followers =
                0;
        }

        touchState();

        saveGame();

        refreshDashboard();

        showDashboard();

        log(
            "Player created successfully:",
            player
        );
    }

    /* =========================================================
       CHARACTER BINDING
    ========================================================= */

    function bindCharacterCreation() {
        bindPositionButtons();

        populateCountrySelect();

        const gachaButton =
            $("gacha-button");

        if (
            gachaButton &&
            gachaButton.dataset
                .bound !== "true"
        ) {
            gachaButton.dataset
                .bound = "true";

            gachaButton.addEventListener(
                "click",
                runCharacterGacha
            );
        }

        const createButton =
            $("create-player-button");

        if (
            createButton &&
            createButton.dataset
                .bound !== "true"
        ) {
            createButton.dataset
                .bound = "true";

            createButton.addEventListener(
                "click",
                handleCreatePlayer
            );
        }

        [
            "character-name",
            "character-shirt-name",
            "character-birthdate",
            "character-country"
        ].forEach(
            function (id) {
                const element =
                    $(id);

                if (!element) {
                    return;
                }

                if (
                    element.dataset
                        .previewBound ===
                    "true"
                ) {
                    return;
                }

                element.dataset
                    .previewBound =
                    "true";

                element.addEventListener(
                    "input",
                    updateCharacterPreview
                );

                element.addEventListener(
                    "change",
                    function () {
                        updateCharacterPreview();

                        if (
                            id ===
                            "character-country"
                        ) {
                            const country =
                                getSelectedCountry();

                            if (country) {
                                log(
                                    "Country selected:",
                                    country.name,
                                    country.code
                                );
                            }
                        }
                    }
                );
            }
        );

        updateCharacterPreview();

        AppState.characterReady =
            true;

        log(
            "Character creation ready."
        );
    }

    /* =========================================================
       DASHBOARD
    ========================================================= */

    function formatNumber(
        value
    ) {
        return (
            Number(
                value
            ) || 0
        ).toLocaleString(
            "en-US",
            {
                maximumFractionDigits:
                    0
            }
        );
    }

    function formatMoney(
        value
    ) {
        return formatNumber(
            value
        );
    }

    function refreshDashboard() {
        const player =
            getPlayer();

        if (!player) {
            warn(
                "Player state belum tersedia."
            );

            return;
        }

        const stats =
            getPlayerStats();

        const money =
            player.economy &&
            typeof player.economy
                .money ===
                "number"
                ? player.economy
                    .money
                : 0;

        const followers =
            player.social &&
            typeof player.social
                .followers ===
                "number"
                ? player.social
                    .followers
                : 0;

        let clubName =
            "Free Agent";

        if (
            player.career &&
            player.career.currentClubName
        ) {
            clubName =
                player.career
                    .currentClubName;
        }

        if (
            window.S &&
            window.S.career &&
            window.S.career
                .currentClubName
        ) {
            clubName =
                window.S.career
                    .currentClubName;
        }

        /* Header */

        const headerAvatar =
            $("header-avatar");

        if (
            headerAvatar &&
            player.photo
        ) {
            headerAvatar.src =
                player.photo;

            headerAvatar.classList.remove(
                "hidden"
            );
        }

        const headerName =
            $("header-player-name");

        if (headerName) {
            headerName.textContent =
                player.name ||
                "Player";
        }

        const headerClub =
            $("header-player-club");

        if (headerClub) {
            headerClub.textContent =
                clubName;
        }

        const headerMoney =
            $("header-money");

        if (headerMoney) {
            headerMoney.textContent =
                formatMoney(
                    money
                );
        }

        const headerFollowers =
            $("header-followers");

        if (headerFollowers) {
            headerFollowers.textContent =
                formatNumber(
                    followers
                );
        }

        /* Dashboard player card */

        const dashboardName =
            $("dashboard-player-name");

        if (dashboardName) {
            dashboardName.textContent =
                player.name ||
                "Player";
        }

        const dashboardOVR =
            $("dashboard-ovr");

        if (dashboardOVR) {
            dashboardOVR.textContent =
                player.ovr ||
                0;
        }

        const dashboardPosition =
            $("dashboard-position");

        if (dashboardPosition) {
            dashboardPosition.textContent =
                player.position ||
                "ST";
        }

        const dashboardStats = {
            pac: "dashboard-pac",
            sho: "dashboard-sho",
            pas: "dashboard-pas",
            dri: "dashboard-dri",
            def: "dashboard-def",
            phy: "dashboard-phy"
        };

        Object.keys(
            dashboardStats
        ).forEach(
            function (key) {
                const element =
                    $(
                        dashboardStats[
                            key
                        ]
                    );

                if (element) {
                    element.textContent =
                        stats[key] ||
                        0;
                }
            }
        );

        updatePlayerPhoto(
            $("dashboard-player-photo"),
            $("dashboard-player-placeholder"),
            player
        );

        updatePlayerPhoto(
            $("card-player-photo"),
            $("card-player-placeholder"),
            player
        );

        log(
            "Dashboard refreshed."
        );
    }

    function updatePlayerPhoto(
        imageElement,
        placeholderElement,
        player
    ) {
        if (
            !imageElement ||
            !placeholderElement
        ) {
            return;
        }

        if (player.photo) {
            imageElement.src =
                player.photo;

            imageElement.classList.remove(
                "hidden"
            );

            placeholderElement.classList.add(
                "hidden"
            );
        } else {
            imageElement.classList.add(
                "hidden"
            );

            placeholderElement.classList.remove(
                "hidden"
            );
        }
    }

    /* =========================================================
       DASHBOARD NAVIGATION
    ========================================================= */

    function bindDashboardNavigation() {
        const buttons =
            document.querySelectorAll(
                "[data-page]"
            );

        buttons.forEach(
            function (button) {
                if (
                    button.dataset
                        .pageBound ===
                    "true"
                ) {
                    return;
                }

                button.dataset
                    .pageBound =
                    "true";

                button.addEventListener(
                    "click",
                    function () {
                        const page =
                            button.dataset
                                .page;

                        if (!page) {
                            return;
                        }

                        if (
                            page ===
                            "home"
                        ) {
                            showDashboard();
                            return;
                        }

                        navigate(
                            page
                        );

                        log(
                            "Dashboard navigation:",
                            page
                        );
                    }
                );
            }
        );

        log(
            "Dashboard navigation ready."
        );
    }

    /* =========================================================
       CREATOR BUTTONS
    ========================================================= */

    function bindGlobalButtons() {
        const creatorAccess =
            $("creator-access");

        if (
            creatorAccess &&
            creatorAccess.dataset
                .bound !== "true"
        ) {
            creatorAccess.dataset
                .bound = "true";

            creatorAccess.addEventListener(
                "click",
                function () {
                    navigate(
                        "creator"
                    );
                }
            );
        }

        const creatorModeButton =
            $("creator-mode-button");

        if (
            creatorModeButton &&
            creatorModeButton.dataset
                .bound !== "true"
        ) {
            creatorModeButton.dataset
                .bound = "true";

            creatorModeButton.addEventListener(
                "click",
                function () {
                    navigate(
                        "creator"
                    );
                }
            );
        }

        const creatorClose =
            $("creator-close-button");

        if (
            creatorClose &&
            creatorClose.dataset
                .bound !== "true"
        ) {
            creatorClose.dataset
                .bound = "true";

            creatorClose.addEventListener(
                "click",
                function () {
                    showDashboard();
                }
            );
        }
    }

    /* =========================================================
       BOOT
    ========================================================= */

    async function bootGame() {
        if (AppState.booted) {
            log(
                "Boot skipped. App already booted."
            );

            return;
        }

        log(
            "Booting RV SPORTS: FC CUP 26..."
        );

        try {
            const S =
                getState();

            if (S) {
                log(
                    "State detected:",
                    S.meta
                        ? S.meta.version
                        : "unknown"
                );
            } else {
                warn(
                    "window.S belum tersedia."
                );
            }

            bindStartForm();

            bindCharacterCreation();

            bindDashboardNavigation();

            bindGlobalButtons();

            AppState.booted =
                true;

            log(
                "Boot complete."
            );

        } catch (error) {
            console.error(
                "[APP] Boot error:",
                error
            );
        }
    }

    /* =========================================================
       PUBLIC API
    ========================================================= */

    window.App = {
        version:
            APP_VERSION,

        boot:
            bootGame,

        startGame:
            handleStartGame,

        getStartFormData:
            getStartFormData,

        getCharacterFormData:
            getCharacterFormData,

        saveStartData:
            saveStartData,

        saveCharacterData:
            saveCharacterData,

        refreshDashboard:
            refreshDashboard,

        showStartScreen:
            showStartScreen,

        showCharacterCreation:
            showCharacterCreation,

        showDashboard:
            showDashboard,

        populateCountrySelect:
            populateCountrySelect,

        getSelectedCountry:
            getSelectedCountry,

        runCharacterGacha:
            runCharacterGacha,

        createPlayer:
            handleCreatePlayer,

        updateCharacterPreview:
            updateCharacterPreview
    };

    window.bootGame =
        bootGame;

    console.log(
        "RV SPORTS: FC CUP 26 App loaded."
    );

    console.log(
        "[APP] Version:",
        APP_VERSION
    );

    /* =========================================================
       DOM READY
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            bootGame
        );
    } else {
        bootGame();
    }

})();
