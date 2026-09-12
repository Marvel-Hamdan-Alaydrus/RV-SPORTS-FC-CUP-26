/* =========================================================
   RV SPORTS: FC CUP 26
   js/core/save.js
   Save / Load / Auto Save / Reset / Backup / Restore
   ========================================================= */

const SAVE_KEY = "rv_sports_fc_cup_26_save";
const BACKUP_KEY = "rv_sports_fc_cup_26_backup";
const SAVE_VERSION = 1;

let autoSaveTimer = null;


/* =========================================================
   INTERNAL HELPERS
   ========================================================= */

function getSavePayload() {
  return {
    saveVersion: SAVE_VERSION,
    gameVersion: GAME_VERSION,
    savedAt: new Date().toISOString(),
    state: cloneGameState()
  };
}


function isValidSavePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (!payload.state || typeof payload.state !== "object") {
    return false;
  }

  return true;
}


function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("[SAVE] JSON parse error:", error);
    return null;
  }
}


/* =========================================================
   SAVE GAME
   ========================================================= */

function saveGame(options = {}) {
  const silent = options.silent === true;

  try {
    touchGameState();

    const payload = getSavePayload();

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(payload)
    );

    S.meta.lastSavedAt = payload.savedAt;

    if (!silent) {
      showToast(
        "Game Saved",
        "Progress kamu berhasil disimpan.",
        "success"
      );
    }

    return true;

  } catch (error) {
    console.error("[SAVE] Failed to save game:", error);

    if (!silent) {
      showToast(
        "Save Failed",
        "Game gagal disimpan.",
        "error"
      );
    }

    return false;
  }
}


/* =========================================================
   LOAD GAME
   ========================================================= */

function loadGame(options = {}) {
  const silent = options.silent === true;

  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
      if (!silent) {
        showToast(
          "No Save Found",
          "Belum ada save game yang tersedia.",
          "warning"
        );
      }

      return false;
    }

    const payload = safeJsonParse(raw);

    if (!isValidSavePayload(payload)) {
      console.error("[SAVE] Invalid save payload.");

      if (!silent) {
        showToast(
          "Load Failed",
          "Data save tidak valid.",
          "error"
        );
      }

      return false;
    }

    const loadedState = payload.state;

    /*
      Kita tidak mengganti object S secara langsung.

      Object S sudah dipakai oleh file-file lain.
      Jadi isi state lama kita replace dengan data save.
    */

    replaceObjectContents(S, loadedState);

    /*
      Pastikan beberapa struktur penting tetap tersedia.
    */

    repairGameState();

    S.meta.lastLoadedAt = new Date().toISOString();
    S.meta.lastSavedAt = payload.savedAt || null;

    if (!silent) {
      showToast(
        "Game Loaded",
        "Progress berhasil dimuat.",
        "success"
      );
    }

    return true;

  } catch (error) {
    console.error("[SAVE] Failed to load game:", error);

    if (!silent) {
      showToast(
        "Load Failed",
        "Terjadi masalah saat memuat save.",
        "error"
      );
    }

    return false;
  }
}


/* =========================================================
   REPLACE STATE CONTENTS
   ========================================================= */

function replaceObjectContents(target, source) {
  if (!target || !source) {
    return;
  }

  Object.keys(target).forEach(key => {
    delete target[key];
  });

  Object.keys(source).forEach(key => {
    target[key] = source[key];
  });
}


/* =========================================================
   STATE REPAIR
   ========================================================= */

function repairGameState() {
  /*
    Repair ringan supaya save lama tidak langsung
    bikin game crash ketika struktur state berkembang.
  */

  if (!S.player) {
    S.player = createDefaultPlayer();
  }

  if (!S.career) {
    S.career = {
      started: false,
      startDate: null,
      currentSeason: 2026,
      currentYear: 2026,
      currentMonth: 7,
      currentDay: 1,
      currentClubId: "",
      previousClubId: "",
      totalSeasons: 0,
      careerStatus: "Unstarted",
      transferStatus: "None",
      transferOffers: [],
      matchesPlayedThisSeason: 0,
      goalsThisSeason: 0,
      assistsThisSeason: 0,
      trophiesThisSeason: [],
      seasonHistory: []
    };
  }

  if (!S.world) {
    S.world = {};
  }

  if (!S.economy) {
    S.economy = {};
  }

  if (!S.social) {
    S.social = {};
  }

  if (!S.admin) {
    S.admin = {};
  }

  if (!S.settings) {
    S.settings = {};
  }

  /*
    Player nested objects
  */

  if (!S.player.stats) {
    S.player.stats = {
      pac: 0,
      sho: 0,
      pas: 0,
      dri: 0,
      def: 0,
      phy: 0
    };
  }

  if (!S.player.career) {
    S.player.career = {
      appearances: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      minutesPlayed: 0
    };
  }

  if (!S.player.currentClub) {
    S.player.currentClub = {
      clubId: "",
      joined: null,
      contractUntil: null,
      shirtNumber: 0,
      role: "Player"
    };
  }

  if (!S.player.clubs) {
    S.player.clubs = [];
  }

  if (!S.player.nationalTeam) {
    S.player.nationalTeam = {
      country: "",
      caps: 0,
      goals: 0,
      assists: 0,
      trophies: []
    };
  }

  if (!S.player.trophies) {
    S.player.trophies = {
      club: [],
      national: [],
      individual: []
    };
  }

  if (!S.player.economy) {
    S.player.economy = {
      money: 0,
      salary: 0,
      marketValue: 0,
      releaseClause: 0,
      weeklyIncome: 0,
      careerEarnings: 0
    };
  }

  if (!S.player.social) {
    S.player.social = {
      fans: 0,
      followers: 0,
      popularity: 0,
      reputation: 0,
      socialReach: 0
    };
  }

  if (!S.player.achievements) {
    S.player.achievements = [];
  }

  if (!S.player.preferences) {
    S.player.preferences = {
      preferredFoot: "Right",
      playStyle: "",
      celebration: ""
    };
  }

  /*
    Admin
  */

  if (!Array.isArray(S.admin.logs)) {
    S.admin.logs = [];
  }

  if (typeof S.admin.creatorMode !== "boolean") {
    S.admin.creatorMode = false;
  }

  if (typeof S.admin.authenticated !== "boolean") {
    S.admin.authenticated = false;
  }

  if (typeof S.admin.godMode !== "boolean") {
    S.admin.godMode = false;
  }

  /*
    Career arrays
  */

  if (!Array.isArray(S.career.transferOffers)) {
    S.career.transferOffers = [];
  }

  if (!Array.isArray(S.career.trophiesThisSeason)) {
    S.career.trophiesThisSeason = [];
  }

  if (!Array.isArray(S.career.seasonHistory)) {
    S.career.seasonHistory = [];
  }

  /*
    Settings defaults
  */

  if (typeof S.settings.language !== "string") {
    S.settings.language = "en";
  }

  if (typeof S.settings.sound !== "boolean") {
    S.settings.sound = true;
  }

  if (typeof S.settings.music !== "boolean") {
    S.settings.music = true;
  }

  if (typeof S.settings.vibration !== "boolean") {
    S.settings.vibration = true;
  }

  if (typeof S.settings.notifications !== "boolean") {
    S.settings.notifications = true;
  }

  if (typeof S.settings.reducedMotion !== "boolean") {
    S.settings.reducedMotion = false;
  }

  if (typeof S.settings.darkMode !== "boolean") {
    S.settings.darkMode = true;
  }

  /*
    Meta
  */

  if (!S.meta) {
    S.meta = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSavedAt: null,
      lastLoadedAt: null
    };
  }
}


/* =========================================================
   CHECK SAVE EXISTS
   ========================================================= */

function hasSaveGame() {
  return localStorage.getItem(SAVE_KEY) !== null;
}


/* =========================================================
   GET SAVE INFO
   ========================================================= */

function getSaveInfo() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
      return null;
    }

    const payload = safeJsonParse(raw);

    if (!isValidSavePayload(payload)) {
      return null;
    }

    const player = payload.state?.player || {};

    return {
      exists: true,
      savedAt: payload.savedAt || null,
      gameVersion: payload.gameVersion || null,
      saveVersion: payload.saveVersion || null,
      playerName: player.name || "Unnamed Player",
      clubId: player.currentClub?.clubId || "",
      ovr: player.ovr || 0,
      season: payload.state?.career?.currentSeason || 2026
    };

  } catch (error) {
    console.error("[SAVE] Failed to read save info:", error);
    return null;
  }
}


/* =========================================================
   DELETE SAVE
   ========================================================= */

function deleteSaveGame(options = {}) {
  const silent = options.silent === true;

  try {
    localStorage.removeItem(SAVE_KEY);

    if (!silent) {
      showToast(
        "Save Deleted",
        "Save game berhasil dihapus.",
        "success"
      );
    }

    return true;

  } catch (error) {
    console.error("[SAVE] Failed to delete save:", error);

    if (!silent) {
      showToast(
        "Delete Failed",
        "Save game gagal dihapus.",
        "error"
      );
    }

    return false;
  }
}


/* =========================================================
   RESET GAME
   ========================================================= */

function resetGame(options = {}) {
  const deleteSave = options.deleteSave !== false;
  const silent = options.silent === true;

  try {
    stopAutoSave();

    resetGameState();

    if (deleteSave) {
      localStorage.removeItem(SAVE_KEY);
    }

    if (!silent) {
      showToast(
        "Game Reset",
        "Progress game sudah direset.",
        "success"
      );
    }

    return true;

  } catch (error) {
    console.error("[SAVE] Failed to reset game:", error);

    if (!silent) {
      showToast(
        "Reset Failed",
        "Game gagal direset.",
        "error"
      );
    }

    return false;
  }
}


/* =========================================================
   AUTO SAVE
   ========================================================= */

function startAutoSave(intervalMinutes = 5) {
  stopAutoSave();

  const intervalMs = Math.max(
    1,
    intervalMinutes
  ) * 60 * 1000;

  autoSaveTimer = setInterval(() => {
    saveGame({
      silent: true
    });

    console.log("[SAVE] Auto save completed.");
  }, intervalMs);

  console.log(
    `[SAVE] Auto save started: every ${intervalMinutes} minute(s).`
  );
}


function stopAutoSave() {
  if (autoSaveTimer !== null) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}


function isAutoSaveRunning() {
  return autoSaveTimer !== null;
}


/* =========================================================
   BACKUP
   ========================================================= */

function createBackup() {
  try {
    const payload = getSavePayload();

    localStorage.setItem(
      BACKUP_KEY,
      JSON.stringify(payload)
    );

    S.admin.lastBackup = payload.savedAt;
    S.admin.backupCount =
      Number(S.admin.backupCount || 0) + 1;

    addCreatorLog(
      "BACKUP_CREATE",
      "Game",
      null,
      payload.savedAt
    );

    showToast(
      "Backup Created",
      "Backup game berhasil dibuat.",
      "success"
    );

    return true;

  } catch (error) {
    console.error("[SAVE] Backup failed:", error);

    showToast(
      "Backup Failed",
      "Backup gagal dibuat.",
      "error"
    );

    return false;
  }
}


/* =========================================================
   RESTORE BACKUP
   ========================================================= */

function restoreBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);

    if (!raw) {
      showToast(
        "No Backup",
        "Belum ada backup yang tersedia.",
        "warning"
      );

      return false;
    }

    const payload = safeJsonParse(raw);

    if (!isValidSavePayload(payload)) {
      showToast(
        "Restore Failed",
        "Backup tidak valid.",
        "error"
      );

      return false;
    }

    replaceObjectContents(S, payload.state);

    repairGameState();

    saveGame({
      silent: true
    });

    addCreatorLog(
      "BACKUP_RESTORE",
      "Game",
      null,
      payload.savedAt
    );

    showToast(
      "Backup Restored",
      "Backup berhasil dipulihkan.",
      "success"
    );

    return true;

  } catch (error) {
    console.error("[SAVE] Restore failed:", error);

    showToast(
      "Restore Failed",
      "Backup gagal dipulihkan.",
      "error"
    );

    return false;
  }
}


/* =========================================================
   EXPORT SAVE
   ========================================================= */

function exportSaveData() {
  try {
    const payload = getSavePayload();

    const json = JSON.stringify(
      payload,
      null,
      2
    );

    const blob = new Blob(
      [json],
      {
        type: "application/json"
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `rv-sports-fc-cup-26-save-${Date.now()}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast(
      "Save Exported",
      "File save berhasil diekspor.",
      "success"
    );

    return true;

  } catch (error) {
    console.error("[SAVE] Export failed:", error);

    showToast(
      "Export Failed",
      "Save gagal diekspor.",
      "error"
    );

    return false;
  }
}


/* =========================================================
   IMPORT SAVE
   ========================================================= */

function importSaveData(file) {
  return new Promise((resolve) => {

    if (!file) {
      showToast(
        "No File",
        "Tidak ada file save yang dipilih.",
        "warning"
      );

      resolve(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

      try {
        const payload = safeJsonParse(
          event.target.result
        );

        if (!isValidSavePayload(payload)) {
          showToast(
            "Invalid Save",
            "File save tidak valid.",
            "error"
          );

          resolve(false);
          return;
        }

        replaceObjectContents(
          S,
          payload.state
        );

        repairGameState();

        saveGame({
          silent: true
        });

        showToast(
          "Save Imported",
          "Save berhasil diimpor.",
          "success"
        );

        resolve(true);

      } catch (error) {
        console.error(
          "[SAVE] Import failed:",
          error
        );

        showToast(
          "Import Failed",
          "Save gagal diimpor.",
          "error"
        );

        resolve(false);
      }
    };

    reader.onerror = function() {

      showToast(
        "Import Failed",
        "File tidak dapat dibaca.",
        "error"
      );

      resolve(false);
    };

    reader.readAsText(file);
  });
}


/* =========================================================
   QUICK SAVE
   ========================================================= */

function quickSave() {
  return saveGame({
    silent: false
  });
}


/* =========================================================
   QUICK LOAD
   ========================================================= */

function quickLoad() {
  return loadGame({
    silent: false
  });
}


/* =========================================================
   WINDOW EVENTS
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {
    saveGame({
      silent: true
    });
  }
);


/* =========================================================
   INITIAL SAVE SYSTEM
   ========================================================= */

function initializeSaveSystem() {

  /*
    Kalau save tersedia, jangan langsung load otomatis.
    UI nantinya bisa menawarkan:
      Continue Career
      New Career
  */

  if (hasSaveGame()) {

    const info = getSaveInfo();

    console.log(
      "[SAVE] Existing save found:",
      info
    );

  } else {

    console.log(
      "[SAVE] No existing save found."
    );
  }

  /*
    Autosave default setiap 5 menit.
  */

  startAutoSave(5);
}


/* =========================================================
   SAVE SYSTEM READY
   ========================================================= */

const SAVE_SYSTEM_READY = true;

console.log(
  "RV SPORTS: FC CUP 26 Save System loaded."
);
