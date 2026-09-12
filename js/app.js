/* =========================================================
   RV SPORTS: FC CUP 26
   MAIN APPLICATION BOOT
   File: js/app.js
   ========================================================= */

(function () {
  "use strict";

  console.log("[APP] app.js loaded.");

  let bootProgress = 1;

  function updateLoading(progress, status) {
    bootProgress = Math.max(
      bootProgress,
      Math.min(100, Number(progress) || 0)
    );

    const progressText =
      document.getElementById("loadingProgress");

    const loadingBar =
      document.getElementById("loadingBar");

    const loadingStatus =
      document.getElementById("loadingStatus");

    if (progressText) {
      progressText.textContent =
        `${Math.round(bootProgress)}%`;
    }

    if (loadingBar) {
      loadingBar.style.width =
        `${bootProgress}%`;
    }

    if (loadingStatus && status) {
      loadingStatus.textContent = status;
    }
  }

  function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  function checkSystem(name, condition) {
    if (!condition) {
      throw new Error(
        `${name} system tidak tersedia.`
      );
    }
  }

  function hideLoadingScreen() {
    const loadingScreen =
      document.getElementById("loadingScreen");

    if (!loadingScreen) {
      console.warn(
        "[APP] loadingScreen tidak ditemukan."
      );
      return;
    }

    loadingScreen.classList.remove("active");

    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 400);
  }

  async function bootGame() {
    console.log("[APP] Boot started.");

    try {
      updateLoading(
        5,
        "Menyiapkan sistem..."
      );

      await wait(100);

      /* =========================
         CORE
         ========================= */

      checkSystem(
        "State",
        typeof S !== "undefined"
      );

      updateLoading(
        15,
        "Memuat penyimpanan..."
      );

      if (
        typeof initializeSaveSystem ===
        "function"
      ) {
        initializeSaveSystem();
      }

      await wait(100);

      /* =========================
         PLAYER
         ========================= */

      updateLoading(
        25,
        "Memuat database pemain..."
      );

      if (
        typeof initializePlayerSystem ===
        "function"
      ) {
        initializePlayerSystem();
      }

      if (
        typeof initializeStatsSystem ===
        "function"
      ) {
        initializeStatsSystem();
      }

      await wait(100);

      /* =========================
         CAREER
         ========================= */

      updateLoading(
        40,
        "Menyiapkan karier..."
      );

      if (
        typeof initializeCareerSystem ===
        "function"
      ) {
        initializeCareerSystem();
      }

      if (
        typeof initializeTrophySystem ===
        "function"
      ) {
        initializeTrophySystem();
      }

      await wait(100);

      /* =========================
         WORLD
         ========================= */

      updateLoading(
        55,
        "Memuat klub..."
      );

      if (
        typeof initializeClubSystem ===
        "function"
      ) {
        initializeClubSystem();
      }

      await wait(100);

      updateLoading(
        65,
        "Memuat negara..."
      );

      if (
        typeof initializeCountrySystem ===
        "function"
      ) {
        initializeCountrySystem();
      }

      await wait(100);

      updateLoading(
        75,
        "Memuat kompetisi..."
      );

      if (
        typeof initializeCompetitionSystem ===
        "function"
      ) {
        initializeCompetitionSystem();
      }

      await wait(100);

      /* =========================
         ROUTER
         ========================= */

      updateLoading(
        85,
        "Menyiapkan dunia sepak bola..."
      );

      checkSystem(
        "Router",
        typeof initializeRouter ===
          "function"
      );

      initializeRouter();

      await wait(150);

      /* =========================
         FINISH
         ========================= */

      updateLoading(
        95,
        "Menyiapkan antarmuka..."
      );

      await wait(200);

      updateLoading(
        100,
        "RV SPORTS siap dimainkan!"
      );

      await wait(500);

      hideLoadingScreen();

      console.log(
        "[APP] RV SPORTS: FC CUP 26 boot complete."
      );

    } catch (error) {
      console.error(
        "[APP] Boot failed:",
        error
      );

      showBootError(error);
    }
  }

  function showBootError(error) {
    const loadingStatus =
      document.getElementById(
        "loadingStatus"
      );

    const progressText =
      document.getElementById(
        "loadingProgress"
      );

    if (loadingStatus) {
      loadingStatus.textContent =
        "Gagal memuat game.";
    }

    if (progressText) {
      progressText.textContent =
        "ERROR";
    }

    console.error(
      "[RV SPORTS] Error:",
      error?.message || error
    );
  }

  function startBoot() {
    console.log(
      "[APP] Starting boot..."
    );

    if (
      document.readyState ===
      "loading"
    ) {
      document.addEventListener(
        "DOMContentLoaded",
        bootGame,
        { once: true }
      );
    } else {
      bootGame();
    }
  }

  window.RV_APP = {
    bootGame,
    updateLoading
  };

  startBoot();

})();
