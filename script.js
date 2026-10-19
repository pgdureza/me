(function () {
  "use strict";

  // Elements
  const wipe = document.getElementById("slash-wipe");
  const cutinText = document.getElementById("cutin-text");
  const screens = document.querySelectorAll(".view-screen");
  const menuItems = document.querySelectorAll(".p5-menu-item");
  const backButtons = document.querySelectorAll(".js-back-btn");
  const quickNavButtons = document.querySelectorAll(
    ".quick-nav-pill[data-target]",
  );
  const dateHud = document.getElementById("hud-date");

  // Set today's date dynamically in P5 calendar format
  function updateCalendarHud() {
    try {
      const now = new Date();
      const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      const days = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      if (dateHud) {
        dateHud.textContent = `${months[now.getMonth()]} ${now.getDate()} ${days[now.getDay()]}`;
      }
    } catch (e) {
      console.error("Failed to compute dynamic date:", e);
    }
  }
  updateCalendarHud();

  let currentViewId = "view-home";
  let isTransitioning = false;

  const cutinPhrases = [
    "TESTS PASSED!",
    "PATCH DEPLOYED!",
    "EXECUTE PROTOCOL!",
    "BUILD SUCCESS!",
    "MIGRATION DONE!",
    "TARGET LOCKED!",
    "HOTFIX APPLIED!",
    "STACK CLEARED!",
  ];

  function getRandomCutin() {
    return cutinPhrases[Math.floor(Math.random() * cutinPhrases.length)];
  }

  function switchView(targetViewId) {
    if (isTransitioning || targetViewId === currentViewId) return;
    isTransitioning = true;

    // Pick random P5 combat shout for cut-in
    cutinText.textContent = getRandomCutin();

    // 1. Trigger Screen Recoil Jolt & Dual Counter-Slash In
    document.body.classList.add("screen-recoil");
    wipe.className = "animating phase-in";

    // 2. Hit-Stop Window (at 220ms):
    // Blades have collided in the center; freeze for 90ms while cut-in badge jitters
    setTimeout(() => {
      // Swap active screen seamlessly during the frozen impact moment
      screens.forEach((screen) => {
        if (screen.id === targetViewId) {
          screen.classList.add("active");
        } else {
          screen.classList.remove("active");
        }
      });

      // Reset scroll position and clear previous reveal animation
      const targetScreen = document.getElementById(targetViewId);
      let targetStage = null;
      if (targetScreen) {
        const viewport = targetScreen.querySelector(
          ".section-content-viewport",
        );
        if (viewport) viewport.scrollTop = 0;
        targetStage =
          targetScreen.querySelector(".section-stage") ||
          targetScreen.querySelector(".home-main-layout");
        if (targetStage) {
          targetStage.classList.remove("view-stage-reveal");
        }
      }

      // Update active pill in quick-navs
      document.querySelectorAll(".quick-nav-pill").forEach((pill) => {
        if (pill.dataset.target === targetViewId) {
          pill.classList.add("active");
        } else if (pill.dataset.target) {
          pill.classList.remove("active");
        }
      });

      currentViewId = targetViewId;

      // 3. Breakaway Slice (at 310ms): Hit-stop finishes, opposing blades slice apart
      setTimeout(() => {
        document.body.classList.remove("screen-recoil");
        wipe.className = "animating phase-out";

        // TRIGGER the translateY entrance right as the blades slice apart!
        if (targetStage) {
          void targetStage.offsetWidth; // Force reflow to re-trigger animation
          targetStage.classList.add("view-stage-reveal");
        }

        // 4. Clean shutdown (at 230ms after breakaway)
        setTimeout(() => {
          wipe.className = "";
          isTransitioning = false;
        }, 230);
      }, 90); // 90ms hit-stop impact freeze!
    }, 220); // 220ms slice-in collision!
  }

  // Navigation dispatch helpers via p5Router
  function navigateTo(targetViewId) {
    if (window.p5Router) {
      window.p5Router.navigateTo(targetViewId);
    } else {
      switchView(targetViewId);
    }
  }

  function navigateBack() {
    if (window.p5Router) {
      window.p5Router.navigateBack();
    } else {
      switchView("view-home");
    }
  }

  // Initialize Router and listen for route / history changes
  if (window.p5Router) {
    const initialView = window.p5Router.init((targetViewId) => {
      switchView(targetViewId);
    });

    // If loaded directly with a route hash (e.g. #skill-matrix), open directly on that view
    if (initialView && initialView !== "view-home") {
      screens.forEach((screen) => {
        if (screen.id === initialView) {
          screen.classList.add("active");
        } else {
          screen.classList.remove("active");
        }
      });
      document.querySelectorAll(".quick-nav-pill").forEach((pill) => {
        if (pill.dataset.target === initialView) {
          pill.classList.add("active");
        } else if (pill.dataset.target) {
          pill.classList.remove("active");
        }
      });
      currentViewId = initialView;

      const targetScreen = document.getElementById(initialView);
      if (targetScreen) {
        const stage = targetScreen.querySelector(".section-stage");
        if (stage) stage.classList.add("view-stage-reveal");
      }
    }
  }

  // Main Menu Click & Key Events
  menuItems.forEach((item) => {
    const target = item.getAttribute("data-target");
    item.addEventListener("click", () => navigateTo(target));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navigateTo(target);
      }
    });
  });

  // Back / Cancel Buttons
  backButtons.forEach((btn) => {
    btn.addEventListener("click", () => navigateBack());
  });

  // Quick Nav Buttons
  quickNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) navigateTo(target);
    });
  });

  // Keyboard Controls (1-5 to navigate, ESC / Backspace to return)
  window.addEventListener("keydown", (e) => {
    if (isTransitioning) return;

    // If inside a section and user presses Escape or Backspace
    if (
      (e.key === "Escape" || e.key === "Backspace") &&
      currentViewId !== "view-home"
    ) {
      e.preventDefault();
      navigateBack();
      return;
    }

    // Numeric shortcuts on Home screen
    if (currentViewId === "view-home") {
      switch (e.key) {
        case "1":
          navigateTo("view-about");
          break;
        case "2":
          navigateTo("view-skills");
          break;
        case "3":
          navigateTo("view-history");
          break;
        case "4":
          navigateTo("view-projects");
          break;
        case "5":
          navigateTo("view-connect");
          break;
      }
    }
  });
})();
