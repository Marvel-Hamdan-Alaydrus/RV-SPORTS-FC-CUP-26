/*
==========================================================
RV SPORTS: FC CUP 26
NAVBAR SYSTEM
Version: 1.0.0
==========================================================
*/

(function () {
    "use strict";

    const SYSTEM_NAME = "RV SPORTS: FC CUP 26 Navbar";
    const VERSION = "1.0.0";

    let initialized = false;

    function log() {
        console.log("[NAVBAR]", ...arguments);
    }

    function warn() {
        console.warn("[NAVBAR]", ...arguments);
    }

    function getRouter() {
        return window.RVSportsRouter || null;
    }

    function getApp() {
        return window.App || null;
    }

    function getButtons() {
        return Array.from(document.querySelectorAll("[data-page]"));
    }

    function clearActiveState() {
        getButtons().forEach(function (button) {
            button.classList.remove("active");
            button.removeAttribute("aria-current");
        });
    }

    function setActivePage(page) {
        if (!page) return;

        getButtons().forEach(function (button) {
            const buttonPage = button.dataset.page;

            if (buttonPage === page) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            } else {
                button.classList.remove("active");
                button.removeAttribute("aria-current");
            }
        });
    }

    function navigate(page) {
        if (!page) {
            warn("Navigation page kosong.");
            return;
        }

        log("Navigate:", page);

        setActivePage(page);

        const router = getRouter();

        if (router) {
            try {
                if (typeof router.navigate === "function") {
                    router.navigate(page);
                    return;
                }

                if (typeof router.go === "function") {
                    router.go(page);
                    return;
                }

                if (typeof router.route === "function") {
                    router.route(page);
                    return;
                }
            } catch (error) {
                console.error("[NAVBAR] Router error:", error);
            }
        }

        const app = getApp();

        if (app && typeof app.navigate === "function") {
            try {
                app.navigate(page);
                return;
            } catch (error) {
                console.error("[NAVBAR] App navigation error:", error);
            }
        }

        /*
         * Untuk sekarang, kalau router/app belum punya handler
         * halaman tertentu, kita tetap simpan active state.
         *
         * Ini sengaja dibuat aman supaya navbar tidak bikin
         * seluruh aplikasi error.
         */
        log("No navigation handler available for:", page);
    }

    function handleClick(event) {
        const button = event.currentTarget;

        if (!button) return;

        const page = button.dataset.page;

        if (!page) {
            warn("Button data-page kosong:", button);
            return;
        }

        event.preventDefault();

        navigate(page);
    }

    function bindButtons() {
        const buttons = getButtons();

        if (!buttons.length) {
            warn("Tidak ada element [data-page] ditemukan.");
            return 0;
        }

        buttons.forEach(function (button) {
            if (button.dataset.navbarBound === "true") {
                return;
            }

            button.addEventListener("click", handleClick);

            button.dataset.navbarBound = "true";

            if (!button.getAttribute("type")) {
                button.setAttribute("type", "button");
            }
        });

        log("Navigation buttons bound:", buttons.length);

        return buttons.length;
    }

    function initialize() {
        if (initialized) {
            log("Navbar sudah initialized.");
            return true;
        }

        bindButtons();

        initialized = true;

        log(SYSTEM_NAME + " loaded.");
        log("Version:", VERSION);
        log("API available:", true);

        return true;
    }

    function refresh() {
        bindButtons();
    }

    function activate(page) {
        setActivePage(page);
    }

    function getCurrentPage() {
        const activeButton = document.querySelector(
            '[data-page].active'
        );

        return activeButton
            ? activeButton.dataset.page
            : null;
    }

    function destroy() {
        const buttons = getButtons();

        buttons.forEach(function (button) {
            if (button.dataset.navbarBound === "true") {
                button.removeEventListener("click", handleClick);
                delete button.dataset.navbarBound;
            }
        });

        clearActiveState();

        initialized = false;

        log("Navbar destroyed.");
    }

    window.RVSportsNavbar = {
        initialize: initialize,
        refresh: refresh,
        navigate: navigate,
        activate: activate,
        getCurrentPage: getCurrentPage,
        clearActiveState: clearActiveState,
        destroy: destroy,
        version: VERSION
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }

})();
