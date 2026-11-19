> **Historical Snapshot Notice**: This earlier verification snapshot is superseded by `FEATURES_VERIFICATION_REPORT.md` and `PHASE4_TEST_REPORT.md` following the Unified Phase 1–4 Roadmap completion.

# Neural Atlas — Verification Report

All statuses below reflect actual commands, builds, and browser runs executed against the final codebase (`npm test`, `npm run lint`, `npm run build`, and `playwright-cli` on `http://localhost:3000`). No metrics or results are fabricated.

---

## 1. Automated Verification Summary

| Check | Status | Measured Result / Evidence |
| :--- | :--- | :--- |
| **Unit & Regression Tests** (`npm test`) | **PASSED** | `22 / 22` subtests passed, `0` failed, `1,064.36 ms` (`1.06s`, improved from `91.4s` baseline). Covers factual 7-course academic constraints, EN/AR dictionary parity, router matching, owner allowlist (`abdalrahman32008@gmail.com`), URL/email validation, `stripUndefined`, configured-Firestore fallback invariant, and local `firestore.rules` hardening assertions. |
| **TypeScript Static Check** (`npm run lint`) | **PASSED** | `tsc --noEmit` exited with code `0` and `0` type errors. |
| **Production Build** (`npm run build`) | **PASSED** | `vite v8.3.5` built `1,729` modules in `928 ms`, `0` deprecation warnings (`__dirname` resolved). |
| **Live Browser E2E** (`playwright-cli`, Chromium) | **PASSED** | Tested on `http://localhost:3000` across `1440x900` (Dark EN, Dark AR RTL, Light EN) and `390x844` mobile across `/`, `/academic`, `/projects`, `/notes`, `/milestones`, `/connect`, and `/admin`. `0` console errors, `0` console warnings, `<canvas>` count `=== 1` on every route, `scrollW === 390` on all 7 mobile routes, `abdalrahman32008@gmail.com` absent from public DOM on `/connect`, and Google sign-in gate verified on `/admin`. |
| **Remote `firestore.rules` Deployment** | **NOT DEPLOYED (PROHIBITED)** | Local `/firestore.rules` fixes (including `resource == null` on `get` and write schema allowlists) are verified locally via file assertions, **not deployed** remotely. Live Firestore still returns `Missing or insufficient permissions` on unauthenticated missing-doc `get` (`getProjectBySlugResult` Test 19 warning) until owner deploys `/firestore.rules`. |
| **Authenticated Admin Write/Read Flow** | **NOT TESTED (INTERACTIVE OAUTH)** | Google Sign-In popup/OAuth flow with `abdalrahman32008@gmail.com` and live Firestore CMS mutations require interactive owner credentials in browser and were not executed in headless Chromium. |
| **Lighthouse CLI Audit** | **NOT TESTED** | `lighthouse` binary is not installed in the container environment; no synthetic Lighthouse score is claimed. |

---

## 2. Production Bundle Comparison (Before vs. After)

| Metric | Baseline Build | Final Build | Delta / Notes |
| :--- | :--- | :--- | :--- |
| **Build Tool & Time** | `vite v8.3.5` · `1.64s` (1 deprecation warning) | `vite v8.3.5` · `928 ms` (0 config warnings) | Removed deprecated `__dirname` warning |
| **Main App Entry Chunk** | `dist/assets/index-adKbSy1x.js`: `2,231.02 kB` (`609.23 kB` gzip) | `dist/assets/index-FbrDMg5e.js`: `78.40 kB` (`17.14 kB` gzip) | `-96.5%` app entry JS via route lazy-loading + vendor splitting |
| **Admin Studio Chunk** | Bundled inside main chunk | `dist/assets/AdminDashboard-DMoMmmLp.js`: `96.37 kB` (`12.18 kB` gzip) | Isolated from public visitor initial download |
| **Secondary Route Chunks** | Bundled inside main chunk | `3.72 kB` – `23.74 kB` per route (`1.03 kB` – `4.31 kB` gzip) | Split cleanly via `React.lazy` + `Suspense` |
| **Vendor Cache Chunks** | Bundled inside main chunk | `vendor-react`: `400.79 kB` (`121.79 kB` gzip)<br>`vendor-firebase`: `558.10 kB` (`167.97 kB` gzip)<br>`vendor-three`: `1,003.86 kB` (`271.41 kB` gzip) | Cache-friendly vendor isolation (`vendor-three` and `vendor-firebase` remain >500 kB due to full Three.js + Firestore SDKs) |
| **CSS Bundle** | Single CSS output | `dist/assets/index-B-9RQo1d.css`: `40.88 kB` (`7.70 kB` gzip) | Stable |

---

## 3. Browser Runtime & Visual Checks Observed (`playwright-cli`)

- **Desktop (`1440x900`):**
  - `/` (EN Dark): `document.title` = `"Neural Atlas - Abdalrahman Mostafa"`, `dir="ltr"`, `canvases=1`, `scrollW=1440`.
  - `/` (AR RTL toggle): `dir="rtl"`, `lang="ar"`, `document.title` = `"Neural Atlas - عبد الرحمن مصطفى"`, `scrollW=1440`.
  - `/academic` (EN Light): `document.title` = `"Academic Journey · Neural Atlas"`, `canvases=1`, `scrollW=1440`. Light-mode canvas opacity (`0.35`) and surface opacity (`0.88`) resolved background ring interference over foreground text.
  - `/connect`: `bodyHasOwnerEmail=false` confirmed `abdalrahman32008@gmail.com` is not exposed publicly.
  - `/admin`: Confirmed Google sign-in gate renders and blocks unauthenticated dashboard access.
  - `/projects`, `/notes`, `/milestones`: Dynamic route `<title>` updated accurately; `canvases=1`; zero console errors or warnings.
- **Mobile (`390x844`):**
  - Initial pass detected `scrollW=403` overflow caused by unwrapped `Footer.tsx` flex rows and `ProjectsPage.tsx` filter bar.
  - After wrapping fixes and server restart, re-verified `scrollW: 390, innerW: 390` across all 7 routes (`/projects`, `/`, `/academic`, `/notes`, `/milestones`, `/connect`, `/admin`).
- **Observed Live Firestore Empty State Note:**
  - Navigating to `/projects` showed `"No Published Projects"` because live Firestore is configured and currently has 0 project documents (strict publication invariant intentionally prevents silent fallback to local `PROJECTS`). Once the owner authenticates in `/admin` and runs initial import or publishes records, live items will render.
