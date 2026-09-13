(function () {
    "use strict";

    const VERSION = "1.0.0";
    const MODAL_ID = "global-modal";

    let activeModal = null;
    let previousFocusedElement = null;

    function log() {
        console.log("[MODAL]", ...arguments);
    }

    function warn() {
        console.warn("[MODAL]", ...arguments);
    }

    function getModal() {
        const modal = document.getElementById(MODAL_ID);

        if (!modal) {
            warn("Global modal tidak ditemukan.");
            return null;
        }

        return modal;
    }

    function getModalContent() {
        const modal = getModal();

        if (!modal) {
            return null;
        }

        return (
            modal.querySelector(".modal-content") ||
            modal.querySelector(".modal-body") ||
            modal
        );
    }

    function normalizeText(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value);
    }

    function clearModal() {
        const modal = getModal();

        if (!modal) {
            return;
        }

        const content = getModalContent();

        if (content) {
            content.innerHTML = "";
        }
    }

    function show(options) {
        const modal = getModal();

        if (!modal) {
            return false;
        }

        if (typeof options === "string") {
            options = {
                title: "",
                message: options
            };
        }

        options = options || {};

        const title = normalizeText(options.title);
        const message = normalizeText(options.message);
        const content = getModalContent();

        if (!content) {
            warn("Modal content tidak ditemukan.");
            return false;
        }

        previousFocusedElement = document.activeElement;

        clearModal();

        const wrapper = document.createElement("div");
        wrapper.className = "rv-modal-wrapper";

        if (title) {
            const titleElement = document.createElement("h2");
            titleElement.className = "rv-modal-title";
            titleElement.textContent = title;
            wrapper.appendChild(titleElement);
        }

        if (message) {
            const messageElement = document.createElement("div");
            messageElement.className = "rv-modal-message";
            messageElement.textContent = message;
            wrapper.appendChild(messageElement);
        }

        const closeButton = document.createElement("button");

        closeButton.type = "button";
        closeButton.className = "rv-modal-close";
        closeButton.textContent = "Tutup";
        closeButton.setAttribute(
            "aria-label",
            "Tutup dialog"
        );

        closeButton.addEventListener("click", function () {
            close();
        });

        wrapper.appendChild(closeButton);
        content.appendChild(wrapper);

        modal.classList.remove("hidden");
        modal.classList.add("rv-modal-open");

        modal.setAttribute("aria-hidden", "false");

        activeModal = modal;

        window.setTimeout(function () {
            closeButton.focus();
        }, 0);

        log("Modal opened:", title || "Untitled");

        return true;
    }

    function showHTML(options) {
        const modal = getModal();

        if (!modal) {
            return false;
        }

        options = options || {};

        const content = getModalContent();

        if (!content) {
            return false;
        }

        previousFocusedElement = document.activeElement;

        clearModal();

        const wrapper = document.createElement("div");
        wrapper.className = "rv-modal-wrapper";

        if (options.title) {
            const titleElement = document.createElement("h2");
            titleElement.className = "rv-modal-title";
            titleElement.textContent = normalizeText(
                options.title
            );

            wrapper.appendChild(titleElement);
        }

        const body = document.createElement("div");
        body.className = "rv-modal-body";

        body.innerHTML = normalizeText(options.html);

        wrapper.appendChild(body);

        const closeButton = document.createElement("button");

        closeButton.type = "button";
        closeButton.className = "rv-modal-close";
        closeButton.textContent = "Tutup";

        closeButton.addEventListener("click", function () {
            close();
        });

        wrapper.appendChild(closeButton);

        content.appendChild(wrapper);

        modal.classList.remove("hidden");
        modal.classList.add("rv-modal-open");

        modal.setAttribute("aria-hidden", "false");

        activeModal = modal;

        closeButton.focus();

        log("HTML modal opened.");

        return true;
    }

    function close() {
        const modal = activeModal || getModal();

        if (!modal) {
            return false;
        }

        modal.classList.remove("rv-modal-open");

        modal.classList.add("hidden");

        modal.setAttribute("aria-hidden", "true");

        clearModal();

        activeModal = null;

        if (
            previousFocusedElement &&
            typeof previousFocusedElement.focus === "function"
        ) {
            try {
                previousFocusedElement.focus();
            } catch (error) {
                warn("Gagal mengembalikan focus.");
            }
        }

        previousFocusedElement = null;

        log("Modal closed.");

        return true;
    }

    function isOpen() {
        return !!activeModal;
    }

    function confirm(options) {
        options = options || {};

        return new Promise(function (resolve) {
            const modal = getModal();

            if (!modal) {
                resolve(false);
                return;
            }

            const content = getModalContent();

            if (!content) {
                resolve(false);
                return;
            }

            previousFocusedElement = document.activeElement;

            clearModal();

            const wrapper = document.createElement("div");
            wrapper.className = "rv-modal-wrapper";

            const titleElement = document.createElement("h2");

            titleElement.className = "rv-modal-title";

            titleElement.textContent =
                normalizeText(options.title) ||
                "Konfirmasi";

            wrapper.appendChild(titleElement);

            const messageElement = document.createElement("div");

            messageElement.className = "rv-modal-message";

            messageElement.textContent =
                normalizeText(options.message) ||
                "Apakah kamu yakin?";

            wrapper.appendChild(messageElement);

            const actions = document.createElement("div");

            actions.className = "rv-modal-actions";

            const cancelButton =
                document.createElement("button");

            cancelButton.type = "button";
            cancelButton.className =
                "rv-modal-button rv-modal-cancel";

            cancelButton.textContent =
                options.cancelText || "Batal";

            const confirmButton =
                document.createElement("button");

            confirmButton.type = "button";
            confirmButton.className =
                "rv-modal-button rv-modal-confirm";

            confirmButton.textContent =
                options.confirmText || "Ya, lanjutkan";

            function finish(result) {
                close();
                resolve(result);
            }

            cancelButton.addEventListener(
                "click",
                function () {
                    finish(false);
                }
            );

            confirmButton.addEventListener(
                "click",
                function () {
                    finish(true);
                }
            );

            actions.appendChild(cancelButton);
            actions.appendChild(confirmButton);

            wrapper.appendChild(actions);

            content.appendChild(wrapper);

            modal.classList.remove("hidden");
            modal.classList.add("rv-modal-open");

            modal.setAttribute(
                "aria-hidden",
                "false"
            );

            activeModal = modal;

            confirmButton.focus();

            log("Confirmation modal opened.");
        });
    }

    function handleKeyboard(event) {
        if (!isOpen()) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            close();
        }
    }

    function handleBackdrop(event) {
        const modal = activeModal;

        if (!modal) {
            return;
        }

        if (event.target === modal) {
            close();
        }
    }

    function initialize() {
        const modal = getModal();

        if (!modal) {
            return false;
        }

        if (!modal.hasAttribute("aria-hidden")) {
            modal.setAttribute("aria-hidden", "true");
        }

        modal.addEventListener(
            "click",
            handleBackdrop
        );

        document.addEventListener(
            "keydown",
            handleKeyboard
        );

        log("Modal system initialized.");

        return true;
    }

    const API = {
        VERSION: VERSION,

        show: show,
        showHTML: showHTML,
        confirm: confirm,

        close: close,
        clear: clearModal,

        isOpen: isOpen,

        initialize: initialize
    };

    window.RVSportsModal = API;

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    } else {
        initialize();
    }

    log(
        "RV SPORTS: FC CUP 26 Modal System loaded."
    );

    log(
        "[MODAL] Version:",
        VERSION
    );

    log(
        "[MODAL] API available:",
        !!window.RVSportsModal
    );
})();
