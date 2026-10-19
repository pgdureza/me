/**
 * Persona 5 Portfolio Router
 * Manages hash-based routing (#about-me, #skill-matrix, etc.),
 * browser history (Back / Forward navigation), and deep linking.
 */
(function () {
  'use strict';

  // Map URL hashes to section view IDs
  const HASH_TO_VIEW = {
    '': 'view-home',
    '#': 'view-home',
    '#home': 'view-home',
    '#about-me': 'view-about',
    '#skill-matrix': 'view-skills',
    '#work-history': 'view-history',
    '#personal-projects': 'view-projects',
    '#connect': 'view-connect'
  };

  // Map section view IDs to canonical URL hashes
  const VIEW_TO_HASH = {
    'view-home': '',
    'view-about': '#about-me',
    'view-skills': '#skill-matrix',
    'view-history': '#work-history',
    'view-projects': '#personal-projects',
    'view-connect': '#connect'
  };

  class P5Router {
    constructor() {
      this.routeChangeCallback = null;
      this.isProgrammaticNav = false;
    }

    /**
     * Get the view ID corresponding to the current window hash
     */
    getCurrentViewId() {
      const hash = (window.location.hash || '').toLowerCase();
      return HASH_TO_VIEW[hash] || 'view-home';
    }

    /**
     * Get the canonical hash for a given view ID
     */
    getHashForView(viewId) {
      return VIEW_TO_HASH[viewId] || '';
    }

    /**
     * Programmatically navigate to a view and update browser history
     * @param {string} viewId - Target view ID (e.g. 'view-about')
     */
    navigateTo(viewId) {
      const targetHash = this.getHashForView(viewId);
      const currentHash = window.location.hash;

      if (targetHash === '' && currentHash !== '') {
        // Navigating back to home: use pushState or empty hash
        this.isProgrammaticNav = true;
        history.pushState(null, '', window.location.pathname + window.location.search);
        if (this.routeChangeCallback) {
          this.routeChangeCallback('view-home');
        }
        setTimeout(() => { this.isProgrammaticNav = false; }, 50);
      } else if (targetHash !== '' && currentHash !== targetHash) {
        this.isProgrammaticNav = true;
        window.location.hash = targetHash;
        if (this.routeChangeCallback) {
          this.routeChangeCallback(viewId);
        }
        setTimeout(() => { this.isProgrammaticNav = false; }, 50);
      } else if (this.routeChangeCallback) {
        this.routeChangeCallback(viewId);
      }
    }

    /**
     * Navigate backward using browser history if possible
     */
    navigateBack() {
      if (window.location.hash) {
        if (window.history.length > 1) {
          history.back();
        } else {
          this.navigateTo('view-home');
        }
      } else {
        this.navigateTo('view-home');
      }
    }

    /**
     * Initialize router and bind history listeners
     * @param {Function} onRouteChange - Callback invoked with (targetViewId)
     */
    init(onRouteChange) {
      this.routeChangeCallback = onRouteChange;

      // Handle browser back and forward button clicks
      const handleHistoryChange = () => {
        if (this.isProgrammaticNav) return;
        const targetViewId = this.getCurrentViewId();
        if (this.routeChangeCallback) {
          this.routeChangeCallback(targetViewId);
        }
      };

      window.addEventListener('popstate', handleHistoryChange);
      window.addEventListener('hashchange', handleHistoryChange);

      // Return the initial route based on URL hash
      return this.getCurrentViewId();
    }
  }

  // Export singleton to global scope
  window.p5Router = new P5Router();
})();
