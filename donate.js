/* =================================================================
   Front Door / Ușa din Față — donate.js
   Logica paginii doneaza.html:
   - comutarea între cele 4 panouri (tab-uri)
   - selectarea sumei (butoane + sumă personalizată)
   - actualizarea textului de pe butonul de donație
   - pornirea plății către procesator (placeholder de conectat)

   CONECTARE PROCESATOR:
   Caută în acest fișier constanta PAY_CONFIG și înlocuiește
   buildPaymentUrl() cu logica procesatorului tău
   (Netopia / EuPlătesc / Stripe etc.).
   ================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     CONFIG PLĂȚI — de completat când ai contul de procesator
  --------------------------------------------------------------- */
  var PAY_CONFIG = {
    // ex: 'https://secure.procesator.ro/plata'
    endpoint: 'PLACEHOLDER_PROCESATOR_PLATI',
    currency: 'RON'
  };

  // construiește URL-ul de plată; ÎNLOCUIEȘTE cu specificul procesatorului
  function buildPaymentUrl(data) {
    // data = { type, amount, project }
    // Exemplu generic cu parametri în query string:
    var p = new URLSearchParams({
      tip: data.type,             // microproiect | unica | recurenta
      suma: data.amount,          // în lei
      moneda: PAY_CONFIG.currency,
      proiect: data.project || '',
      recurent: data.type === 'recurenta' ? '1' : '0'
    });
    return PAY_CONFIG.endpoint + '?' + p.toString();
  }

  /* ---------------------------------------------------------------
     1. COMUTARE TAB-URI / PANOURI
  --------------------------------------------------------------- */
  function initTabs() {
    var tabs = document.querySelectorAll('.donate-tab');
    var panels = document.querySelectorAll('.donate-panel');
    if (!tabs.length) return;

    function activate(panelId) {
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t.getAttribute('data-panel') === panelId);
      });
      panels.forEach(function (p) {
        p.classList.toggle('is-active', p.id === panelId);
      });
      // dacă URL-ul are #panel, derulează lin la zona de opțiuni
      var anchor = document.getElementById('optiuni');
      if (anchor && window.scrollY > anchor.offsetTop + 200) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('data-panel'));
        history.replaceState(null, '', '#' + tab.getAttribute('data-panel'));
      });
    });

    // deschide direct un panou dacă există hash în URL (ex. doneaza.html#panel-unica)
    var hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash) &&
        document.getElementById(hash).classList.contains('donate-panel')) {
      activate(hash);
    }
  }

  /* ---------------------------------------------------------------
     2. SELECTARE SUMĂ (per grup: micro / unica / recurenta)
  --------------------------------------------------------------- */
  // valoarea curentă pentru fiecare grup
  var selected = {};

  function initAmounts() {
    document.querySelectorAll('[data-amount-group]').forEach(function (grid) {
      var group = grid.getAttribute('data-amount-group');
      var buttons = grid.querySelectorAll('.amount-btn');
      var custom = grid.querySelector('[data-amount-custom]');

      // valoarea inițială = butonul activ
      var initial = grid.querySelector('.amount-btn.is-active');
      selected[group] = initial ? parseInt(initial.getAttribute('data-amount'), 10) : 0;
      updateDisplay(group);

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          if (custom) custom.value = '';
          selected[group] = parseInt(btn.getAttribute('data-amount'), 10);
          updateDisplay(group);
        });
      });

      if (custom) {
        custom.addEventListener('input', function () {
          var val = parseInt(custom.value, 10);
          if (!isNaN(val) && val > 0) {
            buttons.forEach(function (b) { b.classList.remove('is-active'); });
            selected[group] = val;
          } else {
            selected[group] = 0;
          }
          updateDisplay(group);
        });
      }
    });
  }

  function updateDisplay(group) {
    var el = document.querySelector('[data-amount-display="' + group + '"]');
    if (el) el.textContent = selected[group] > 0 ? selected[group] : '—';
  }

  /* ---------------------------------------------------------------
     3. BUTOANE DE DONAȚIE
  --------------------------------------------------------------- */
  // mapăm tipul butonului la grupul de sumă
  var TYPE_TO_GROUP = {
    microproiect: 'micro',
    unica: 'unica',
    recurenta: 'recurenta'
  };

  function initDonateButtons() {
    document.querySelectorAll('.btn-donate').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var type = btn.getAttribute('data-donate-type');
        var group = TYPE_TO_GROUP[type];
        var amount = selected[group];

        if (!amount || amount <= 0) {
          flash(btn, 'Alege mai întâi o sumă');
          return;
        }

        var project = '';
        if (type === 'microproiect') {
          var checked = document.querySelector('input[name="proiect"]:checked');
          project = checked ? checked.value : '';
        }

        var url = buildPaymentUrl({ type: type, amount: amount, project: project });

        // dacă procesatorul nu e încă conectat, avertizează în loc să redirecționezi spre placeholder
        if (PAY_CONFIG.endpoint.indexOf('PLACEHOLDER') === 0) {
          flash(btn, 'Procesatorul de plăți nu e conectat încă');
          console.warn('[donate] Setează PAY_CONFIG.endpoint în js/donate.js. URL generat:', url);
          return;
        }

        window.location.href = url;
      });
    });
  }

  // mesaj scurt pe buton (feedback fără alert)
  function flash(btn, msg) {
    var original = btn.dataset._orig || btn.innerHTML;
    btn.dataset._orig = original;
    btn.innerHTML = msg;
    btn.style.opacity = '.75';
    setTimeout(function () {
      btn.innerHTML = original;
      btn.style.opacity = '';
    }, 1800);
  }

  /* ---------------------------------------------------------------
     INIT
  --------------------------------------------------------------- */
  function init() {
    initTabs();
    initAmounts();
    initDonateButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
