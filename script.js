(function () {
  "use strict";

  // Elements
  // const wipe = document.getElementById("slash-wipe");
  // const cutinText = document.getElementById("cutin-text");
  const screens = document.querySelectorAll(".view-screen");
  const menuItems = document.querySelectorAll(".p5-menu-item");
  const backButtons = document.querySelectorAll(".js-back-btn");
  // const quickNavButtons = document.querySelectorAll(
  //   ".quick-nav-pill[data-target]",
  // );
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
    "HOTFIX APPLIED!",
    "STACK CLEARED!",
  ];

  function getRandomCutin() {
    return cutinPhrases[Math.floor(Math.random() * cutinPhrases.length)];
  }

  const persistentNav = document.getElementById("persistent-quick-nav");

  function switchView(targetViewId) {
    if (isTransitioning || targetViewId === currentViewId) return;
    isTransitioning = true;

    const currentScreen = document.getElementById(currentViewId);
    const targetScreen = document.getElementById(targetViewId);
    const isGoingHome = targetViewId === "view-home";
    const isLeavingHome = currentViewId === "view-home";

    // Handle persistent bottom menu slide in / out
    if (persistentNav) {
      if (isLeavingHome) {
        // Slide IN when coming from home
        persistentNav.classList.add("visible");
      } else if (isGoingHome) {
        // Slide OUT when going back to home
        persistentNav.classList.remove("visible");
      }
      persistentNav.querySelectorAll(".quick-nav-pill").forEach((pill) => {
        if (pill.dataset.target === targetViewId) {
          pill.classList.add("active");
        } else {
          pill.classList.remove("active");
        }
      });
    }

    // 1. Phase 1: Outgoing screen components drop down with rapid stagger
    if (currentScreen) {
      currentScreen.classList.remove("view-enter");
      currentScreen.classList.add("view-exit");
    }

    // 2. Phase 2: Hand-off at 200ms when outgoing elements have dropped
    setTimeout(() => {
      if (currentScreen) {
        currentScreen.classList.remove("active", "view-exit");
      }

      if (targetScreen) {
        targetScreen.classList.remove("view-exit");
        targetScreen.classList.add("active", "view-enter");
        const viewport = targetScreen.querySelector(
          ".section-content-viewport",
        );
        if (viewport) viewport.scrollTop = 0;
      }

      currentViewId = targetViewId;

      // 3. Phase 3: Transition finishes after incoming components snap in (~340ms)
      setTimeout(() => {
        if (targetScreen) {
          targetScreen.classList.remove("view-enter");
        }
        isTransitioning = false;
      }, 340);
    }, 200);
  }

  // Navigation dispatch helpers via p5Router
  function navigateTo(targetViewId) {
    if (window.p5Router) {
      window.p5Router.navigateTo(targetViewId);
    } else {
      switchView(targetViewId);
    }
  }

  // function navigateBack() {
  //   if (window.p5Router) {
  //     window.p5Router.navigateBack();
  //   } else {
  //     navigateTo("view-home");
  //   }
  // }

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

      // Show persistent quick-nav when starting inside a section
      if (persistentNav) {
        persistentNav.classList.add("visible");
        persistentNav.querySelectorAll(".quick-nav-pill").forEach((pill) => {
          if (pill.dataset.target === initialView) {
            pill.classList.add("active");
          } else {
            pill.classList.remove("active");
          }
        });
      }

      currentViewId = initialView;
    }
  }

  // Arrow Up / Down selection state for Main Menu
  let selectedMenuIndex = -1;

  // Track hover and focus to keep selected index in sync
  menuItems.forEach((item, index) => {
    item.addEventListener("mouseenter", () => {
      selectedMenuIndex = index;
    });
    item.addEventListener("focus", () => {
      selectedMenuIndex = index;
    });

    const target = item.getAttribute("data-target");
    item.addEventListener("click", () => navigateTo(target));
  });

  // Back / Cancel Buttons
  backButtons.forEach((btn) => {
    btn.addEventListener("click", () => navigateTo("view-home"));
  });

  // Persistent Quick Nav Buttons
  if (persistentNav) {
    persistentNav
      .querySelectorAll(".quick-nav-pill[data-target]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-target");
          if (target) navigateTo(target);
        });
      });
  }

  // Keyboard Controls (ArrowUp/ArrowDown to select, Space/Enter to execute, ESC / Backspace to return)
  window.addEventListener("keydown", (e) => {
    if (isTransitioning) return;

    // If inside a section and user presses Escape or Backspace
    if (
      (e.key === "Escape" || e.key === "Backspace") &&
      currentViewId !== "view-home"
    ) {
      e.preventDefault();
      switchView("view-home");
      return;
    }

    // Home screen Arrow navigation and Space / Enter execution
    if (currentViewId === "view-home") {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (
          selectedMenuIndex < 0 ||
          selectedMenuIndex >= menuItems.length - 1
        ) {
          selectedMenuIndex = 0;
        } else {
          selectedMenuIndex++;
        }
        menuItems[selectedMenuIndex].focus();
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedMenuIndex <= 0) {
          selectedMenuIndex = menuItems.length - 1;
        } else {
          selectedMenuIndex--;
        }
        menuItems[selectedMenuIndex].focus();
        return;
      }

      if (e.key === " " || e.code === "Space" || e.key === "Enter") {
        if (selectedMenuIndex >= 0 && selectedMenuIndex < menuItems.length) {
          e.preventDefault();
          const target =
            menuItems[selectedMenuIndex].getAttribute("data-target");
          if (target) navigateTo(target);
        } else if (menuItems.length > 0) {
          e.preventDefault();
          selectedMenuIndex = 0;
          menuItems[0].focus();
          const target = menuItems[0].getAttribute("data-target");
          if (target) navigateTo(target);
        }
      }
    }
  });
})();
