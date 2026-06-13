/* =================================================================
   Front Door / Ușa din Față — modals.js
   Deschide/închide modalele Implică-te (mentor & gazdă).
   Folosit pe index.html.

   Cum funcționează:
   - Orice element cu data-modal="ID" deschide modalul cu acel id.
   - Orice element cu data-close din interiorul modalului îl închide.
   - Click pe fundal (overlay) sau tasta Escape închid modalul.
   - Se gestionează focusul și scroll-ul pentru accesibilitate.
   ================================================================= */
(function () {
  'use strict';

  var openOverlay = null;     // overlay-ul deschis acum
  var lastTrigger = null;     // elementul care a deschis modalul (pt. revenirea focusului)
  var SELECTOR_FOCUS =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /* ---------- DESCHIDE ---------- */
  function openModal(id, trigger) {
    var overlay = document.getElementById(id);
    if (!overlay) return;

    openOverlay = overlay;
    lastTrigger = trigger || null;

    overlay.hidden = false;
    // forțează un reflow ca tranziția .is-open să pornească
    void overlay.offsetWidth;
    overlay.classList.add('is-open');

    document.body.style.overflow = 'hidden';   // blochează scroll-ul în fundal

    // mută focusul în modal (primul câmp, altfel butonul de închidere)
    var focusables = overlay.querySelectorAll(SELECTOR_FOCUS);
    var first = overlay.querySelector('input, select, textarea') ||
                overlay.querySelector('.modal-close') ||
                focusables[0];
    if (first) {
      // mică întârziere ca elementul să fie deja vizibil
      setTimeout(function () { first.focus(); }, 60);
    }
  }

  /* ---------- ÎNCHIDE ---------- */
  function closeModal() {
    if (!openOverlay) return;
    var overlay = openOverlay;

    overlay.classList.remove('is-open');
    document.body.style.overflow = '';

    var done = function () {
      overlay.hidden = true;
      overlay.removeEventListener('transitionend', done);
    };
    // dacă tranzițiile sunt active, ascunde la final; altfel imediat
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done();
    } else {
      overlay.addEventListener('transitionend', done);
      // siguranță: dacă transitionend nu se declanșează
      setTimeout(done, 400);
    }

    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    openOverlay = null;
    lastTrigger = null;
  }

  /* ---------- CAPCANA DE FOCUS (Tab nu iese din modal) ---------- */
  function trapFocus(e) {
    if (!openOverlay || e.key !== 'Tab') return;
    var nodes = Array.prototype.filter.call(
      openOverlay.querySelectorAll(SELECTOR_FOCUS),
      function (el) { return el.offsetParent !== null; }
    );
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  /* ---------- LEGĂTURI DE EVENIMENTE ---------- */
  function init() {
    // deschidere
    document.querySelectorAll('[data-modal]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(btn.getAttribute('data-modal'), btn);
      });
    });

    // închidere prin butoane data-close
    document.querySelectorAll('[data-close]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        closeModal();
      });
    });

    // click pe overlay (în afara cutiei .modal)
    document.querySelectorAll('.modal-overlay').forEach(function (ov) {
      ov.addEventListener('mousedown', function (e) {
        if (e.target === ov) closeModal();
      });
    });

    // tastatură: Escape închide, Tab rămâne în modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openOverlay) {
        e.preventDefault();
        closeModal();
      } else {
        trapFocus(e);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // expune funcțiile (dacă vrei să deschizi un modal din alt script)
  window.FDModals = { open: openModal, close: closeModal };
})();
