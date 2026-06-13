# Front Door / Ușa din Față — Site web

Site static HTML/CSS/JS, găzduit pe **GitHub Pages**.

---

## Structura fișierelor

```
frontdoor.ro/
│
├── index.html
├── despre.html
├── doneaza.html
├── politica-confidentialitate.html
│
├── fondatori/
│   ├── mazilescu.html
│   ├── samoila.html
│   └── fechete.html
│
├── css/
│   ├── style.css
│   └── forms.css
│
├── js/
│   ├── main.js
│   ├── modals.js
│   ├── donate.js
│   └── form230.js
│
└── assets/
    ├── logo-mono-blue.png
    ├── logo-mono-white.png
    ├── logo-lockup-blue.png
    ├── logo-lockup-white.png
    └── fondatori/
        ├── mazilescu.jpg
        ├── samoila.jpg
        ├── fechete.jpg
        ├── mazilescu/   ← galerie (01.jpg … 06.jpg)
        ├── samoila/
        └── fechete/
```

---

## Publicare pe GitHub Pages

### Prima dată

1. Creează un repository nou pe GitHub (ex. `frontdoor-site`).
2. Clonează-l local sau încarcă fișierele direct prin interfața web.
3. Asigură-te că `index.html` e la rădăcina repository-ului (nu într-un subfolder).
4. În repository → **Settings → Pages**:
   - Source: `Deploy from a branch`
   - Branch: `main` / `master`, folder: `/ (root)`
   - Salvează.
5. După ~1 minut, site-ul e live la `https://USERNAME.github.io/REPO/`.

### Domeniu propriu (frontdoor.ro)

1. În **Settings → Pages → Custom domain**, introdu `frontdoor.ro`.
2. La registratorul de domeniu, adaugă înregistrări DNS:
   - 4 înregistrări **A** către IP-urile GitHub Pages:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - O înregistrare **CNAME** `www` → `USERNAME.github.io`
3. Bifează **Enforce HTTPS** după ce certificatul SSL se emite (până la 24h).

### Actualizări ulterioare

Orice `git push` pe branch-ul configurat republicare automată site-ul în ~30 secunde.

---

## Conectarea serviciilor externe (PLACEHOLDER-uri)

Caută în fișiere textul `PLACEHOLDER_` — sunt marcate toate punctele de conectare.

### Formulare (Tally)

1. Creează cont gratuit la [tally.so](https://tally.so).
2. Construiește formularul (sau importă câmpurile din `index.html`).
3. În Tally → Share → obții un URL de tip `https://tally.so/r/XXXX`.
4. Înlocuiește în `index.html`:
   - `PLACEHOLDER_TALLY_MENTOR` → URL-ul formularului de mentorat
   - `PLACEHOLDER_TALLY_GAZDA` → URL-ul formularului de găzduire
5. Opțional: folosește embed-ul Tally în loc de `<form>` nativ (instrucțiunea e în comentariile din HTML).

### Newsletter

- `PLACEHOLDER_NEWSLETTER_ENDPOINT` în `index.html` → endpoint Mailchimp, Brevo sau alt serviciu.
- Alternativ, creează un formular Tally pentru newsletter și pune URL-ul acolo.

### Plăți (donații)

În `js/donate.js`, constanta `PAY_CONFIG.endpoint`:

```js
var PAY_CONFIG = {
  endpoint: 'https://secure.netopia-payments.com/...',  // ← înlocuiește
  currency: 'RON'
};
```

Procesatori recomandate pentru România:
- **Netopia mobilPay** — [netopia-payments.com](https://netopia-payments.com)
- **EuPlătesc** — [euplatesc.ro](https://euplatesc.ro)
- **PayU** — [payu.ro](https://payu.ro)

Necesită: CIF asociație + cont bancar + contract cu procesatorul.

### Formularul 230 (generator PDF)

În `js/form230.js`, obiectul `ASSOCIATION`:

```js
var ASSOCIATION = {
  denumire: 'Asociația Front Door / Ușa din Față',
  cif: 'XXXXXXXX',       // ← CIF-ul asociației după înregistrare
  cont: 'ROXX XXXX ...'  // ← IBAN-ul contului asociației
};
```

Butonul „Trimite asociației" necesită și:
```js
var SEND_ENDPOINT = 'https://tally.so/r/XXXX';  // ← formular Tally care primește PDF
```

---

## Date și texte de completat

| Fișier | Ce lipsește |
|--------|-------------|
| `index.html` | Date reale evenimente (secțiunea Program), numere transparență (`data-count`) |
| `despre.html` | — |
| `fondatori/mazilescu.html` | Bio, linkuri YouTube/Instagram/Podcast, ID-uri video, episoade podcast |
| `fondatori/samoila.html` | idem |
| `fondatori/fechete.html` | idem |
| `assets/fondatori/` | Fotografiile fondatorilor și galeria fiecăruia |
| `footer` (toate paginile) | Linkurile reale Instagram, TikTok, Facebook |

---

## Note tehnice

- **Fără dependențe de build** — nu e nevoie de Node.js, npm sau bundler. Fișierele merg direct în browser.
- **jsPDF** (pentru formularul 230) se încarcă dinamic din CDN doar când utilizatorul apasă butonul de generare PDF — nu afectează viteza inițială a paginii.
- **Tema light/dark** se detectează automat din setările sistemului de operare (`prefers-color-scheme`). Nu există un toggle manual — schimbarea temei din OS/browser se reflectă instant în site.
- **`prefers-reduced-motion`** e respectat: animațiile de scroll și tranziții se dezactivează pentru utilizatorii care au setat această preferință.
- **GDPR**: toate formularele au bifă de consimțământ și trimit la `politica-confidentialitate.html`. Asigură-te că politica e completată cu datele reale ale asociației înainte de lansare.
