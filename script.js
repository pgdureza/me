(function () {
      'use strict';

      // Elements
      const wipe = document.getElementById('slash-wipe');
      const cutinText = document.getElementById('cutin-text');
      const screens = document.querySelectorAll('.view-screen');
      const menuItems = document.querySelectorAll('.p5-menu-item');
      const backButtons = document.querySelectorAll('.js-back-btn');
      const quickNavButtons = document.querySelectorAll('.quick-nav-pill[data-target]');
      const dateHud = document.getElementById('hud-date');

      // Set today's date dynamically in P5 calendar format
      function updateCalendarHud() {
        try {
          const now = new Date();
          const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
          const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          if (dateHud) {
            dateHud.textContent = `${months[now.getMonth()]} ${now.getDate()} ${days[now.getDay()]}`;
          }
        } catch (e) {
          console.error('Failed to compute dynamic date:', e);
        }
      }
      updateCalendarHud();

      let currentViewId = 'view-home';
      let isTransitioning = false;

      const cutinPhrases = [
        'ALL-OUT ATTACK!!',
        'SHOW ME YOUR TRUE FORM!',
        'TIME TO MAKE HISTORY!',
        'TREASURE LOCATED!',
        'I WILL STEAL YOUR HEART!'
      ];

      function getRandomCutin() {
        return cutinPhrases[Math.floor(Math.random() * cutinPhrases.length)];
      }

      function switchView(targetViewId) {
        if (isTransitioning || targetViewId === currentViewId) return;
        isTransitioning = true;

        // Pick random P5 combat shout for cut-in
        cutinText.textContent = getRandomCutin();

        // 1. Activate wipe container and trigger Phase In
        wipe.className = 'animating phase-in';

        // 2. Midpoint (at 300ms): Screen is 100% covered in deep black & red
        setTimeout(() => {
          screens.forEach((screen) => {
            if (screen.id === targetViewId) {
              screen.classList.add('active');
            } else {
              screen.classList.remove('active');
            }
          });

          // Update active pill in quick-navs
          document.querySelectorAll('.quick-nav-pill').forEach((pill) => {
            if (pill.dataset.target === targetViewId) {
              pill.classList.add('active');
            } else if (pill.dataset.target) {
              pill.classList.remove('active');
            }
          });

          currentViewId = targetViewId;

          // Reset scroll position of the section
          const targetScreen = document.getElementById(targetViewId);
          if (targetScreen) {
            const viewport = targetScreen.querySelector('.section-content-viewport');
            if (viewport) viewport.scrollTop = 0;
          }

          // 3. Trigger Phase Out (slices cleanly offscreen)
          wipe.className = 'animating phase-out';

          // 4. When slice clears offscreen (300ms), completely hide container
          setTimeout(() => {
            wipe.className = '';
            isTransitioning = false;
          }, 300);
        }, 300);
      }

      // Main Menu Click & Key Events
      menuItems.forEach((item) => {
        const target = item.getAttribute('data-target');
        item.addEventListener('click', () => switchView(target));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            switchView(target);
          }
        });
      });

      // Back / Cancel Buttons
      backButtons.forEach((btn) => {
        btn.addEventListener('click', () => switchView('view-home'));
      });

      // Quick Nav Buttons
      quickNavButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-target');
          if (target) switchView(target);
        });
      });

      // Keyboard Controls (1-5 to navigate, ESC / Backspace to return)
      window.addEventListener('keydown', (e) => {
        if (isTransitioning) return;

        // If inside a section and user presses Escape or Backspace
        if ((e.key === 'Escape' || e.key === 'Backspace') && currentViewId !== 'view-home') {
          e.preventDefault();
          switchView('view-home');
          return;
        }

        // Numeric shortcuts on Home screen
        if (currentViewId === 'view-home') {
          switch (e.key) {
            case '1':
              switchView('view-about');
              break;
            case '2':
              switchView('view-skills');
              break;
            case '3':
              switchView('view-history');
              break;
            case '4':
              switchView('view-projects');
              break;
            case '5':
              switchView('view-connect');
              break;
          }
        }
      });
    })();
