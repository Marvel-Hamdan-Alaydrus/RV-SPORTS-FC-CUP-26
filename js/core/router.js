/* =========================================================
   RV SPORTS: FC CUP 26
   js/core/router.js
   Screen Navigation / Router
   ========================================================= */


/* =========================================================
   ROUTES
   ========================================================= */

const ROUTES = {
  LOADING: "loading",
  START: "start",
  CREATE: "create",
  DASHBOARD: "dashboard",

  CAREER: "career",
  CLUB: "club",
  TRANSFER: "transfer",
  TRAINING: "training",
  SOCIAL: "social",
  TROPHIES: "trophies",
  PROFILE: "profile",
  SETTINGS: "settings",

  CREATOR: "creator",
  CREATOR_CHARACTER: "creator-character",
  CREATOR_ECONOMY: "creator-economy",
  CREATOR_CAREER: "creator-career",
  CREATOR_CLUB_HISTORY: "creator-club-history",
  CREATOR_TROPHIES: "creator-trophies",
  CREATOR_WORLD: "creator-world",
  CREATOR_SOCIAL: "creator-social",
  CREATOR_GOD: "creator-god",
  CREATOR_BACKUP: "creator-backup"
};


/* =========================================================
   ROUTER STATE
   ========================================================= */

const RouterState = {
  current: ROUTES.LOADING,
  previous: null,
  history: [],
  initialized: false
};


/* =========================================================
   ROUTE MAP
   ========================================================= */

const ROUTE_MAP = {

  [ROUTES.LOADING]: {
    screen: "loadingScreen",
    requiresCareer: false,
    creatorOnly: false
  },

  [ROUTES.START]: {
    screen: "startScreen",
    requiresCareer: false,
    creatorOnly: false
  },

  [ROUTES.CREATE]: {
    screen: "createScreen",
    requiresCareer: false,
    creatorOnly: false
  },

  [ROUTES.DASHBOARD]: {
    screen: "dashboardScreen",
    requiresCareer: true,
    creatorOnly: false
  },

  [ROUTES.CAREER]: {
    screen: "careerScreen",
    requiresCareer: true,
    creatorOnly: false
  },

  [ROUTES.CLUB]: {
    screen: "clubScreen",
    requiresCareer: true,
    creatorOnly: false
  },

  [ROUTES.TRANSFER]: {
    screen: "transferScreen",
    requiresCareer: true,
    creatorOnly: false
  },

  [ROUTES.TRAINING]: {
    screen: "trainingScreen",
    requiresCareer: true,
    creatorOnly: false
  },

  [ROUTES.SOCIAL]: {
    screen: "socialScreen",
    requiresCareer: true,
    creatorOnly: false
  },

  [ROUTES.TROPHIES]: {
    screen: "trophiesScreen",
    requiresCareer: true,
    creatorOnly: false
  },

  [ROUTES.PROFILE]: {
    screen: "profileScreen",
    requiresCareer: true,
    creatorOnly: false
  },

  [ROUTES.SETTINGS]: {
    screen: "settingsScreen",
    requiresCareer: false,
    creatorOnly: false
  },

  [ROUTES.CREATOR]: {
    screen: "creatorScreen",
    requiresCareer: false,
    creatorOnly: true
  },

  [ROUTES.CREATOR_CHARACTER]: {
    screen: "creatorCharacterScreen",
    requiresCareer: false,
    creatorOnly: true
  },

  [ROUTES.CREATOR_ECONOMY]: {
    screen: "creatorEconomyScreen",
    requiresCareer: false,
    creatorOnly: true
  },

  [ROUTES.CREATOR_CAREER]: {
    screen: "creatorCareerScreen",
    requiresCareer: false,
    creatorOnly: true
  },

  [ROUTES.CREATOR_CLUB_HISTORY]: {
    screen: "creatorClubHistoryScreen",
    requiresCareer: false,
    creatorOnly: true
  },

  [ROUTES.CREATOR_TROPHIES]: {
    screen: "creatorTrophiesScreen",
    requiresCareer: false,
    creatorOnly: true
  },

  [ROUTES.CREATOR_WORLD]: {
    screen: "creatorWorldScreen",
    requiresCareer: false,
    creatorOnly: true
  },

  [ROUTES.CREATOR_SOCIAL]: {
    screen: "creatorSocialScreen",
    requiresCareer: false,
    creatorOnly: true
  },

  [ROUTES.CREATOR_GOD]: {
    screen: "creatorGodScreen",
    requiresCareer: false,
    creatorOnly: true
  },

  [ROUTES.CREATOR_BACKUP]: {
    screen: "creatorBackupScreen",
    requiresCareer: false,
    creatorOnly: true
  }
};


/* =========================================================
   ROUTE VALIDATION
   ========================================================= */

function routeExists(route) {
  return Object.prototype.hasOwnProperty.call(
    ROUTE_MAP,
    route
  );
}


function canAccessRoute(route) {

  if (!routeExists(route)) {
    return false;
  }

  const config = ROUTE_MAP[route];

  /*
    Career-required routes
  */

  if (
    config.requiresCareer &&
    !S.career?.started
  ) {
    return false;
  }

  /*
    Creator-only routes
  */

  if (
    config.creatorOnly &&
    S.admin?.creatorMode !== true
  ) {
    return false;
  }

  return true;
}


/* =========================================================
   SCREEN HELPERS
   ========================================================= */

function getAllScreens() {
  return Object.values(
    ROUTE_MAP
  )
    .map(route => route.screen)
    .filter(Boolean);
}


function getScreenElement(route) {

  const config =
    ROUTE_MAP[route];

  if (!config) {
    return null;
  }

  return document.getElementById(
    config.screen
  );
}


function hideAllScreens() {

  const screens =
    getAllScreens();

  screens.forEach(screenId => {

    const screen =
      document.getElementById(
        screenId
      );

    if (!screen) {
      return;
    }

    screen.classList.remove(
      "active"
    );

    screen.classList.add(
      "hidden"
    );

    screen.setAttribute(
      "aria-hidden",
      "true"
    );
  });
}


function showScreen(route) {

  const screen =
    getScreenElement(route);

  if (!screen) {
    console.warn(
      `[ROUTER] Screen not found for route: ${route}`
    );

    return false;
  }

  screen.classList.remove(
    "hidden"
  );

  screen.classList.add(
    "active"
  );

  screen.setAttribute(
    "aria-hidden",
    "false"
  );

  return true;
}


/* =========================================================
   ROUTE CHANGE
   ========================================================= */

function navigate(
  route,
  options = {}
) {

  if (!routeExists(route)) {

    console.warn(
      `[ROUTER] Unknown route: ${route}`
    );

    return false;
  }

  /*
    Access check
  */

  if (!canAccessRoute(route)) {

    console.warn(
      `[ROUTER] Access denied: ${route}`
    );

    handleRouteAccessDenied(
      route
    );

    return false;
  }

  const previousRoute =
    RouterState.current;

  /*
    Save previous route
  */

  if (
    previousRoute &&
    previousRoute !== route &&
    options.addHistory !== false
  ) {

    RouterState.history.push(
      previousRoute
    );

    /*
      Keep history manageable.
    */

    if (
      RouterState.history.length > 50
    ) {
      RouterState.history.shift();
    }
  }

  RouterState.previous =
    previousRoute;

  RouterState.current =
    route;

  /*
    Change screen
  */

  hideAllScreens();

  const displayed =
    showScreen(route);

  if (!displayed) {
    return false;
  }

  /*
    Update browser history.
  */

  if (
    options.browserHistory !== false
  ) {

    try {

      history.pushState(
        {
          route: route
        },
        "",
        `#${route}`
      );

    } catch (error) {

      console.warn(
        "[ROUTER] Browser history unavailable.",
        error
      );
    }
  }

  /*
    Route callback.
  */

  runRouteEnter(route);

  /*
    UI refresh.
  */

  updateNavigationUI(
    route
  );

  return true;
}


/* =========================================================
   GO BACK
   ========================================================= */

function goBack() {

  if (
    RouterState.history.length === 0
  ) {

    return navigate(
      ROUTES.DASHBOARD
    );
  }

  const previous =
    RouterState.history.pop();

  if (
    !previous ||
    !routeExists(previous)
  ) {

    return navigate(
      ROUTES.DASHBOARD
    );
  }

  return navigate(
    previous,
    {
      addHistory: false
    }
  );
}


/* =========================================================
   GO HOME
   ========================================================= */

function goHome() {

  if (
    S.career?.started
  ) {

    return navigate(
      ROUTES.DASHBOARD
    );
  }

  return navigate(
    ROUTES.START
  );
}


/* =========================================================
   CREATOR NAVIGATION
   ========================================================= */

function openCreator() {

  if (
    S.admin?.creatorMode !== true
  ) {

    showToast(
      "Creator Locked",
      "Creator Mode belum tersedia.",
      "warning"
    );

    return false;
  }

  return navigate(
    ROUTES.CREATOR
  );
}


function closeCreator() {

  if (
    S.career?.started
  ) {

    return navigate(
      ROUTES.DASHBOARD
    );
  }

  return navigate(
    ROUTES.START
  );
}


/* =========================================================
   ROUTE ACCESS DENIED
   ========================================================= */

function handleRouteAccessDenied(
  route
) {

  const config =
    ROUTE_MAP[route];

  if (!config) {
    return;
  }

  if (
    config.creatorOnly &&
    S.admin?.creatorMode !== true
  ) {

    showToast(
      "Creator Access",
      "Route ini hanya tersedia untuk Creator.",
      "warning"
    );

    return;
  }

  if (
    config.requiresCareer &&
    !S.career?.started
  ) {

    showToast(
      "Career Required",
      "Mulai career terlebih dahulu.",
      "warning"
    );

    navigate(
      ROUTES.START
    );

    return;
  }

  showToast(
    "Access Denied",
    "Kamu tidak bisa membuka halaman ini.",
    "error"
  );
}


/* =========================================================
   ROUTE ENTER EVENTS
   ========================================================= */

function runRouteEnter(route) {

  switch (route) {

    case ROUTES.START:

      if (
        typeof renderStartScreen ===
        "function"
      ) {
        renderStartScreen();
      }

      break;


    case ROUTES.CREATE:

      if (
        typeof renderCharacterCreation ===
        "function"
      ) {
        renderCharacterCreation();
      }

      break;


    case ROUTES.DASHBOARD:

      if (
        typeof renderDashboard ===
        "function"
      ) {
        renderDashboard();
      }

      break;


    case ROUTES.CAREER:

      if (
        typeof renderCareer ===
        "function"
      ) {
        renderCareer();
      }

      break;


    case ROUTES.CLUB:

      if (
        typeof renderClub ===
        "function"
      ) {
        renderClub();
      }

      break;


    case ROUTES.TRANSFER:

      if (
        typeof renderTransfer ===
        "function"
      ) {
        renderTransfer();
      }

      break;


    case ROUTES.TRAINING:

      if (
        typeof renderTraining ===
        "function"
      ) {
        renderTraining();
      }

      break;


    case ROUTES.SOCIAL:

      if (
        typeof renderSocial ===
        "function"
      ) {
        renderSocial();
      }

      break;


    case ROUTES.TROPHIES:

      if (
        typeof renderTrophies ===
        "function"
      ) {
        renderTrophies();
      }

      break;


    case ROUTES.PROFILE:

      if (
        typeof renderProfile ===
        "function"
      ) {
        renderProfile();
      }

      break;


    case ROUTES.SETTINGS:

      if (
        typeof renderSettings ===
        "function"
      ) {
        renderSettings();
      }

      break;


    case ROUTES.CREATOR:

      if (
        typeof renderCreatorConsole ===
        "function"
      ) {
        renderCreatorConsole();
      }

      break;


    case ROUTES.CREATOR_CHARACTER:

      if (
        typeof renderCreatorCharacterEditor ===
        "function"
      ) {
        renderCreatorCharacterEditor();
      }

      break;


    case ROUTES.CREATOR_ECONOMY:

      if (
        typeof renderCreatorEconomyEditor ===
        "function"
      ) {
        renderCreatorEconomyEditor();
      }

      break;


    case ROUTES.CREATOR_CAREER:

      if (
        typeof renderCreatorCareerEditor ===
        "function"
      ) {
        renderCreatorCareerEditor();
      }

      break;


    case ROUTES.CREATOR_CLUB_HISTORY:

      if (
        typeof renderCreatorClubHistory ===
        "function"
      ) {
        renderCreatorClubHistory();
      }

      break;


    case ROUTES.CREATOR_TROPHIES:

      if (
        typeof renderCreatorTrophyEditor ===
        "function"
      ) {
        renderCreatorTrophyEditor();
      }

      break;


    case ROUTES.CREATOR_WORLD:

      if (
        typeof renderCreatorWorldEditor ===
        "function"
      ) {
        renderCreatorWorldEditor();
      }

      break;


    case ROUTES.CREATOR_SOCIAL:

      if (
        typeof renderCreatorSocialEditor ===
        "function"
      ) {
        renderCreatorSocialEditor();
      }

      break;


    case ROUTES.CREATOR_GOD:

      if (
        typeof renderCreatorGodMode ===
        "function"
      ) {
        renderCreatorGodMode();
      }

      break;


    case ROUTES.CREATOR_BACKUP:

      if (
        typeof renderCreatorBackup ===
        "function"
      ) {
        renderCreatorBackup();
      }

      break;
  }
}


/* =========================================================
   NAVIGATION UI
   ========================================================= */

function updateNavigationUI(
  activeRoute
) {

  /*
    Bottom navigation
  */

  const navButtons =
    document.querySelectorAll(
      "[data-route]"
    );

  navButtons.forEach(button => {

    const route =
      button.dataset.route;

    if (
      route === activeRoute
    ) {

      button.classList.add(
        "active"
      );

      button.setAttribute(
        "aria-current",
        "page"
      );

    } else {

      button.classList.remove(
        "active"
      );

      button.removeAttribute(
        "aria-current"
      );
    }
  });


  /*
    Creator button
  */

  const creatorButtons =
    document.querySelectorAll(
      "[data-creator-route]"
    );

  creatorButtons.forEach(button => {

    const route =
      button.dataset.creatorRoute;

    button.classList.toggle(
      "active",
      route === activeRoute
    );
  });
}


/* =========================================================
   DATA-ROUTE CLICK HANDLER
   ========================================================= */

function initializeRouteButtons() {

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-route]"
        );

      if (!button) {
        return;
      }

      /*
        Jangan override external links
        atau disabled buttons.
      */

      if (
        button.disabled ||
        button.classList.contains(
          "disabled"
        )
      ) {
        return;
      }

      const route =
        button.dataset.route;

      if (!route) {
        return;
      }

      event.preventDefault();

      navigate(route);
    }
  );


  /*
    Creator routes
  */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-creator-route]"
        );

      if (!button) {
        return;
      }

      if (
        button.disabled ||
        button.classList.contains(
          "disabled"
        )
      ) {
        return;
      }

      const route =
        button.dataset.creatorRoute;

      if (!route) {
        return;
      }

      event.preventDefault();

      navigate(route);
    }
  );
}


/* =========================================================
   BROWSER BACK BUTTON
   ========================================================= */

function initializeBrowserNavigation() {

  window.addEventListener(
    "popstate",
    event => {

      const route =
        event.state?.route ||
        getRouteFromHash();

      if (
        route &&
        routeExists(route)
      ) {

        navigate(
          route,
          {
            addHistory: false,
            browserHistory: false
          }
        );

      } else {

        goBack();
      }
    }
  );
}


/* =========================================================
   HASH ROUTING
   ========================================================= */

function getRouteFromHash() {

  const hash =
    window.location.hash
      .replace(
        "#",
        ""
      )
      .trim();

  if (
    hash &&
    routeExists(hash)
  ) {
    return hash;
  }

  return null;
}


/* =========================================================
   INITIAL ROUTE
   ========================================================= */

function determineInitialRoute() {

  /*
    Kalau hash valid, gunakan hash.
  */

  const hashRoute =
    getRouteFromHash();

  if (
    hashRoute &&
    canAccessRoute(hashRoute)
  ) {

    return hashRoute;
  }


  /*
    Kalau career sudah dimulai,
    langsung dashboard.
  */

  if (
    S.career?.started === true
  ) {

    return ROUTES.DASHBOARD;
  }


  /*
    Kalau ada save tetapi career belum
    dimulai, tampilkan start.
  */

  if (
    typeof hasSaveGame ===
    "function" &&
    hasSaveGame()
  ) {

    return ROUTES.START;
  }


  /*
    Default.
  */

  return ROUTES.START;
}


/* =========================================================
   ROUTER INITIALIZATION
   ========================================================= */

function initializeRouter() {

  if (
    RouterState.initialized
  ) {
    return;
  }

  initializeRouteButtons();
  initializeBrowserNavigation();

  const initialRoute =
    determineInitialRoute();

  RouterState.current =
    initialRoute;

  RouterState.initialized =
    true;

  navigate(
    initialRoute,
    {
      addHistory: false,
      browserHistory: false
    }
  );

  console.log(
    `[ROUTER] Initialized at: ${initialRoute}`
  );
}


/* =========================================================
   ROUTER GETTERS
   ========================================================= */

function getCurrentRoute() {
  return RouterState.current;
}


function getPreviousRoute() {
  return RouterState.previous;
}


function getRouteHistory() {
  return [
    ...RouterState.history
  ];
}


/* =========================================================
   ROUTER READY
   ========================================================= */

const ROUTER_READY = true;

console.log(
  "RV SPORTS: FC CUP 26 Router loaded."
);
