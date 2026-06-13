/* =================================================================
   Front Door / Ușa din Față — form230.js
   Generator PDF pentru Formularul 230 (redirecționare până la 3,5%
   din impozitul pe venit). Rulează integral în browser.

   Butoane din doneaza.html:
     #btn230Download  → generează și descarcă PDF-ul
     #btn230Send      → generează PDF-ul și îl trimite asociației

   DE COMPLETAT:
   - ASSOCIATION: datele oficiale ale asociației (CIF + IBAN încă lipsesc).
   - SEND_ENDPOINT: endpoint-ul serviciului de formulare (Tally/Formspree)
     care primește PDF-ul. Marcat PLACEHOLDER_TALLY_230.

   Dependențe (încărcate dinamic din CDN, nu trebuie adăugate în HTML):
   - jsPDF (generare PDF)
   - font DejaVuSans (pentru diacritice românești: ă â î ș ț)
   ================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     DATELE ASOCIAȚIEI — de completat cu valorile reale
  --------------------------------------------------------------- */
  var ASSOCIATION = {
    denumire: 'Asociația Front Door / Ușa din Față',
    cif: 'PLACEHOLDER_CIF',                 // CIF-ul nu există încă în statut
    cont: 'PLACEHOLDER_IBAN',               // contul IBAN al asociației
    procent: '3,5'                          // procentul redirecționat
  };

  // endpoint care primește PDF-ul când donatorul alege „Trimite asociației"
  var SEND_ENDPOINT = 'PLACEHOLDER_TALLY_230';

  // surse CDN
  var JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  var FONT_URL  = 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf';

  var jsPDFReady = null;   // promisiune cache
  var fontB64 = null;      // fontul, base64, cache

  /* ---------------------------------------------------------------
     ÎNCĂRCARE DINAMICĂ jsPDF
  --------------------------------------------------------------- */
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error('script: ' + src)); };
      document.head.appendChild(s);
    });
  }

  function ensureJsPDF() {
    if (jsPDFReady) return jsPDFReady;
    jsPDFReady = (window.jspdf && window.jspdf.jsPDF)
      ? Promise.resolve()
      : loadScript(JSPDF_URL);
    return jsPDFReady;
  }

  /* ---------------------------------------------------------------
     FONT cu diacritice (opțional, dar recomandat)
     Dacă încărcarea eșuează, se folosește Helvetica + transliterare.
  --------------------------------------------------------------- */
  function ensureFont() {
    if (fontB64) return Promise.resolve(fontB64);
    return fetch(FONT_URL)
      .then(function (r) { if (!r.ok) throw new Error('font'); return r.arrayBuffer(); })
      .then(function (buf) {
        var bytes = new Uint8Array(buf), bin = '';
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        fontB64 = btoa(bin);
        return fontB64;
      })
      .catch(function () { return null; });
  }

  // transliterare de rezervă, dacă fontul Unicode nu s-a încărcat
  function ascii(str) {
    return (str || '')
      .replace(/[ăâ]/g, 'a').replace(/[ĂÂ]/g, 'A')
      .replace(/î/g, 'i').replace(/Î/g, 'I')
      .replace(/[șş]/g, 's').replace(/[ȘŞ]/g, 'S')
      .replace(/[țţ]/g, 't').replace(/[ȚŢ]/g, 'T');
  }

  /* ---------------------------------------------------------------
     COLECTARE + VALIDARE DATE
  --------------------------------------------------------------- */
  function getData() {
    var form = document.getElementById('form230');
    if (!form) return null;
    var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    return {
      nume: v('f-nume'),
      prenume: v('f-prenume'),
      initiala: v('f-initiala'),
      cnp: v('f-cnp'),
      strada: v('f-strada'),
      oras: v('f-oras'),
      judet: v('f-judet'),
      cod: v('f-cod'),
      email: v('f-email230'),
      telefon: v('f-tel230'),
      doiAni: (function () { var c = form.querySelector('input[name="doiAni"]'); return c && c.checked; })(),
      gdpr: (function () { var c = form.querySelector('input[name="gdpr"]'); return c && c.checked; })()
    };
  }

  function validate(d) {
    var errors = [];
    if (!d.nume) errors.push('Nume');
    if (!d.prenume) errors.push('Prenume');
    if (!/^\d{13}$/.test(d.cnp)) errors.push('CNP (13 cifre)');
    if (!d.strada) errors.push('Adresă');
    if (!d.oras) errors.push('Localitate');
    if (!d.judet) errors.push('Județ');
    if (!/.+@.+\..+/.test(d.email)) errors.push('Email');
    if (!d.gdpr) errors.push('Acordul GDPR');
    return errors;
  }

  /* ---------------------------------------------------------------
     CONSTRUIRE PDF
     Întoarce instanța jsPDF.
  --------------------------------------------------------------- */
  function buildPdf(d, hasFont) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: 'mm', format: 'a4' });

    var useUnicode = false;
    if (hasFont && fontB64) {
      try {
        doc.addFileToVFS('DejaVuSans.ttf', fontB64);
        doc.addFont('DejaVuSans.ttf', 'DejaVu', 'normal');
        doc.setFont('DejaVu', 'normal');
        useUnicode = true;
      } catch (e) { useUnicode = false; }
    }
    if (!useUnicode) doc.setFont('helvetica', 'normal');

    var T = function (s) { return useUnicode ? (s || '') : ascii(s); };

    var L = 18, R = 192, y = 18, lh = 6;
    function line(text, opts) {
      opts = opts || {};
      doc.setFontSize(opts.size || 10);
      if (opts.bold) { useUnicode ? doc.setFont('DejaVu', 'normal') : doc.setFont('helvetica', 'bold'); }
      else { useUnicode ? doc.setFont('DejaVu', 'normal') : doc.setFont('helvetica', 'normal'); }
      doc.text(T(text), opts.x || L, y);
      if (!opts.inline) y += (opts.gap || lh);
    }
    function rule() { doc.setDrawColor(150); doc.line(L, y, R, y); y += 4; }
    function box(label, value, x, w) {
      doc.setFontSize(8); doc.setTextColor(90);
      doc.text(T(label), x, y);
      doc.setTextColor(20); doc.setFontSize(11);
      doc.text(T(value || '—'), x, y + 5);
      doc.setDrawColor(180); doc.line(x, y + 7, x + w, y + 7);
    }

    // antet
    doc.setFontSize(8); doc.setTextColor(90);
    doc.text(T('ANEXA nr. 230  ·  Cerere privind destinația sumei reprezentând'), L, y); y += 4;
    doc.text(T('până la 3,5% din impozitul anual datorat'), L, y); y += 8;
    doc.setTextColor(20);
    doc.setFontSize(15);
    line('FORMULAR 230', { bold: true, size: 15, gap: 4 });
    doc.setFontSize(10);
    line('Destinația sumei de ' + ASSOCIATION.procent + '% din impozitul pe venit', { gap: 8 });
    rule();

    // I. Date contribuabil
    line('I. DATE DE IDENTIFICARE A CONTRIBUABILULUI', { bold: true, gap: 8 });
    box('Nume', d.nume, L, 80);
    box('Inițiala tatălui', d.initiala, L + 90, 40); y += 12;
    box('Prenume', d.prenume, L, 80);
    box('CNP', d.cnp, L + 90, 80); y += 12;
    box('Stradă, nr., bloc, scară, etaj, ap.', d.strada, L, 160); y += 12;
    box('Localitate', d.oras, L, 70);
    box('Județ', d.judet, L + 80, 50);
    box('Cod poștal', d.cod, L + 140, 34); y += 12;
    box('E-mail', d.email, L, 90);
    box('Telefon', d.telefon, L + 100, 60); y += 14;
    rule();

    // II. Destinația
    line('II. DESTINAȚIA SUMEI · ENTITATE NONPROFIT', { bold: true, gap: 8 });
    box('Denumirea entității', ASSOCIATION.denumire, L, 160); y += 12;
    box('Cod de identificare fiscală (CIF)', ASSOCIATION.cif, L, 80);
    box('Procent (%)', ASSOCIATION.procent, L + 90, 40); y += 12;
    box('Cont bancar (IBAN)', ASSOCIATION.cont, L, 160); y += 14;

    // opțiunea 2 ani
    doc.setFontSize(10);
    var mark = d.doiAni ? '[X]' : '[ ]';
    line(mark + ' Solicit redirecționarea pentru o perioadă de 2 ani', { gap: 10 });
    rule();

    // semnătură + dată
    y += 6;
    box('Data', '', L, 50);
    box('Semnătura contribuabilului', '', R - 70, 70); y += 16;

    // subsol
    doc.setFontSize(7.5); doc.setTextColor(120);
    doc.text(T('Document generat de frontdoor.ro. Verifică datele înainte de semnare și depunere la ANAF.'), L, 285);

    return doc;
  }

  /* ---------------------------------------------------------------
     FLUX: pregătește (jsPDF + font + validare) → întoarce doc
  --------------------------------------------------------------- */
  function prepare() {
    var d = getData();
    if (!d) return Promise.reject({ type: 'noform' });
    var errors = validate(d);
    if (errors.length) return Promise.reject({ type: 'validation', errors: errors });

    return ensureJsPDF()
      .then(ensureFont)
      .then(function (font) { return buildPdf(d, !!font); })
      .then(function (doc) { return { doc: doc, data: d }; });
  }

  function fileName(d) {
    var base = (d.nume + '_' + d.prenume).replace(/\s+/g, '_').replace(/[^\w]/g, '');
    return 'Formular_230_' + (base || 'frontdoor') + '.pdf';
  }

  /* ---------------------------------------------------------------
     ACȚIUNI BUTOANE
  --------------------------------------------------------------- */
  function download() {
    setStatus('', '');
    prepare().then(function (res) {
      res.doc.save(fileName(res.data));
      setStatus('PDF-ul a fost generat. Semnează-l și depune-l la ANAF — sau trimite-ni-l nouă.', 'ok');
    }).catch(handleError);
  }

  function send() {
    setStatus('', '');
    if (SEND_ENDPOINT.indexOf('PLACEHOLDER') === 0) {
      setStatus('Trimiterea către asociație nu e conectată încă. Descarcă PDF-ul și depune-l tu.', 'error');
      return;
    }
    prepare().then(function (res) {
      var blob = res.doc.output('blob');
      var fd = new FormData();
      fd.append('document', blob, fileName(res.data));
      fd.append('nume', res.data.nume);
      fd.append('prenume', res.data.prenume);
      fd.append('email', res.data.email);
      fd.append('doiAni', res.data.doiAni ? 'da' : 'nu');
      setBusy(true);
      return fetch(SEND_ENDPOINT, { method: 'POST', body: fd });
    }).then(function (r) {
      setBusy(false);
      if (r && r.ok) setStatus('Formularul a fost trimis asociației. Îți mulțumim!', 'ok');
      else setStatus('Trimiterea nu a reușit. Încearcă din nou sau descarcă PDF-ul.', 'error');
    }).catch(function (err) {
      setBusy(false);
      handleError(err);
    });
  }

  /* ---------------------------------------------------------------
     STARE / MESAJE
  --------------------------------------------------------------- */
  function statusEl() {
    var el = document.getElementById('status230');
    if (!el) {
      var form = document.getElementById('form230');
      if (!form) return null;
      el = document.createElement('p');
      el.id = 'status230';
      el.className = 'form-status';
      form.appendChild(el);
    }
    return el;
  }
  function setStatus(msg, kind) {
    var el = statusEl(); if (!el) return;
    el.textContent = msg;
    el.className = 'form-status' + (kind === 'ok' ? ' is-ok' : kind === 'error' ? ' is-error' : '');
    if (msg) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function setBusy(b) {
    ['btn230Download', 'btn230Send'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.disabled = b; el.style.opacity = b ? '.6' : ''; }
    });
  }
  function handleError(err) {
    setBusy(false);
    if (err && err.type === 'validation') {
      setStatus('Completează corect: ' + err.errors.join(', ') + '.', 'error');
    } else {
      setStatus('A apărut o eroare la generarea PDF-ului. Verifică conexiunea și încearcă din nou.', 'error');
      console.error('[form230]', err);
    }
  }

  /* ---------------------------------------------------------------
     INIT
  --------------------------------------------------------------- */
  function init() {
    var dl = document.getElementById('btn230Download');
    var sn = document.getElementById('btn230Send');
    if (dl) dl.addEventListener('click', download);
    if (sn) sn.addEventListener('click', send);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
