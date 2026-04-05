(function () {
  'use strict';

  function debounce(fn, ms) {
    var t;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, args);
      }, ms);
    };
  }

  function normalize(str) {
    return (str || '').toLowerCase().trim();
  }

  function updateNavbarVisualState() {
    var navbar = document.querySelector('.site-navbar');
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  function ensureNavIndicator() {
    var rail = document.querySelector('.site-navbar .navbar-nav');
    if (!rail) return null;
    var indicator = rail.querySelector('.nav-indicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'nav-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      rail.insertBefore(indicator, rail.firstChild);
    }
    return indicator;
  }

  function updateNavIndicator() {
    var rail = document.querySelector('.site-navbar .navbar-nav');
    var active = document.querySelector('.site-navbar .navbar-nav .nav-link.active');
    var indicator = ensureNavIndicator();
    if (!rail || !active || !indicator || window.innerWidth < 992) {
      if (indicator) indicator.style.opacity = '0';
      return;
    }
    var railBox = rail.getBoundingClientRect();
    var activeBox = active.getBoundingClientRect();
    indicator.style.width = activeBox.width + 'px';
    indicator.style.transform = 'translate3d(' + (activeBox.left - railBox.left) + 'px, 0, 0)';
    indicator.style.opacity = '1';
  }

  function initNavbarEffects() {
    function refresh() {
      updateNavbarVisualState();
      updateNavIndicator();
    }

    window.addEventListener(
      'scroll',
      function () {
        window.requestAnimationFrame(updateNavbarVisualState);
      },
      { passive: true }
    );
    window.addEventListener('resize', debounce(refresh, 120));

    var collapse = document.querySelector('#projectsNav.navbar-collapse');
    if (collapse) {
      collapse.addEventListener('shown.bs.collapse', refresh);
      collapse.addEventListener('hidden.bs.collapse', refresh);
    }

    document.querySelectorAll('.site-navbar .nav-link, .site-navbar .btn-nav-cta').forEach(function (link) {
      link.addEventListener('mouseenter', updateNavIndicator);
      link.addEventListener('focus', updateNavIndicator);
    });

    refresh();
  }

  function initYear() {
    var el = document.getElementById('yearSpan');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initNavCollapse() {
    document.querySelectorAll('#projectsNav .nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        var nav = document.querySelector('#projectsNav.navbar-collapse');
        if (nav && nav.classList.contains('show') && typeof bootstrap !== 'undefined') {
          bootstrap.Collapse.getOrCreateInstance(nav).hide();
        }
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var nav = document.querySelector('#projectsNav.navbar-collapse.show');
      if (nav && typeof bootstrap !== 'undefined') {
        bootstrap.Collapse.getOrCreateInstance(nav).hide();
      }
    });
  }

  function initFilterAndSearch() {
    var grid = document.getElementById('projectsGrid');
    var empty = document.getElementById('projectsEmpty');
    var statVisible = document.getElementById('statVisible');
    var statVisibleBadge = document.getElementById('statVisibleBadge');
    var chips = document.querySelectorAll('.filter-chip');
    var searchInput = document.getElementById('projectSearch');
    var activeFilterLabel = document.getElementById('activeFilterLabel');

    if (!grid) return;

    var items = grid.querySelectorAll('.project-item');
    var statTotal = document.getElementById('statTotal');
    var statTotalBadge = document.getElementById('statTotalBadge');
    if (statTotal) statTotal.textContent = String(items.length);
    if (statTotalBadge) statTotalBadge.textContent = String(items.length);
    var activeFilter = 'all';
    var searchQuery = '';

    function getFilterLabel(filter) {
      if (filter === 'all') return 'All sectors';
      return filter.charAt(0).toUpperCase() + filter.slice(1);
    }

    function itemMatches(el) {
      var cat = el.getAttribute('data-category');
      if (activeFilter !== 'all' && cat !== activeFilter) return false;
      if (!searchQuery) return true;
      var titleEl = el.querySelector('.portfolio-card-title');
      var title = titleEl ? titleEl.textContent : '';
      var blob = normalize(el.getAttribute('data-search')) + ' ' + normalize(title);
      return blob.indexOf(searchQuery) !== -1;
    }

    function refresh() {
      var n = 0;
      items.forEach(function (el) {
        var show = itemMatches(el);
        el.classList.toggle('d-none', !show);
        if (show) n += 1;
      });
      if (statVisible) statVisible.textContent = String(n);
      if (statVisibleBadge) statVisibleBadge.textContent = String(n);
      if (empty) empty.classList.toggle('d-none', n !== 0);
      if (activeFilterLabel) {
        activeFilterLabel.textContent = getFilterLabel(activeFilter) + (searchQuery ? ' + Search' : '');
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        refresh();
      });
    });

    if (searchInput) {
      searchInput.addEventListener(
        'input',
        debounce(function () {
          searchQuery = normalize(searchInput.value);
          refresh();
        }, 120)
      );
    }

    refresh();
  }

  function initProjectModal() {
    var modalEl = document.getElementById('projectModal');
    if (!modalEl || typeof bootstrap === 'undefined') return;

    modalEl.addEventListener('show.bs.modal', function (event) {
      var trigger = event.relatedTarget;
      if (!trigger || !trigger.classList.contains('project-open')) return;

      var title = trigger.getAttribute('data-title') || 'Project';
      var category = trigger.getAttribute('data-category') || '';
      var detail = trigger.getAttribute('data-detail') || '';

      var titleEl = document.getElementById('projectModalTitle');
      var catEl = document.getElementById('projectModalCategory');
      var bodyEl = document.getElementById('projectModalBody');

      if (titleEl) titleEl.textContent = title;
      if (catEl) catEl.textContent = category;
      if (bodyEl) bodyEl.textContent = detail;
    });
  }

  function getToast() {
    var el = document.getElementById('siteToast');
    if (!el || typeof bootstrap === 'undefined') return null;
    return bootstrap.Toast.getOrCreateInstance(el, { delay: 3800 });
  }

  function showToast(title, message, variant) {
    var root = document.getElementById('siteToast');
    if (!root) return;
    var titleEl = root.querySelector('.toast-title');
    var bodyEl = root.querySelector('.toast-msg');
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = message;
    root.classList.remove('toast--success', 'toast--neutral');
    root.classList.add(variant === 'success' ? 'toast--success' : 'toast--neutral');
    var t = getToast();
    if (t) t.show();
  }

  function initCopyEmail() {
    document.querySelectorAll('[data-copy-email]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var email = btn.getAttribute('data-copy-email');
        if (!email) return;
        function fallback() {
          showToast('Email', email, 'neutral');
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(function () {
            showToast('Copied', email + ' is on your clipboard.', 'success');
          }).catch(fallback);
        } else {
          fallback();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavbarEffects();
    initYear();
    initNavCollapse();
    initFilterAndSearch();
    initProjectModal();
    initCopyEmail();
  });
})();
