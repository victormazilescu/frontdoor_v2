/* =================================================================
   Front Door / Ușa din Față — main.js
   Animații la scroll (IntersectionObserver) · meniu mobil · contoare
   Comun tuturor paginilor.
   ================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. REVEAL LA SCROLL
     Elementele cu .reveal apar (fade + glisare) când intră în ecran.
     Cardurile vecine din același rând primesc un mic decalaj (stagger).
  --------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    // fallback: dacă nu există IntersectionObserver sau e mișcare redusă, arată tot.
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // decalaj pentru carduri din aceeași grilă
    document.querySelectorAll('.cards, .founders, .stats, .video-grid, .gallery, .founder-nav, .donate-options')
      .forEach(function (group) {
        var kids = group.querySelectorAll('.reveal');
        kids.forEach(function (kid, i) {
          kid.style.setProperty('--d', (Math.min(i, 6) * 70) + 'ms');
        });
      });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
     2. MENIU MOBIL
  --------------------------------------------------------------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    function close() {
      toggle.classList.remove('is-open');
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // închide la click pe un link
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    // închide la resize peste breakpoint
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) close();
    });

    // închide cu Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------------------------------------------------------------
     3. CONTOARE (transparență)
     Animă numerele cu atributul data-count de la 0 la valoare.
     Valorile reale se pun în HTML: <b data-count="12450">—</b>
  --------------------------------------------------------------- */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (target <= 0 || reduceMotion) {
        el.textContent = target > 0 ? target.toLocaleString('ro-RO') : '—';
        return;
      }
      var start = performance.now();
      var dur = 1400;
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(target * eased).toLocaleString('ro-RO');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      nums.forEach(run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
     INIT
  --------------------------------------------------------------- */
  function init() {
    initReveal();
    initNav();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
