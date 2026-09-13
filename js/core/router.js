/* =========================================================
   RV SPORTS: FC CUP 26
   ROUTER SYSTEM
   Version: 2.0.0
   Compatible with current index.html
   ========================================================= */

(function () {
    "use strict";

    const ROUTER_VERSION = "2.0.0";

    /* =====================================================
       ROUTES
       ===================================================== */

    const ROUTES = {
        loading: "loading-screen",
        start: "start-screen",
        character: "character-creation-screen",
        dashboard: "main-dashboard",
        creator: "creator-screen"
    };

    const DEFAULT_ROUTE = "start";

    /* =====================================================
       STATE
       ===================================================== */

    const RouterState = {
        currentRoute: null,
        previousRoute: null,
        initialized: false,
        navigating: false
    };

    /* =====================================================
       ELEMENT HELPERS
       ===================================================== */

    function getElement(id) {
        return document.getElementById(id);
    }

    function getRouteElement(route) {
        const screenId = ROUTES[route];

        if (!screenId) {
            return null;
        }

        return getElement(screenId);
    }

    function getAllScreens() {
        return Array.from(document.querySelectorAll(".screen"));
    }

    /* =====================================================
       SCREEN MANAGEMENT
       ===================================================== */

    function hideAllScreens() {
        const screens = getAllScreens();

        screens.forEach(function (screen) {
            screen.classList.add("hidden");
            screen.setAttribute("aria-hidden", "true");
        });
    }

    function showScreenElement(screen) {
        if (!screen) {
            return false;
        }

        hideAllScreens();

        screen.classList.remove("hidden");
        screen.setAttribute("aria-hidden", "false");

        return true;
    }

    function showRoute(route) {
        const screen = getRouteElement(route);

        if (!screen) {
            console.error(
                "[ROUTER] Screen not found for route:",
                route
            );

            return false;
        }

        return showScreenElement(screen);
    }

    /* =====================================================
       PLAYER CHECK
       ===================================================== */

    function hasPlayer() {
        try {
            return !!(
                window.S &&
                window.S.player &&
                typeof window.S.player.name === "string" &&
                window.S.player.name.trim() !== ""
            );
        } catch (error) {
            console.warn(
                "[ROUTER] Failed to check player:",
                error
            );

            return false;
        }
    }

    /* =====================================================
       CREATOR CHECK
       ===================================================== */

    function isCreatorAuthenticated() {
        try {
            return !!(
                window.S &&
                window.S.admin &&
                window.S.admin.creatorMode === true &&
                window.S.admin.authenticated === true
            );
        } catch (error) {
            return false;
        }
    }

    /* =====================================================
       HASH HELPERS
       ===================================================== */

    function normalizeRoute(route) {
        if (!route) {
            return DEFAULT_ROUTE;
        }

        route = String(route)
            .replace(/^#/, "")
            .trim()
            .toLowerCase();

        if (!ROUTES[route]) {
            return DEFAULT_ROUTE;
        }

        return route;
    }

    function getHashRoute() {
        const hash = window.location.hash;

        if (!hash) {
            return null;
        }

        return normalizeRoute(hash);
    }

    function updateHash(route) {
        const cleanRoute = normalizeRoute(route);
        const newHash = "#" + cleanRoute;

        if (window.location.hash !== newHash) {
            history.replaceState(
                null,
                "",
                window.location.pathname +
                window.location.search +
                newHash
            );
        }
    }

    /* =====================================================
       ROUTE GUARDS
       ===================================================== */

    function canEnterRoute(route) {
        route = normalizeRoute(route);

        if (route === "loading") {
            return true;
        }

        if (route === "start") {
            return true;
        }

        if (route === "character") {
            return true;
        }

        if (route === "dashboard") {
            if (!hasPlayer()) {
                console.warn(
                    "[ROUTER] Dashboard requested without player."
                );

                return false;
            }

            return true;
        }

        if (route === "creator") {
            if (!isCreatorAuthenticated()) {
                console.warn(
                    "[ROUTER] Creator route blocked."
                );

                return false;
            }

            return true;
        }

        return false;
    }

    function getFallbackRoute(route) {
        route = normalizeRoute(route);

        if (route === "dashboard" && !hasPlayer()) {
            return "start";
        }

        if (route === "creator" && !isCreatorAuthenticated()) {
            return hasPlayer() ? "dashboard" : "start";
        }

        return route;
    }

    /* =====================================================
       DASHBOARD PAGE
       ===================================================== */

    function openDashboardPage(page) {
        page = String(page || "home").toLowerCase();

        console.log(
            "[ROUTER] Dashboard page:",
            page
        );

        /*
         * Dashboard pada index.html saat ini adalah
         * satu screen:
         *
         * #main-dashboard
         *
         * Menu menggunakan:
         * [data-page="career"]
         * [data-page="club"]
         * [data-page="transfer"]
         * dst.
         *
         * Jadi router tidak mencari screen tambahan
         * yang belum ada.
         */

        if (!getElement(ROUTES.dashboard)) {
            console.error(
                "[ROUTER] Main dashboard not found."
            );

            return false;
        }

        /*
         * Jika nanti sistem UI memiliki renderer khusus,
         * router akan mencoba menjalankannya.
         */

        const rendererMap = {
            home: "renderHomePage",
            career: "renderCareerPage",
            club: "renderClubPage",
            transfer: "renderTransferPage",
            training: "renderTrainingPage",
            social: "renderSocialPage",
            trophies: "renderTrophiesPage",
            profile: "renderProfilePage",
            settings: "renderSettingsPage"
        };

        const rendererName = rendererMap[page];
       if (
    page === "transfer" &&
    window.RVSportsTransferPage &&
    typeof window.RVSportsTransferPage.render === "function"
) {
    window.RVSportsTransferPage.render();
}

        if (
            rendererName &&
            typeof window[rendererName] === "function"
        ) {
            try {
                window[rendererName]();
            } catch (error) {
                console.error(
                    "[ROUTER] Page renderer failed:",
                    rendererName,
                    error
                );
            }
        }

        /*
         * Simpan halaman dashboard aktif.
         */

        try {
            if (window.S && window.S.ui) {
                window.S.ui.currentPage = page;
            }
        } catch (error) {
            console.warn(
                "[ROUTER] Could not save current page.",
                error
            );
        }

        /*
         * Update active menu.
         */

        document
            .querySelectorAll("[data-page]")
            .forEach(function (button) {
                const buttonPage =
                    String(
                        button.getAttribute("data-page") || ""
                    ).toLowerCase();

                button.classList.toggle(
                    "active",
                    buttonPage === page
                );
            });

        return true;
    }

    /* =====================================================
       CREATOR EDITOR
       ===================================================== */

    function openCreatorEditor(editor) {
        editor = String(editor || "character").toLowerCase();

        console.log(
            "[ROUTER] Creator editor:",
            editor
        );

        if (!isCreatorAuthenticated()) {
            console.warn(
                "[ROUTER] Creator editor blocked."
            );

            return false;
        }

        const editorContainer =
            getElement("creator-editor");

        /*
         * Editor renderer names.
         *
         * File yang nanti akan menangani masing-masing
         * editor dapat mengekspos function global.
         */

        const rendererMap = {
            character: "renderCharacterEditor",
            economy: "renderEconomyEditor",
            career: "renderCareerEditor",
            clubs: "renderClubsEditor",
            trophies: "renderTrophiesEditor",
            world: "renderWorldEditor",
            social: "renderSocialEditor",
            god: "renderGodEditor",
            backup: "renderBackupEditor"
        };

        const rendererName = rendererMap[editor];

        if (
            rendererName &&
            typeof window[rendererName] === "function"
        ) {
            try {
                window[rendererName]();

                setActiveEditor(editor);

                return true;
            } catch (error) {
                console.error(
                    "[ROUTER] Creator renderer failed:",
                    rendererName,
                    error
                );

                return false;
            }
        }

        /*
         * Kalau editor belum dibuat, jangan bikin error.
         * Tampilkan status sementara.
         */

        if (editorContainer) {
            editorContainer.innerHTML = `
                <div class="creator-editor-placeholder">
                    <h3>${escapeHTML(
                        formatEditorName(editor)
                    )}</h3>

                    <p>
                        Editor ini belum diaktifkan.
                        Sistem router sudah siap menerima
                        modul editor tersebut.
                    </p>
                </div>
            `;
        }

        setActiveEditor(editor);

        return true;
    }

    function setActiveEditor(editor) {
        document
            .querySelectorAll("[data-editor]")
            .forEach(function (button) {
                const buttonEditor =
                    String(
                        button.getAttribute("data-editor") || ""
                    ).toLowerCase();

                button.classList.toggle(
                    "active",
                    buttonEditor === editor
                );
            });
    }

    function formatEditorName(editor) {
        const names = {
            character: "Character Editor",
            economy: "Economy Editor",
            career: "Career Editor",
            clubs: "Clubs Editor",
            trophies: "Trophies Editor",
            world: "World Editor",
            social: "Social Editor",
            god: "God Mode",
            backup: "Backup & Restore"
        };

        return names[editor] || "Creator Editor";
    }

    /* =====================================================
       HTML ESCAPE
       ===================================================== */

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       MAIN NAVIGATION
       ===================================================== */

    function navigate(route, options) {
        options = options || {};

        route = normalizeRoute(route);

        if (RouterState.navigating) {
            return false;
        }

        RouterState.navigating = true;

        try {
            const originalRoute = route;

            if (!canEnterRoute(route)) {
                route = getFallbackRoute(route);

                console.warn(
                    "[ROUTER] Route blocked:",
                    originalRoute,
                    "→ fallback:",
                    route
                );
            }

            const success = showRoute(route);

            if (!success) {
                console.error(
                    "[ROUTER] Navigation failed:",
                    route
                );

                return false;
            }

            RouterState.previousRoute =
                RouterState.currentRoute;

            RouterState.currentRoute = route;

            if (!options.skipHash) {
                updateHash(route);
            }

            /*
             * Route-specific initialization.
             */

            if (route === "dashboard") {
                openDashboardPage(
                    options.page ||
                    (
                        window.S &&
                        window.S.ui &&
                        window.S.ui.currentPage
                    ) ||
                    "home"
                );
            }

            if (route === "creator") {
                openCreatorEditor(
                    options.editor || "character"
                );
            }

            /*
             * Focus helper.
             */

            const screen = getRouteElement(route);

            if (screen) {
                const focusTarget =
                    screen.querySelector(
                        "input, button, select, textarea"
                    );

                if (
                    focusTarget &&
                    route !== "dashboard" &&
                    route !== "creator"
                ) {
                    setTimeout(function () {
                        try {
                            focusTarget.focus();
                        } catch (error) {
                            // Ignore focus errors.
                        }
                    }, 50);
                }
            }

            console.log(
                "[ROUTER] Navigated:",
                RouterState.previousRoute,
                "→",
                route
            );

            return true;

        } finally {
            RouterState.navigating = false;
        }
    }

    /* =====================================================
       DASHBOARD NAVIGATION
       ===================================================== */

    function navigateDashboardPage(page) {
        if (!hasPlayer()) {
            navigate("start");
            return false;
        }

        if (!showRoute("dashboard")) {
            return false;
        }

        RouterState.previousRoute =
            RouterState.currentRoute;

        RouterState.currentRoute =
            "dashboard";

        openDashboardPage(page);

        updateHash("dashboard");

        return true;
    }

    /* =====================================================
       CREATOR NAVIGATION
       ===================================================== */

    function navigateCreatorEditor(editor) {
        if (!isCreatorAuthenticated()) {
            console.warn(
                "[ROUTER] Creator access denied."
            );

            navigate(
                hasPlayer() ? "dashboard" : "start"
            );

            return false;
        }

        if (!showRoute("creator")) {
            return false;
        }

        RouterState.previousRoute =
            RouterState.currentRoute;

        RouterState.currentRoute =
            "creator";

        openCreatorEditor(editor);

        updateHash("creator");

        return true;
    }

    /* =====================================================
       EVENT DELEGATION
       ===================================================== */

    function bindNavigationEvents() {
        /*
         * Dashboard:
         * [data-page]
         */

        document.addEventListener(
            "click",
            function (event) {
                const pageButton =
                    event.target.closest("[data-page]");

                if (pageButton) {
                    event.preventDefault();

                    const page =
                        pageButton.getAttribute(
                            "data-page"
                        );

                    if (page) {
                        navigateDashboardPage(page);
                    }

                    return;
                }

                /*
                 * Creator:
                 * [data-editor]
                 */

                const editorButton =
                    event.target.closest("[data-editor]");

                if (editorButton) {
                    event.preventDefault();

                    const editor =
                        editorButton.getAttribute(
                            "data-editor"
                        );

                    if (editor) {
                        navigateCreatorEditor(editor);
                    }

                    return;
                }

                /*
                 * Creator close button
                 */

                const closeCreator =
                    event.target.closest(
                        "#creator-close-button"
                    );

                if (closeCreator) {
                    event.preventDefault();

                    navigate(
                        hasPlayer()
                            ? "dashboard"
                            : "start"
                    );
                }
            }
        );

        /*
         * Browser back / forward.
         */

        window.addEventListener(
            "popstate",
            function () {
                handleHashRoute();
            }
        );

        window.addEventListener(
            "hashchange",
            function () {
                handleHashRoute();
            }
        );
    }

    /* =====================================================
       HASH ROUTE HANDLER
       ===================================================== */

    function handleHashRoute() {
        if (RouterState.navigating) {
            return;
        }

        let route = getHashRoute();

        if (!route) {
            route = hasPlayer()
                ? "dashboard"
                : DEFAULT_ROUTE;
        }

        navigate(route, {
            skipHash: true
        });
    }

    /* =====================================================
       INITIAL ROUTE
       ===================================================== */

    function determineInitialRoute() {
        const hashRoute = getHashRoute();

        if (hashRoute) {
            if (
                hashRoute === "dashboard" &&
                !hasPlayer()
            ) {
                return "start";
            }

            if (
                hashRoute === "creator" &&
                !isCreatorAuthenticated()
            ) {
                return hasPlayer()
                    ? "dashboard"
                    : "start";
            }

            return hashRoute;
        }

        if (hasPlayer()) {
            return "dashboard";
        }

        return "start";
    }

    /* =====================================================
       INITIALIZE
       ===================================================== */

    function initializeRouter() {
        if (RouterState.initialized) {
            console.warn(
                "[ROUTER] Already initialized."
            );

            return;
        }

        bindNavigationEvents();

        RouterState.initialized = true;

        const initialRoute =
            determineInitialRoute();

        navigate(initialRoute);

        console.log(
            "[ROUTER] Initialized at:",
            RouterState.currentRoute
        );
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.Router = {
        version: ROUTER_VERSION,

        routes: ROUTES,

        state: RouterState,

        navigate: navigate,

        go: navigate,

        initialize: initializeRouter,

        init: initializeRouter,

        showRoute: showRoute,

        hideAllScreens: hideAllScreens,

        navigateDashboardPage:
            navigateDashboardPage,

        navigateCreatorEditor:
            navigateCreatorEditor,

        openDashboardPage:
            openDashboardPage,

        openCreatorEditor:
            openCreatorEditor,

        hasPlayer: hasPlayer,

        isCreatorAuthenticated:
            isCreatorAuthenticated,

        getCurrentRoute: function () {
            return RouterState.currentRoute;
        },

        getPreviousRoute: function () {
            return RouterState.previousRoute;
        }
    };

    /*
     * Global helper supaya modul lain bisa langsung
     * memanggil navigate("dashboard"), dll.
     */

    window.navigate = navigate;

    window.showRoute = showRoute;

    window.openDashboardPage =
        openDashboardPage;

    window.openCreatorEditor =
        openCreatorEditor;

    /* =====================================================
       AUTO START
       ===================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeRouter
        );
    } else {
        initializeRouter();
    }

    /* =====================================================
       DEBUG LOG
       ===================================================== */

    console.log(
        "RV SPORTS: FC CUP 26 Router loaded."
    );

    console.log(
        "[ROUTER] Version:",
        ROUTER_VERSION
    );

})();
