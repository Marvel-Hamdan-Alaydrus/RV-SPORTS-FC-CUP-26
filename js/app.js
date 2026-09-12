/* =========================================================
   RV SPORTS: FC CUP 26
   MAIN APPLICATION
   Version: 1.1.0
   ========================================================= */

(function () {
    "use strict";

    const APP_VERSION = "1.1.0";

    const AppState = {
        booted: false,
        starting: false
    };

    /* =====================================================
       ELEMENT HELPERS
       ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function setLoading(percent, text) {
        const percentage = $("loading-percentage");
        const bar = $("loading-bar");
        const loadingText =
            document.querySelector(".loading-text");

        if (percentage) {
            percentage.textContent = percent + "%";
        }

        if (bar) {
            bar.style.width = percent + "%";
        }

        if (loadingText && text) {
            loadingText.textContent = text;
        }

        console.log(
            "[APP]",
            percent + "%",
            "-",
            text
        );
    }

    /* =====================================================
       SCREEN HELPERS
       ===================================================== */

    function showStartScreen() {
        if (
            window.Router &&
            typeof window.Router.navigate === "function"
        ) {
            window.Router.navigate("start");
            return;
        }

        const screen = $("start-screen");

        if (!screen) {
            console.error(
                "[APP] start-screen tidak ditemukan."
            );
            return;
        }

        document
            .querySelectorAll(".screen")
            .forEach(function (item) {
                item.classList.add("hidden");
            });

        screen.classList.remove("hidden");
    }

    function showCharacterCreation() {
        if (
            window.Router &&
            typeof window.Router.navigate === "function"
        ) {
            window.Router.navigate("character");
            return;
        }

        const screen =
            $("character-creation-screen");

        if (!screen) {
            console.error(
                "[APP] character-creation-screen tidak ditemukan."
            );
            return;
        }

        document
            .querySelectorAll(".screen")
            .forEach(function (item) {
                item.classList.add("hidden");
            });

        screen.classList.remove("hidden");
    }

    function showDashboard() {
        if (
            window.Router &&
            typeof window.Router.navigate === "function"
        ) {
            window.Router.navigate("dashboard");
            return;
        }

        const screen =
            $("main-dashboard");

        if (!screen) {
            console.error(
                "[APP] main-dashboard tidak ditemukan."
            );
            return;
        }

        document
            .querySelectorAll(".screen")
            .forEach(function (item) {
                item.classList.add("hidden");
            });

        screen.classList.remove("hidden");
    }

    /* =====================================================
       START FORM
       ===================================================== */

    function getStartFormData() {
        const emailInput =
            $("player-email");

        const accountNameInput =
            $("player-account-name");

        return {
            email: emailInput
                ? emailInput.value.trim()
                : "",

            accountName: accountNameInput
                ? accountNameInput.value.trim()
                : ""
        };
    }

    function validateStartForm(data) {
        if (!data.email) {
            return {
                valid: false,
                message: "Email wajib diisi."
            };
        }

        /*
         * Validasi email sederhana.
         */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(data.email)) {
            return {
                valid: false,
                message: "Format email belum valid."
            };
        }

        if (!data.accountName) {
            return {
                valid: false,
                message: "Nama akun wajib diisi."
            };
        }

        if (data.accountName.length < 3) {
            return {
                valid: false,
                message: "Nama akun minimal 3 karakter."
            };
        }

        return {
            valid: true,
            message: ""
        };
    }

    function saveStartData(data) {
        if (!window.S) {
            console.error(
                "[APP] S tidak tersedia."
            );

            return false;
        }

        if (!window.S.player) {
            window.S.player = {};
        }

        /*
         * Simpan identitas akun.
         */

        window.S.player.email =
            data.email;

        window.S.player.accountName =
            data.accountName;

        /*
         * Jangan langsung mengisi player.name
         * karena nama pemain sepak bola akan dibuat
         * pada Character Creation.
         */

        /*
         * Metadata.
         */

        if (typeof window.touchState === "function") {
            window.touchState();
        }

        console.log(
            "[APP] Start data saved:",
            {
                email: window.S.player.email,
                accountName:
                    window.S.player.accountName
            }
        );

        return true;
    }

    function showStartError(message) {
        const error =
            $("start-error");

        if (!error) {
            console.warn(
                "[APP] Start error element tidak ditemukan:",
                message
            );

            return;
        }

        error.textContent = message;
        error.classList.remove("hidden");
    }

    function clearStartError() {
        const error =
            $("start-error");

        if (!error) {
            return;
        }

        error.textContent = "";
        error.classList.add("hidden");
    }

    function handleStartGame() {
        if (AppState.starting) {
            return;
        }

        AppState.starting = true;

        try {
            clearStartError();

            const data =
                getStartFormData();

            const validation =
                validateStartForm(data);

            if (!validation.valid) {
                showStartError(
                    validation.message
                );

                return;
            }

            const saved =
                saveStartData(data);

            if (!saved) {
                showStartError(
                    "Gagal menyimpan data akun."
                );

                return;
            }

            /*
             * Simpan langsung supaya email + account name
             * tidak hilang ketika browser direfresh.
             */

            if (
                typeof window.saveGame ===
                "function"
            ) {
                window.saveGame();
            }

            /*
             * Lanjut ke pembuatan karakter.
             */

            showCharacterCreation();

        } catch (error) {
            console.error(
                "[APP] Start game error:",
                error
            );

            showStartError(
                "Terjadi kesalahan. Coba lagi."
            );

        } finally {
            AppState.starting = false;
        }
    }

    /* =====================================================
       START FORM ENTER KEY
       ===================================================== */

    function bindStartForm() {
        const button =
            $("start-game-button");

        if (button) {
            button.addEventListener(
                "click",
                handleStartGame
            );
        }

        const email =
            $("player-email");

        const accountName =
            $("player-account-name");

        [
            email,
            accountName
        ].forEach(function (input) {
            if (!input) {
                return;
            }

            input.addEventListener(
                "keydown",
                function (event) {
                    if (
                        event.key === "Enter"
                    ) {
                        event.preventDefault();

                        handleStartGame();
                    }
                }
            );
        });

        console.log(
            "[APP] Start form ready."
        );
    }

    /* =====================================================
       CHARACTER CREATION HANDLER
       ===================================================== */

    function getCharacterFormData() {
        const name =
            $("character-name");

        const birthdate =
            $("character-birthdate");

        const shirtName =
            $("character-shirt-name");

        const country =
            $("character-country");

        const selectedPosition =
            document.querySelector(
                "[data-position].active"
            );

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
                    ? selectedPosition.getAttribute(
                        "data-position"
                    )
                    : ""
        };
    }

    function saveCharacterData(data) {
        if (!window.S) {
            return false;
        }

        if (!window.S.player) {
            window.S.player = {};
        }

        window.S.player.name =
            data.name;

        window.S.player.birthdate =
            data.birthdate;

        window.S.player.shirtName =
            data.shirtName;

        window.S.player.country =
            data.country;

        window.S.player.position =
            data.position;

        if (
            typeof window.touchState ===
            "function"
        ) {
            window.touchState();
        }

        console.log(
            "[APP] Character saved:",
            window.S.player
        );

        return true;
    }

    /* =====================================================
       DASHBOARD REFRESH
       ===================================================== */

    function refreshDashboard() {
        if (!window.S || !window.S.player) {
            return;
        }

        const player =
            window.S.player;

        const name =
            $("header-player-name");

        const money =
            $("header-money");

        const followers =
            $("header-followers");

        const cardName =
            $("dashboard-player-name");

        const cardOvr =
            $("dashboard-ovr");

        const cardPosition =
            $("dashboard-position");

        if (name) {
            name.textContent =
                player.name ||
                "Unnamed Player";
        }

        if (money) {
            money.textContent =
                formatNumber(
                    player.money || 0
                );
        }

        if (followers) {
            followers.textContent =
                formatNumber(
                    player.followers || 0
                );
        }

        if (cardName) {
            cardName.textContent =
                player.name ||
                "Unnamed Player";
        }

        if (cardOvr) {
            cardOvr.textContent =
                player.ovr || 0;
        }

        if (cardPosition) {
            cardPosition.textContent =
                player.position ||
                "ST";
        }
    }

    /* =====================================================
       NUMBER FORMATTER
       ===================================================== */

    function formatNumber(value) {
        const number =
            Number(value) || 0;

        return number.toLocaleString(
            "id-ID"
        );
    }

    /* =====================================================
       BOOT
       ===================================================== */

    async function bootGame() {
        if (AppState.booted) {
            return;
        }

        console.log(
            "[APP] Boot started."
        );

        setLoading(
            5,
            "Menyiapkan sistem..."
        );

        await wait(150);

        setLoading(
            15,
            "Memuat penyimpanan..."
        );

        if (
            typeof window.loadGame ===
            "function"
        ) {
            try {
                window.loadGame();
            } catch (error) {
                console.warn(
                    "[APP] Load game failed:",
                    error
                );
            }
        }

        await wait(100);

        setLoading(
            25,
            "Memuat database pemain..."
        );

        if (
            window.PlayerSystem &&
            typeof window.PlayerSystem.init ===
            "function"
        ) {
            window.PlayerSystem.init();
        }

        await wait(100);

        setLoading(
            40,
            "Menyiapkan karier..."
        );

        if (
            window.CareerSystem &&
            typeof window.CareerSystem.init ===
            "function"
        ) {
            window.CareerSystem.init();
        }

        await wait(100);

        setLoading(
            55,
            "Memuat klub..."
        );

        if (
            window.ClubsSystem &&
            typeof window.ClubsSystem.init ===
            "function"
        ) {
            window.ClubsSystem.init();
        }

        await wait(100);

        setLoading(
            65,
            "Memuat negara..."
        );

        if (
            window.CountriesSystem &&
            typeof window.CountriesSystem.init ===
            "function"
        ) {
            window.CountriesSystem.init();
        }

        await wait(100);

        setLoading(
            75,
            "Memuat kompetisi..."
        );

        if (
            window.CompetitionsSystem &&
            typeof window.CompetitionsSystem.init ===
            "function"
        ) {
            window.CompetitionsSystem.init();
        }

        await wait(100);

        setLoading(
            85,
            "Menyiapkan dunia sepak bola..."
        );

        if (
            window.WorldSystem &&
            typeof window.WorldSystem.init ===
            "function"
        ) {
            window.WorldSystem.init();
        }

        await wait(100);

        setLoading(
            95,
            "Menyiapkan antarmuka..."
        );

        bindStartForm();

        await wait(150);

        setLoading(
            100,
            "RV SPORTS siap dimainkan!"
        );

        await wait(250);

        /*
         * Hide loading screen.
         */

        const loading =
            $("loading-screen");

        if (loading) {
            loading.classList.add(
                "hidden"
            );
        }

        /*
         * Router menentukan screen berikutnya.
         */

        if (
            window.Router &&
            typeof window.Router.initialize ===
            "function"
        ) {
            /*
             * Router biasanya sudah auto-init.
             * Kalau belum, initialize.
             */

            if (
                !window.Router.state ||
                !window.Router.state.initialized
            ) {
                window.Router.initialize();
            }
        } else {
            /*
             * Fallback kalau Router gagal dimuat.
             */

            if (
                window.S &&
                window.S.player &&
                window.S.player.name
            ) {
                showDashboard();
            } else {
                showStartScreen();
            }
        }

        AppState.booted = true;

        console.log(
            "[APP] RV SPORTS: FC CUP 26 boot complete."
        );
    }

    /* =====================================================
       UTILITY
       ===================================================== */

    function wait(ms) {
        return new Promise(
            function (resolve) {
                setTimeout(
                    resolve,
                    ms
                );
            }
        );
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.App = {
        version: APP_VERSION,

        boot: bootGame,

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
            refreshDashboard
    };

    /*
     * Global helper untuk kompatibilitas
     * dengan modul-modul berikutnya.
     */

    window.bootGame = bootGame;

    console.log(
        "RV SPORTS: FC CUP 26 App loaded."
    );

    console.log(
        "[APP] Version:",
        APP_VERSION
    );

    /*
     * Start setelah DOM siap.
     */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            bootGame
        );
    } else {
        bootGame();
    }

})();
