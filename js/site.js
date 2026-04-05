(function () {
  'use strict';

  var SECTION_IDS = ['home-content', 'education-pg', 'about-1', 'contact-form-id'];
  var DRAFT_KEY = 'helloVerseContactDraft';
  var SIDEBAR_KEY = 'helloVerseSidebarCollapsed';
  var NAV_LINK_SELECTOR = '.site-navbar .navbar-nav .nav-link[href^="#"]';
  var SECTION_GAP = 0;

  function isDesktopMainScrollMode() {
    return document.body.classList.contains('home-page') && window.innerWidth >= 992 && !!document.getElementById('main-content');
  }

  function getScrollContainer() {
    if (isDesktopMainScrollMode()) {
      return document.getElementById('main-content');
    }
    return window;
  }

  function getScrollTop() {
    var scroller = getScrollContainer();
    return scroller === window ? window.scrollY : scroller.scrollTop;
  }

  function getViewportHeight() {
    var scroller = getScrollContainer();
    return scroller === window ? window.innerHeight : scroller.clientHeight;
  }

  function updateNavbarOffset() {
    var root = document.documentElement;
    var navbar = document.querySelector('.site-navbar');
    var offset = 112;
    if (navbar) {
      offset = Math.ceil(navbar.getBoundingClientRect().bottom) + SECTION_GAP;
    }
    root.style.setProperty('--nav-offset', offset + 'px');
    root.style.setProperty('--section-gap', SECTION_GAP + 'px');
    return offset;
  }

  function getNavbarOffset() {
    return updateNavbarOffset();
  }

  function scrollToSection(target) {
    if (!target) return;
    var scroller = getScrollContainer();
    if (scroller === window) {
      var top = target.getBoundingClientRect().top + window.scrollY - getNavbarOffset();
      window.scrollTo({
        top: Math.max(0, top),
        behavior: 'smooth'
      });
      return;
    }

    var scrollerBox = scroller.getBoundingClientRect();
    var targetBox = target.getBoundingClientRect();
    var relativeTop = targetBox.top - scrollerBox.top + scroller.scrollTop;

    scroller.scrollTo({
      top: Math.max(0, relativeTop),
      behavior: 'smooth'
    });
  }

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

  function getScrollPercent() {
    var scroller = getScrollContainer();
    var sh = 0;
    var top = 0;
    if (scroller === window) {
      var el = document.documentElement;
      sh = el.scrollHeight - el.clientHeight;
      top = el.scrollTop;
    } else {
      sh = scroller.scrollHeight - scroller.clientHeight;
      top = scroller.scrollTop;
    }
    if (sh <= 0) return 0;
    return Math.min(100, Math.round((top / sh) * 100));
  }

  function updateScrollProgress() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    var p = getScrollPercent();
    bar.style.width = p + '%';
    bar.setAttribute('aria-valuenow', String(p));
  }

  function getActiveSectionId() {
    var scroller = getScrollContainer();
    var marker = getScrollTop() + getViewportHeight() * 0.28;
    var current = SECTION_IDS[0];
    SECTION_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var top = scroller === window ? el.offsetTop : el.offsetTop;
      if (top <= marker) current = id;
    });
    return current;
  }

  function setActiveNav(id) {
    document.querySelectorAll(NAV_LINK_SELECTOR).forEach(function (link) {
      var href = link.getAttribute('href');
      var match = href === '#' + id;
      link.classList.toggle('active', match);
    });
    updateNavIndicator();
  }

  function updateNavbarVisualState() {
    var navbar = document.querySelector('.site-navbar');
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', getScrollTop() > 18);
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
    var navbar = document.querySelector('.site-navbar');
    if (!navbar) return;
    var activeScroller = null;

    function refresh() {
      updateNavbarOffset();
      updateNavbarVisualState();
      updateNavIndicator();
    }

    function bindScroller() {
      var nextScroller = getScrollContainer();
      if (activeScroller === nextScroller) return;
      if (activeScroller) {
        activeScroller.removeEventListener('scroll', refreshOnScroll);
      }
      activeScroller = nextScroller;
      activeScroller.addEventListener('scroll', refreshOnScroll, { passive: true });
    }

    function refreshOnScroll() {
      window.requestAnimationFrame(function () {
        updateNavbarVisualState();
      });
    }

    bindScroller();

    window.addEventListener('resize', debounce(function () {
      bindScroller();
      refresh();
    }, 120));

    var collapses = document.querySelectorAll('.site-navbar .navbar-collapse');
    collapses.forEach(function (collapse) {
      collapse.addEventListener('shown.bs.collapse', refresh);
      collapse.addEventListener('hidden.bs.collapse', refresh);
    });

    document.querySelectorAll('.site-navbar .nav-link, .site-navbar .btn-nav-cta').forEach(function (link) {
      link.addEventListener('mouseenter', updateNavIndicator);
      link.addEventListener('focus', updateNavIndicator);
    });

    refresh();
  }

  function initScrollSpy() {
    var sectionExists = SECTION_IDS.some(function (id) {
      return !!document.getElementById(id);
    });
    if (!sectionExists) {
      updateScrollProgress();
      return;
    }

    var ticking = false;
    var activeScroller = null;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          setActiveNav(getActiveSectionId());
          updateScrollProgress();
          updateBackToTop();
          updateNavIndicator();
          ticking = false;
        });
        ticking = true;
      }
    }

    function bindScroller() {
      var nextScroller = getScrollContainer();
      if (activeScroller === nextScroller) return;
      if (activeScroller) {
        activeScroller.removeEventListener('scroll', onScroll);
      }
      activeScroller = nextScroller;
      activeScroller.addEventListener('scroll', onScroll, { passive: true });
    }

    bindScroller();
    window.addEventListener('resize', debounce(function () {
      bindScroller();
      updateNavbarOffset();
      onScroll();
    }, 150));
    updateNavbarOffset();
    onScroll();
    window.addEventListener('hashchange', function () {
      var hash = window.location.hash.slice(1);
      if (hash && SECTION_IDS.indexOf(hash) !== -1) {
        setActiveNav(hash);
      }
    });
    if (window.location.hash) {
      var initial = window.location.hash.slice(1);
      if (SECTION_IDS.indexOf(initial) !== -1) {
        setActiveNav(initial);
        var initialTarget = document.getElementById(initial);
        if (initialTarget) {
          window.requestAnimationFrame(function () {
            scrollToSection(initialTarget);
          });
        }
      }
    }
  }

  function updateBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    var show = getScrollTop() > 420;
    btn.classList.toggle('is-visible', show);
    btn.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var scroller = getScrollContainer();
      if (scroller === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      scroller.scrollTo({ top: 0, behavior: 'smooth' });
    });
    updateBackToTop();
  }

  function getToast() {
    var el = document.getElementById('siteToast');
    if (!el || typeof bootstrap === 'undefined') return null;
    return bootstrap.Toast.getOrCreateInstance(el, { delay: 4200 });
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

  function loadFormDraft(form) {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      ['fullName', 'email', 'phone', 'subject', 'message'].forEach(function (name) {
        var field = form.elements.namedItem(name);
        if (field && data[name]) field.value = data[name];
      });
    } catch (e) {
      /* ignore */
    }
  }

  function saveFormDraft(form) {
    var data = {
      fullName: form.fullName ? form.fullName.value : '',
      email: form.email ? form.email.value : '',
      phone: form.phone ? form.phone.value : '',
      subject: form.subject ? form.subject.value : '',
      message: form.message ? form.message.value : ''
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
      /* ignore */
    }
  }

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    loadFormDraft(form);

    form.addEventListener(
      'input',
      debounce(function () {
        saveFormDraft(form);
      }, 400)
    );

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      showToast(
        'Message captured',
        'Thanks! This demo does not send email yet—connect the form to Formspree, Netlify Forms, or your API when you deploy.',
        'success'
      );
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (err) {
        /* ignore */
      }
      form.reset();
    });
  }

  function initNavCollapse() {
    document.querySelectorAll('.navbar-nav .nav-link[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href') || '';
        var targetId = href.slice(1);
        var target = targetId ? document.getElementById(targetId) : null;
        if (!target) return;

        e.preventDefault();

        function finishScroll() {
          scrollToSection(target);
          if (window.location.hash !== href) {
            history.replaceState(null, '', href);
          }
          setActiveNav(targetId);
        }

        var nav = document.querySelector('.navbar-collapse');
        if (nav && nav.classList.contains('show') && typeof bootstrap !== 'undefined') {
          nav.addEventListener('hidden.bs.collapse', finishScroll, { once: true });
          bootstrap.Collapse.getOrCreateInstance(nav).hide();
          return;
        }

        finishScroll();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var nav = document.querySelector('.navbar-collapse.show');
      if (nav && typeof bootstrap !== 'undefined') {
        bootstrap.Collapse.getOrCreateInstance(nav).hide();
      }
    });
  }

  function initCopyEmail() {
    document.querySelectorAll('[data-copy-email]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var email = btn.getAttribute('data-copy-email');
        if (!email) return;
        function done() {
          showToast('Copied', email + ' is on your clipboard.', 'neutral');
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(done).catch(function () {
            showToast('Email', email, 'neutral');
          });
        } else {
          showToast('Email', email, 'neutral');
        }
      });
    });
  }

  function initReducedMotionAOS() {
    if (typeof AOS === 'undefined') return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    AOS.init({
      duration: reduce ? 0 : 700,
      once: true,
      offset: 40,
      disable: reduce
    });
  }

  function initCurrentYear() {
    var el = document.getElementById('yearSpan');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initEducationRoadmap() {
    var roadmap = document.getElementById('educationRoadmap');
    if (!roadmap) return;

    var revealItems = roadmap.querySelectorAll('.education-atlas__hero, .education-stat, .education-card');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scroller = getScrollContainer();
    var observerRoot = scroller === window ? null : scroller;

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      revealItems.forEach(function (item) {
        item.classList.add('is-revealed');
      });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      {
        root: observerRoot,
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  function initSidebarToggle() {
    var btn = document.getElementById('sidebarToggle');
    var sidebar = document.getElementById('homeSidebar');
    if (!btn || !sidebar || !document.body.classList.contains('home-page')) return;

    function setState(collapsed) {
      document.body.classList.toggle('sidebar-collapsed', collapsed);
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      btn.setAttribute('aria-label', collapsed ? 'Open sidebar' : 'Close sidebar');
      updateNavIndicator();
      updateScrollProgress();
      updateNavbarOffset();
      try {
        sessionStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
      } catch (e) {
        /* ignore */
      }
    }

    var collapsed = false;
    try {
      collapsed = sessionStorage.getItem(SIDEBAR_KEY) === '1';
    } catch (e) {
      collapsed = false;
    }
    setState(collapsed);

    btn.addEventListener('click', function () {
      setState(!document.body.classList.contains('sidebar-collapsed'));
    });

    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth < 992) {
        document.body.classList.remove('sidebar-collapsed');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        updateNavIndicator();
        updateNavbarOffset();
      }
    }, 120));
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('home-page') && window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    initNavbarEffects();
    initReducedMotionAOS();
    initScrollSpy();
    initBackToTop();
    initContactForm();
    initNavCollapse();
    initCopyEmail();
    initCurrentYear();
    initSidebarToggle();
    initEducationRoadmap();
  });
})();
