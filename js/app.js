/* =========================================================
   RV SPORTS: FC CUP 26
   MAIN APPLICATION BOOT
   File: js/app.js
   ========================================================= */

(function () {
  "use strict";

  let bootProgress = 0;

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
    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );
  }

  function checkSystem(
    name,
    ready
  ) {
    if (!ready) {
      throw new Error(
        `${name} system is not ready.`
      );
    }
  }

  async function bootGame() {
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

      if (
        typeof initializeRouter ===
        "function"
      ) {
        initializeRouter();
      }

      await wait(150);

      updateLoading(
        95,
        "Menyiapkan antarmuka..."
      );

      await wait(150);

      updateLoading(
        100,
        "RV SPORTS siap dimainkan!"
      );

      await wait(350);

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

    const detail =
      error?.message ||
      "Unknown boot error";

    console.error(
      `[RV SPORTS] ${detail}`
    );
  }

  function startBoot() {
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
