/* =========================================================
   RV SPORTS: FC CUP 26
   js/core/utils.js
   Global Utility Functions
   ========================================================= */


/* =========================================================
   NUMBER HELPERS
   ========================================================= */

function clamp(value, min, max) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return min;
  }

  return Math.min(
    Math.max(number, min),
    max
  );
}


function randomInt(min, max) {
  min = Math.ceil(Number(min));
  max = Math.floor(Number(max));

  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}


function randomFloat(min, max, decimals = 2) {
  const value =
    Math.random() * (Number(max) - Number(min))
    + Number(min);

  return Number(
    value.toFixed(decimals)
  );
}


function randomChance(percent) {
  return Math.random() * 100 < Number(percent);
}


function average(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }

  const validNumbers = numbers
    .map(Number)
    .filter(number => !Number.isNaN(number));

  if (validNumbers.length === 0) {
    return 0;
  }

  return (
    validNumbers.reduce(
      (sum, value) => sum + value,
      0
    ) / validNumbers.length
  );
}


function sum(numbers) {
  if (!Array.isArray(numbers)) {
    return 0;
  }

  return numbers.reduce(
    (total, value) => total + Number(value || 0),
    0
  );
}


/* =========================================================
   STAT HELPERS
   ========================================================= */

function normalizeStat(value) {
  return clamp(
    Math.round(Number(value) || 0),
    1,
    99
  );
}


function calculateBaseOvr(stats) {
  if (!stats) {
    return 0;
  }

  const values = [
    Number(stats.pac || 0),
    Number(stats.sho || 0),
    Number(stats.pas || 0),
    Number(stats.dri || 0),
    Number(stats.def || 0),
    Number(stats.phy || 0)
  ];

  if (values.every(value => value === 0)) {
    return 0;
  }

  return Math.round(
    average(values)
  );
}


function calculatePositionOvr(stats, position) {
  if (!stats || !position) {
    return calculateBaseOvr(stats);
  }

  const pac = Number(stats.pac || 0);
  const sho = Number(stats.sho || 0);
  const pas = Number(stats.pas || 0);
  const dri = Number(stats.dri || 0);
  const def = Number(stats.def || 0);
  const phy = Number(stats.phy || 0);

  let weights;

  switch (position.toUpperCase()) {

    case "GK":
      weights = {
        pac: 0.05,
        sho: 0.05,
        pas: 0.15,
        dri: 0.05,
        def: 0.45,
        phy: 0.25
      };
      break;

    case "LB":
    case "RB":
    case "LWB":
    case "RWB":
      weights = {
        pac: 0.20,
        sho: 0.05,
        pas: 0.15,
        dri: 0.15,
        def: 0.30,
        phy: 0.15
      };
      break;

    case "CB":
      weights = {
        pac: 0.10,
        sho: 0.02,
        pas: 0.13,
        dri: 0.05,
        def: 0.45,
        phy: 0.25
      };
      break;

    case "CDM":
      weights = {
        pac: 0.10,
        sho: 0.08,
        pas: 0.25,
        dri: 0.12,
        def: 0.30,
        phy: 0.15
      };
      break;

    case "CM":
      weights = {
        pac: 0.10,
        sho: 0.12,
        pas: 0.25,
        dri: 0.20,
        def: 0.18,
        phy: 0.15
      };
      break;

    case "CAM":
      weights = {
        pac: 0.10,
        sho: 0.18,
        pas: 0.25,
        dri: 0.27,
        def: 0.05,
        phy: 0.15
      };
      break;

    case "LW":
    case "RW":
      weights = {
        pac: 0.25,
        sho: 0.20,
        pas: 0.15,
        dri: 0.30,
        def: 0.03,
        phy: 0.07
      };
      break;

    case "ST":
      weights = {
        pac: 0.18,
        sho: 0.35,
        pas: 0.10,
        dri: 0.20,
        def: 0.02,
        phy: 0.15
      };
      break;

    default:
      return calculateBaseOvr(stats);
  }

  const result =
    pac * weights.pac +
    sho * weights.sho +
    pas * weights.pas +
    dri * weights.dri +
    def * weights.def +
    phy * weights.phy;

  return Math.round(result);
}


function getOvrTier(ovr) {
  const value = Number(ovr || 0);

  if (value <= 0) {
    return {
      key: "unrated",
      label: "UNRATED"
    };
  }

  if (value <= 59) {
    return {
      key: "bronze",
      label: "BRONZE"
    };
  }

  if (value <= 69) {
    return {
      key: "silver",
      label: "SILVER"
    };
  }

  if (value <= 79) {
    return {
      key: "gold",
      label: "GOLD"
    };
  }

  if (value <= 84) {
    return {
      key: "elite",
      label: "ELITE"
    };
  }

  if (value <= 89) {
    return {
      key: "worldclass",
      label: "WORLD CLASS"
    };
  }

  return {
    key: "icon",
    label: "ICON"
  };
}


/* =========================================================
   MONEY HELPERS
   ========================================================= */

function formatMoney(
  amount,
  currency = "EUR"
) {
  const value = Number(amount || 0);

  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0
      }
    ).format(value);

  } catch (error) {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}


function formatCompactNumber(value) {
  const number = Number(value || 0);

  if (Math.abs(number) >= 1_000_000_000) {
    return (
      (number / 1_000_000_000)
        .toFixed(1)
        .replace(".0", "") + "B"
    );
  }

  if (Math.abs(number) >= 1_000_000) {
    return (
      (number / 1_000_000)
        .toFixed(1)
        .replace(".0", "") + "M"
    );
  }

  if (Math.abs(number) >= 1_000) {
    return (
      (number / 1_000)
        .toFixed(1)
        .replace(".0", "") + "K"
    );
  }

  return number.toLocaleString();
}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function padNumber(number) {
  return String(number).padStart(2, "0");
}


function formatDate(
  date,
  locale = "en-GB"
) {
  if (!date) {
    return "-";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString(
    locale,
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}


function formatDateTime(
  date,
  locale = "en-GB"
) {
  if (!date) {
    return "-";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString(
    locale,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}


function calculateAge(
  birthDate,
  referenceDate = new Date()
) {
  if (!birthDate) {
    return 0;
  }

  const birth = new Date(birthDate);
  const current = new Date(referenceDate);

  if (Number.isNaN(birth.getTime())) {
    return 0;
  }

  let age =
    current.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    current.getMonth() -
    birth.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      current.getDate() < birth.getDate()
    )
  ) {
    age--;
  }

  return Math.max(
    0,
    age
  );
}


function getDaysBetween(
  startDate,
  endDate
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  const difference =
    end.getTime() -
    start.getTime();

  return Math.floor(
    difference / 86400000
  );
}


/* =========================================================
   STRING HELPERS
   ========================================================= */

function capitalize(value) {
  if (!value) {
    return "";
  }

  const string = String(value);

  return (
    string.charAt(0).toUpperCase() +
    string.slice(1)
  );
}


function titleCase(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .split(" ")
    .map(word => capitalize(word))
    .join(" ");
}


function truncateText(
  value,
  maxLength = 50
) {
  const string = String(value || "");

  if (string.length <= maxLength) {
    return string;
  }

  return (
    string.slice(0, maxLength - 3) +
    "..."
  );
}


/* =========================================================
   ID HELPERS
   ========================================================= */

function createId(prefix = "id") {
  const timestamp =
    Date.now().toString(36);

  const random =
    Math.random()
      .toString(36)
      .slice(2, 8);

  return `${prefix}_${timestamp}_${random}`;
}


/* =========================================================
   ARRAY HELPERS
   ========================================================= */

function shuffleArray(array) {
  if (!Array.isArray(array)) {
    return [];
  }

  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [
      result[i],
      result[j]
    ] = [
      result[j],
      result[i]
    ];
  }

  return result;
}


function randomItem(array) {
  if (
    !Array.isArray(array) ||
    array.length === 0
  ) {
    return null;
  }

  return array[
    Math.floor(
      Math.random() * array.length
    )
  ];
}


function removeItemById(
  array,
  id
) {
  if (!Array.isArray(array)) {
    return false;
  }

  const index =
    array.findIndex(
      item => item?.id === id
    );

  if (index === -1) {
    return false;
  }

  array.splice(index, 1);

  return true;
}


/* =========================================================
   OBJECT HELPERS
   ========================================================= */

function deepClone(value) {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return value;
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}


function mergeObjects(
  target,
  source
) {
  if (
    !target ||
    typeof target !== "object"
  ) {
    return source;
  }

  if (
    !source ||
    typeof source !== "object"
  ) {
    return target;
  }

  Object.keys(source).forEach(key => {

    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {

      if (
        !target[key] ||
        typeof target[key] !== "object"
      ) {
        target[key] = {};
      }

      mergeObjects(
        target[key],
        source[key]
      );

    } else {

      target[key] = source[key];

    }
  });

  return target;
}


/* =========================================================
   PLAYER HELPERS
   ========================================================= */

function getPlayerDisplayName() {
  if (
    typeof S === "undefined" ||
    !S.player
  ) {
    return "Player";
  }

  return (
    S.player.shirtName ||
    S.player.name ||
    "Player"
  );
}


function getPlayerOvr() {
  if (
    typeof S === "undefined" ||
    !S.player
  ) {
    return 0;
  }

  if (
    S.admin?.ovrOverride === true &&
    S.admin?.forcedOvr !== null
  ) {
    return clamp(
      S.admin.forcedOvr,
      1,
      99
    );
  }

  return clamp(
    S.player.ovr || 0,
    0,
    99
  );
}


function refreshPlayerOvr() {
  if (
    typeof S === "undefined" ||
    !S.player
  ) {
    return 0;
  }

  if (
    S.admin?.ovrOverride === true &&
    S.admin?.forcedOvr !== null
  ) {
    S.player.ovr =
      clamp(
        S.admin.forcedOvr,
        1,
        99
      );

    return S.player.ovr;
  }

  const calculated =
    calculatePositionOvr(
      S.player.stats,
      S.player.position
    );

  S.player.ovr =
    clamp(
      calculated,
      0,
      99
    );

  return S.player.ovr;
}


/* =========================================================
   FORM / CONDITION HELPERS
   ========================================================= */

function getConditionStatus(value) {
  const number = Number(value || 0);

  if (number >= 90) {
    return {
      key: "excellent",
      label: "Excellent"
    };
  }

  if (number >= 75) {
    return {
      key: "good",
      label: "Good"
    };
  }

  if (number >= 50) {
    return {
      key: "normal",
      label: "Normal"
    };
  }

  if (number >= 25) {
    return {
      key: "poor",
      label: "Poor"
    };
  }

  return {
    key: "critical",
    label: "Critical"
  };
}


/* =========================================================
   TEXT / DOM HELPERS
   ========================================================= */

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function $(selector) {
  return document.querySelector(
    selector
  );
}


function $$(selector) {
  return Array.from(
    document.querySelectorAll(
      selector
    )
  );
}


function showElement(element) {
  if (!element) {
    return;
  }

  element.classList.remove(
    "hidden"
  );
}


function hideElement(element) {
  if (!element) {
    return;
  }

  element.classList.add(
    "hidden"
  );
}


function setText(
  selector,
  value
) {
  const element =
    typeof selector === "string"
      ? $(selector)
      : selector;

  if (!element) {
    return;
  }

  element.textContent =
    value ?? "";
}


function setHTML(
  selector,
  html
) {
  const element =
    typeof selector === "string"
      ? $(selector)
      : selector;

  if (!element) {
    return;
  }

  element.innerHTML =
    html ?? "";
}


/* =========================================================
   TOAST FALLBACK
   ========================================================= */

function showToast(
  title,
  message = "",
  type = "info"
) {
  /*
    Kalau sistem UI notification belum dibuat,
    utility ini tetap bekerja menggunakan console
    sehingga file lain tidak error.
  */

  if (
    typeof window.showGameToast ===
    "function"
  ) {
    window.showGameToast(
      title,
      message,
      type
    );

    return;
  }

  console.log(
    `[${type.toUpperCase()}] ${title}: ${message}`
  );

  const container =
    document.getElementById(
      "toastContainer"
    );

  if (!container) {
    return;
  }

  const toast =
    document.createElement("div");

  toast.className =
    `toast toast-${type}`;

  toast.innerHTML = `
    <strong>${escapeHTML(title)}</strong>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(
    toast
  );

  setTimeout(() => {
    toast.classList.add(
      "toast-hide"
    );

    setTimeout(() => {
      toast.remove();
    }, 300);

  }, 3000);
}


/* =========================================================
   MODAL FALLBACK
   ========================================================= */

function openModal(
  title,
  content,
  options = {}
) {
  if (
    typeof window.showGameModal ===
    "function"
  ) {
    return window.showGameModal(
      title,
      content,
      options
    );
  }

  const modal =
    document.getElementById(
      "globalModal"
    );

  if (!modal) {
    return false;
  }

  const titleElement =
    modal.querySelector(
      ".modal-title"
    );

  const bodyElement =
    modal.querySelector(
      ".modal-body"
    );

  if (titleElement) {
    titleElement.textContent =
      title;
  }

  if (bodyElement) {
    bodyElement.innerHTML =
      content;
  }

  modal.classList.add(
    "active"
  );

  return true;
}


function closeModal() {
  if (
    typeof window.hideGameModal ===
    "function"
  ) {
    window.hideGameModal();
    return;
  }

  const modal =
    document.getElementById(
      "globalModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "active"
  );
}


/* =========================================================
   DEBOUNCE / THROTTLE
   ========================================================= */

function debounce(
  callback,
  delay = 300
) {
  let timer;

  return function (...args) {

    clearTimeout(timer);

    timer = setTimeout(
      () => {
        callback.apply(
          this,
          args
        );
      },
      delay
    );
  };
}


function throttle(
  callback,
  delay = 300
) {
  let waiting = false;

  return function (...args) {

    if (waiting) {
      return;
    }

    callback.apply(
      this,
      args
    );

    waiting = true;

    setTimeout(() => {
      waiting = false;
    }, delay);
  };
}


/* =========================================================
   DEVICE HELPERS
   ========================================================= */

function isMobileDevice() {
  return window.matchMedia(
    "(max-width: 768px)"
  ).matches;
}


function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}


/* =========================================================
   SAFE EXECUTION
   ========================================================= */

function safeExecute(
  callback,
  fallback = null
) {
  try {
    return callback();

  } catch (error) {

    console.error(
      "[UTILS] Error:",
      error
    );

    return fallback;
  }
}


/* =========================================================
   DEBUG
   ========================================================= */

function debugLog(
  label,
  data = null
) {
  if (
    typeof console ===
    "undefined"
  ) {
    return;
  }

  if (data === null) {
    console.log(
      `[RV SPORTS] ${label}`
    );

  } else {
    console.log(
      `[RV SPORTS] ${label}`,
      data
    );
  }
}


/* =========================================================
   UTILS READY
   ========================================================= */

const UTILS_READY = true;

console.log(
  "RV SPORTS: FC CUP 26 Utils loaded."
);
