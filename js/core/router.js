/* =========================================================
   RV SPORTS: FC CUP 26
   ROUTER SYSTEM
   Compatible with current index.html
========================================================= */

"use strict";

/* =========================================================
   ROUTER CONFIG
========================================================= */

const ROUTER_VERSION = "2.0.0";

const ROUTES = {
    loading: {
        screenId: "loading-screen",
        requiresPlayer: false,
        type: "screen"
    },

    start: {
        screenId: "start-screen",
        requiresPlayer: false,
        type: "screen"
    },

    character: {
        screenId: "character-creation-screen",
        requiresPlayer: false,
        type: "screen"
    },

    dashboard: {
        screenId: "main-dashboard",
        requiresPlayer: true,
        type: "screen"
    },

    creator: {
        screenId: "creator-screen",
        requiresPlayer: true,
        creatorOnly: true,
        type: "screen"
    }
};


/* =========================================================
   STATE
========================================================= */

const RouterState = {
    currentRoute: "loading",
    previousRoute: null,
    initialized: false,
    navigating: false,
    history: [],
    currentPage: "home",
    currentEditor: null
};


/* =========================================================
   BASIC HELPERS
========================================================= */

function routerElement(id) {
    return document.getElementById(id);
}


function routerHasPlayer() {
    try {
        return (
            typeof S !== "undefined" &&
            S &&
            S.player &&
            S.player.name &&
            String(S.player.name).trim() !== ""
        );
    } catch (error) {
        return false;
    }
}


function routerIsCreator() {
    try {
        return (
            typeof S !== "undefined" &&
            S &&
            S.admin &&
            S.admin.creatorMode === true &&
            S.admin.authenticated === true
        );
    } catch (error) {
        return false;
    }
}


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function getAllScreens() {
    return Array.from(
        document.querySelectorAll(".screen")
    );
}


function hideAllScreens() {
    const screens = getAllScreens();

    screens.forEach(function(screen) {
        screen.classList.add("hidden");
        screen.setAttribute("aria-hidden", "true");
    });
}


function showScreenById(screenId) {
    const screen = routerElement(screenId);

    if (!screen) {
        console.error(
            "[ROUTER] Screen not found:",
            screenId
        );

        return false;
    }

    hideAllScreens();

    screen.classList.remove("hidden");
    screen.setAttribute("aria-hidden", "false");

    return true;
}


/* =========================================================
   ROUTE ACCESS
========================================================= */

function canAccessRoute(routeName) {
    const route = ROUTES[routeName];

    if (!route) {
        return false;
    }

    if (route.requiresPlayer && !routerHasPlayer()) {
        return false;
    }

    if (route.creatorOnly && !routerIsCreator()) {
        return false;
    }

    return true;
}


function getFallbackRoute(routeName) {
    if (routeName === "creator") {
        return routerHasPlayer()
            ? "dashboard"
            : "start";
    }

    if (
        routeName === "dashboard" ||
        routeName === "character"
    ) {
        return routerHasPlayer()
            ? "dashboard"
            : "start";
    }

    return "start";
}


/* =========================================================
   URL / HASH
========================================================= */

function routeToHash(routeName) {
    return "#" + routeName;
}


function hashToRoute() {
    const hash = window.location.hash;

    if (!hash) {
        return null;
    }

    return hash
        .replace(/^#/, "")
        .trim()
        .toLowerCase();
}


function updateURL(routeName, replace) {
    const hash = routeToHash(routeName);

    if (replace) {
        history.replaceState(
            {
                route: routeName
            },
            "",
            hash
        );
    } else {
        history.pushState(
            {
                route: routeName
            },
            "",
            hash
        );
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

function navigate(routeName, options) {
    options = options || {};

    if (RouterState.navigating) {
        return false;
    }

    routeName = String(routeName || "")
        .trim()
        .toLowerCase();

    if (!routeName) {
        return false;
    }

    const route = ROUTES[routeName];

    if (!route) {
        console.warn(
            "[ROUTER] Unknown route:",
            routeName
        );

        return false;
    }

    if (!canAccessRoute(routeName)) {
        const fallback = getFallbackRoute(routeName);

        if (fallback !== routeName) {
            return navigate(fallback, {
                replace: true,
                silent: options.silent
            });
        }

        return false;
    }

    RouterState.navigating = true;

    try {
        const previous = RouterState.currentRoute;

        if (
            previous &&
            previous !== routeName
        ) {
            RouterState.previousRoute = previous;

            RouterState.history.push(
                previous
            );

            if (RouterState.history.length > 30) {
                RouterState.history.shift();
            }
        }

        const success = showScreenById(
            route.screenId
        );

        if (!success) {
            return false;
        }

        RouterState.currentRoute = routeName;

        if (
            routeName === "dashboard"
        ) {
            RouterState.currentPage = "home";
        }

        if (!options.skipURL) {
            updateURL(
                routeName,
                options.replace === true
            );
        }

        syncNavigationUI(routeName);

        runRouteEnter(routeName);

        console.log(
            "[ROUTER] Navigated:",
            previous,
            "→",
            routeName
        );

        return true;

    } finally {
        RouterState.navigating = false;
    }
}


/* =========================================================
   ROUTE ENTER
========================================================= */

function runRouteEnter(routeName) {

    try {

        switch (routeName) {

            case "start":
                runStartRoute();
                break;

            case "character":
                runCharacterRoute();
                break;

            case "dashboard":
                runDashboardRoute();
                break;

            case "creator":
                runCreatorRoute();
                break;

            case "loading":
                break;
        }

    } catch (error) {

        console.error(
            "[ROUTER] Route enter error:",
            routeName,
            error
        );

    }
}


/* =========================================================
   START ROUTE
========================================================= */

function runStartRoute() {

    const emailInput =
        routerElement("player-email");

    const nameInput =
        routerElement("player-account-name");

    if (emailInput) {
        emailInput.focus();
    }

    if (routerHasPlayer()) {

        if (nameInput) {
            nameInput.value =
                S.player.name || "";
        }

        if (
            emailInput &&
            S.player.email
        ) {
            emailInput.value =
                S.player.email;
        }
    }
}


/* =========================================================
   CHARACTER ROUTE
========================================================= */

function runCharacterRoute() {

    if (typeof populateCountrySelect === "function") {
        try {
            populateCountrySelect();
        } catch (error) {
            console.warn(
                "[ROUTER] Country selector unavailable."
            );
        }
    }

    if (typeof updateCharacterPreview === "function") {
        try {
            updateCharacterPreview();
        } catch (error) {
            console.warn(
                "[ROUTER] Character preview unavailable."
            );
        }
    }
}


/* =========================================================
   DASHBOARD ROUTE
========================================================= */

function runDashboardRoute() {

    if (
        typeof updateDashboard === "function"
    ) {
        try {
            updateDashboard();
        } catch (error) {
            console.warn(
                "[ROUTER] Dashboard update unavailable."
            );
        }
    }

    if (
        typeof updatePlayerCard === "function"
    ) {
        try {
            updatePlayerCard();
        } catch (error) {
            console.warn(
                "[ROUTER] Player card update unavailable."
            );
        }
    }

    if (
        typeof refreshNavbar === "function"
    ) {
        try {
            refreshNavbar();
        } catch (error) {
            console.warn(
                "[ROUTER] Navbar refresh unavailable."
            );
        }
    }
}


/* =========================================================
   CREATOR ROUTE
========================================================= */

function runCreatorRoute() {

    if (!routerIsCreator()) {
        console.warn(
            "[ROUTER] Creator access denied."
        );

        navigate("dashboard", {
            replace: true
        });

        return;
    }

    if (
        typeof refreshCreatorConsole === "function"
    ) {
        try {
            refreshCreatorConsole();
        } catch (error) {
            console.warn(
                "[ROUTER] Creator console refresh unavailable."
            );
        }
    }

    if (
        typeof renderCreatorLog === "function"
    ) {
        try {
            renderCreatorLog();
        } catch (error) {
            console.warn(
                "[ROUTER] Creator log unavailable."
            );
        }
    }
}


/* =========================================================
   DASHBOARD SUB-PAGES
========================================================= */

/*
   Dashboard sub-pages do NOT have separate screens
   in the current index.html.

   Therefore these functions notify the corresponding
   system/UI module instead of looking for:
   career-screen, club-screen, etc.
*/

function openDashboardPage(pageName) {

    pageName = String(pageName || "")
        .trim()
        .toLowerCase();

    const validPages = [
        "home",
        "career",
        "club",
        "transfer",
        "training",
        "social",
        "trophies",
        "profile",
        "settings"
    ];

    if (!validPages.includes(pageName)) {

        console.warn(
            "[ROUTER] Unknown dashboard page:",
            pageName
        );

        return false;
    }

    if (!routerHasPlayer()) {
        navigate("start");
        return false;
    }

    RouterState.currentPage =
        pageName;

    updateDashboardNavigation(
        pageName
    );

    /*
       Home remains inside the dashboard.
    */

    if (pageName === "home") {
        navigate("dashboard", {
            skipURL: true
        });

        return true;
    }

    /*
       If a UI page renderer exists,
       let that module handle it.
    */

    const rendererName =
        "open" +
        capitalize(pageName) +
        "Page";

    if (
        typeof window[rendererName] ===
        "function"
    ) {

        try {

            window[rendererName]();

            console.log(
                "[ROUTER] Dashboard page opened:",
                pageName
            );

            return true;

        } catch (error) {

            console.error(
                "[ROUTER] Page renderer error:",
                pageName,
                error
            );

            return false;
        }
    }

    /*
       Until the page module exists,
       stay safely on dashboard.
    */

    console.log(
        "[ROUTER] Page module not ready yet:",
        pageName
    );

    navigate("dashboard", {
        skipURL: true
    });

    return true;
}


/* =========================================================
   CREATOR EDITORS
========================================================= */

function openCreatorEditor(editorName) {

    if (!routerIsCreator()) {
        console.warn(
            "[ROUTER] Creator mode is not active."
        );

        return false;
    }

    editorName = String(editorName || "")
        .trim()
        .toLowerCase();

    const validEditors = [
        "character",
        "economy",
        "career",
        "clubs",
        "trophies",
        "world",
        "social",
        "god",
        "backup"
    ];

    if (!validEditors.includes(editorName)) {

        console.warn(
            "[ROUTER] Unknown creator editor:",
            editorName
        );

        return false;
    }

    RouterState.currentEditor =
        editorName;

    const editorContainer =
        routerElement("creator-editor");

    if (!editorContainer) {
        console.error(
            "[ROUTER] #creator-editor not found."
        );

        return false;
    }

    /*
       Map editor names to renderer functions.
    */

    const rendererMap = {

        character:
            "renderCharacterEditor",

        economy:
            "renderEconomyEditor",

        career:
            "renderCareerEditor",

        clubs:
            "renderClubHistoryEditor",

        trophies:
            "renderTrophyEditor",

        world:
            "renderWorldEditor",

        social:
            "renderSocialEditor",

        god:
            "renderGodModeEditor",

        backup:
            "renderBackupEditor"
    };

    const rendererName =
        rendererMap[editorName];

    if (
        rendererName &&
        typeof window[rendererName] ===
        "function"
    ) {

        try {

            window[rendererName]();

            updateCreatorEditorNavigation(
                editorName
            );

            console.log(
                "[ROUTER] Creator editor opened:",
                editorName
            );

            return true;

        } catch (error) {

            console.error(
                "[ROUTER] Creator editor error:",
                editorName,
                error
            );

            return false;
        }
    }

    /*
       Editor belum dibuat.
       Jangan error, tampilkan placeholder.
    */

    editorContainer.innerHTML = `
        <div class="empty-editor">
            <h3>${escapeRouterHTML(
                getEditorTitle(editorName)
            )}</h3>

            <p>
                Editor ini sedang disiapkan.
            </p>
        </div>
    `;

    updateCreatorEditorNavigation(
        editorName
    );

    console.log(
        "[ROUTER] Creator editor placeholder:",
        editorName
    );

    return true;
}


/* =========================================================
   NAVIGATION UI
========================================================= */

function syncNavigationUI(routeName) {

    const bottomItems =
        document.querySelectorAll(
            ".bottom-nav-item"
        );

    bottomItems.forEach(function(item) {

        const page =
            item.dataset.page;

        item.classList.toggle(
            "active",
            routeName === "dashboard" &&
            page === RouterState.currentPage
        );
    });

    updateDashboardNavigation(
        RouterState.currentPage
    );
}


function updateDashboardNavigation(
    pageName
) {

    const items =
        document.querySelectorAll(
            "[data-page]"
        );

    items.forEach(function(item) {

        const page =
            item.dataset.page;

        if (!page) {
            return;
        }

        item.classList.toggle(
            "active",
            page === pageName
        );
    });
}


function updateCreatorEditorNavigation(
    editorName
) {

    const items =
        document.querySelectorAll(
            "[data-editor]"
        );

    items.forEach(function(item) {

        item.classList.toggle(
            "active",
            item.dataset.editor === editorName
        );
    });
}


/* =========================================================
   BACK / HOME
========================================================= */

function goBack() {

    if (
        RouterState.history.length > 0
    ) {

        const previous =
            RouterState.history.pop();

        if (
            previous &&
            ROUTES[previous]
        ) {

            return navigate(
                previous,
                {
                    skipURL: false
                }
            );
        }
    }

    return goHome();
}


function goHome() {

    if (routerHasPlayer()) {
        return navigate("dashboard");
    }

    return navigate("start");
}


/* =========================================================
   CREATOR
========================================================= */

function openCreator() {

    if (!routerHasPlayer()) {
        navigate("start");
        return false;
    }

    if (!routerIsCreator()) {

        console.warn(
            "[ROUTER] Creator Mode unavailable."
        );

        return false;
    }

    return navigate("creator");
}


function closeCreator() {

    RouterState.currentEditor =
        null;

    return navigate("dashboard");
}


/* =========================================================
   EVENT HANDLERS
========================================================= */

function setupRouterEvents() {

    /*
       Browser back / forward
    */

    window.addEventListener(
        "popstate",
        function() {

            const route =
                hashToRoute();

            if (
                route &&
                ROUTES[route]
            ) {

                navigate(route, {
                    skipURL: true
                });

            } else {

                goHome();
            }
        }
    );


    /*
       Hash changes
    */

    window.addEventListener(
        "hashchange",
        function() {

            const route =
                hashToRoute();

            if (
                route &&
                ROUTES[route]
            ) {

                navigate(route, {
                    skipURL: true
                });
            }
        }
    );


    /*
       Dashboard menu
    */

    document.addEventListener(
        "click",
        function(event) {

            const pageButton =
                event.target.closest(
                    "[data-page]"
                );

            if (!pageButton) {
                return;
            }

            const page =
                pageButton.dataset.page;

            if (!page) {
                return;
            }

            /*
               Creator buttons don't use
               data-page, so this is safe.
            */

            if (
                RouterState.currentRoute !==
                "dashboard"
            ) {

                if (!routerHasPlayer()) {
                    return;
                }

                navigate("dashboard", {
                    skipURL: true
                });
            }

            openDashboardPage(page);
        }
    );


    /*
       Creator menu
    */

    document.addEventListener(
        "click",
        function(event) {

            const editorButton =
                event.target.closest(
                    "[data-editor]"
                );

            if (!editorButton) {
                return;
            }

            const editor =
                editorButton.dataset.editor;

            if (!editor) {
                return;
            }

            openCreatorEditor(editor);
        }
    );


    /*
       Creator close
    */

    const creatorClose =
        routerElement(
            "creator-close-button"
        );

    if (creatorClose) {

        creatorClose.addEventListener(
            "click",
            function() {
                closeCreator();
            }
        );
    }
}


/* =========================================================
   INITIAL ROUTE
========================================================= */

function determineInitialRoute() {

    const requested =
        hashToRoute();

    /*
       If player already exists,
       dashboard is preferred.
    */

    if (routerHasPlayer()) {

        if (
            requested &&
            ROUTES[requested] &&
            canAccessRoute(requested)
        ) {

            return requested;
        }

        return "dashboard";
    }

    /*
       New game starts at Start screen.
    */

    if (
        requested === "character"
    ) {
        return "character";
    }

    if (
        requested === "start"
    ) {
        return "start";
    }

    return "start";
}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeRouter() {

    if (RouterState.initialized) {
        return true;
    }

    setupRouterEvents();

    const initialRoute =
        determineInitialRoute();

    /*
       Replace URL instead of adding
       unnecessary browser history.
    */

    navigate(
        initialRoute,
        {
            replace: true
        }
    );

    RouterState.initialized = true;

    console.log(
        "[ROUTER] Initialized at:",
        RouterState.currentRoute
    );

    return true;
}


/* =========================================================
   GETTERS
========================================================= */

function getCurrentRoute() {
    return RouterState.currentRoute;
}


function getPreviousRoute() {
    return RouterState.previousRoute;
}


function getCurrentPage() {
    return RouterState.currentPage;
}


function getCurrentEditor() {
    return RouterState.currentEditor;
}


function isDashboard() {
    return (
        RouterState.currentRoute ===
        "dashboard"
    );
}


function isCreator() {
    return (
        RouterState.currentRoute ===
        "creator"
    );
}


/* =========================================================
   UTILS
========================================================= */

function capitalize(value) {

    value = String(value || "");

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}


function escapeRouterHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GLOBAL API
========================================================= */

window.ROUTES = ROUTES;
window.RouterState = RouterState;

window.navigate = navigate;
window.goBack = goBack;
window.goHome = goHome;

window.openCreator = openCreator;
window.closeCreator = closeCreator;

window.openDashboardPage =
    openDashboardPage;

window.openCreatorEditor =
    openCreatorEditor;

window.getCurrentRoute =
    getCurrentRoute;

window.getPreviousRoute =
    getPreviousRoute;

window.getCurrentPage =
    getCurrentPage;

window.getCurrentEditor =
    getCurrentEditor;

window.isDashboard =
    isDashboard;

window.isCreator =
    isCreator;

window.initializeRouter =
    initializeRouter;


/* =========================================================
   READY
========================================================= */

console.log(
    "RV SPORTS: FC CUP 26 Router loaded."
);

console.log(
    "[ROUTER] Version:",
    ROUTER_VERSION
);
