(function () {
    "use strict";

    const VERSION = "1.0.0";
    const CONTAINER_ID = "toast-container";

    const DEFAULT_DURATION = 3500;
    const MAX_VISIBLE = 5;

    let toastCounter = 0;

    function log() {
        console.log("[NOTIFICATIONS]", ...arguments);
    }

    function warn() {
        console.warn("[NOTIFICATIONS]", ...arguments);
    }

    function getContainer() {
        let container = document.getElementById(CONTAINER_ID);

        if (container) {
            return container;
        }

        warn("Toast container tidak ditemukan.");

        return null;
    }

    function createToastElement(type, title, message) {
        const toast = document.createElement("div");

        toast.className = "rv-toast rv-toast-" + type;
        toast.dataset.toastId = "toast_" + (++toastCounter);

        toast.setAttribute("role", type === "error" ? "alert" : "status");

        const iconMap = {
            success: "✓",
            error: "!",
            warning: "⚠",
            info: "i"
        };

        const icon = document.createElement("div");
        icon.className = "rv-toast-icon";
        icon.textContent = iconMap[type] || "i";

        const content = document.createElement("div");
        content.className = "rv-toast-content";

        if (title) {
            const titleElement = document.createElement("div");
            titleElement.className = "rv-toast-title";
            titleElement.textContent = title;
            content.appendChild(titleElement);
        }

        if (message) {
            const messageElement = document.createElement("div");
            messageElement.className = "rv-toast-message";
            messageElement.textContent = message;
            content.appendChild(messageElement);
        }

        const closeButton = document.createElement("button");
        closeButton.className = "rv-toast-close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Tutup notifikasi");
        closeButton.textContent = "×";

        closeButton.addEventListener("click", function () {
            removeToast(toast);
        });

        toast.appendChild(icon);
        toast.appendChild(content);
        toast.appendChild(closeButton);

        return toast;
    }

    function removeToast(toast) {
        if (!toast || !toast.parentNode) {
            return;
        }

        toast.classList.add("rv-toast-removing");

        window.setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 250);
    }

    function limitVisibleToasts(container) {
        const toasts = container.querySelectorAll(".rv-toast");

        if (toasts.length <= MAX_VISIBLE) {
            return;
        }

        const excess = toasts.length - MAX_VISIBLE;

        for (let i = 0; i < excess; i++) {
            removeToast(toasts[i]);
        }
    }

    function normalizeMessage(message) {
        if (message === null || message === undefined) {
            return "";
        }

        if (typeof message === "string") {
            return message;
        }

        if (typeof message === "number" || typeof message === "boolean") {
            return String(message);
        }

        try {
            return JSON.stringify(message);
        } catch (error) {
            return String(message);
        }
    }

    function show(options) {
        const container = getContainer();

        if (!container) {
            return null;
        }

        if (typeof options === "string") {
            options = {
                message: options
            };
        }

        options = options || {};

        const type = [
            "success",
            "error",
            "warning",
            "info"
        ].includes(options.type)
            ? options.type
            : "info";

        const title = normalizeMessage(options.title);
        const message = normalizeMessage(options.message);

        if (!title && !message) {
            warn("Notifikasi kosong diabaikan.");
            return null;
        }

        let duration = Number(options.duration);

        if (!Number.isFinite(duration)) {
            duration = DEFAULT_DURATION;
        }

        duration = Math.max(0, duration);

        const toast = createToastElement(
            type,
            title,
            message
        );

        container.appendChild(toast);

        limitVisibleToasts(container);

        window.requestAnimationFrame(function () {
            toast.classList.add("rv-toast-visible");
        });

        let timer = null;

        if (duration > 0) {
            timer = window.setTimeout(function () {
                removeToast(toast);
            }, duration);
        }

        toast.addEventListener("mouseenter", function () {
            if (timer) {
                window.clearTimeout(timer);
            }
        });

        toast.addEventListener("mouseleave", function () {
            if (duration > 0) {
                timer = window.setTimeout(function () {
                    removeToast(toast);
                }, 1000);
            }
        });

        return toast.dataset.toastId;
    }

    function success(message, title, duration) {
        return show({
            type: "success",
            title: title || "Berhasil",
            message: message,
            duration: duration
        });
    }

    function error(message, title, duration) {
        return show({
            type: "error",
            title: title || "Terjadi Kesalahan",
            message: message,
            duration: duration
        });
    }

    function warning(message, title, duration) {
        return show({
            type: "warning",
            title: title || "Peringatan",
            message: message,
            duration: duration
        });
    }

    function info(message, title, duration) {
        return show({
            type: "info",
            title: title || "Informasi",
            message: message,
            duration: duration
        });
    }

    function clearAll() {
        const container = getContainer();

        if (!container) {
            return;
        }

        const toasts = container.querySelectorAll(".rv-toast");

        toasts.forEach(function (toast) {
            removeToast(toast);
        });
    }

    function count() {
        const container = getContainer();

        if (!container) {
            return 0;
        }

        return container.querySelectorAll(".rv-toast").length;
    }

    function test() {
        success(
            "Notifications system berhasil dijalankan.",
            "RV SPORTS"
        );

        window.setTimeout(function () {
            info(
                "UI notification siap digunakan."
            );
        }, 500);

        log("Notification test executed.");
    }

    const API = {
        VERSION: VERSION,

        show: show,

        success: success,
        error: error,
        warning: warning,
        info: info,

        clearAll: clearAll,
        count: count,

        test: test
    };

    window.RVSportsNotifications = API;

    log("RV SPORTS: FC CUP 26 Notifications System loaded.");
    log("[NOTIFICATIONS] Version:", VERSION);
    log(
        "[NOTIFICATIONS] API available:",
        !!window.RVSportsNotifications
    );
})();
