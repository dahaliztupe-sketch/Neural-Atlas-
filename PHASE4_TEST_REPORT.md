# Neural Atlas — Unified Test & Browser Verification Report

All statuses below reflect actual commands executed against the repository.

---

## 1. Automated Verification Matrix

| Check | Command | Outcome | Measured Result |
| :--- | :--- | :--- | :--- |
| **Unit & Regression Tests** | `npm test` | **PASSED** | `70 / 70` subtests passed across 10 test modules (`data`, `router`, `contentRepository`, `cacheService`, `backupService`, `validation`, `markdown`, `katex`, `seo`, `world`), `0` failed (`~3.94s`). |
| **TypeScript Static Analysis** | `npm run lint` (`tsc --noEmit`) | **PASSED** | `0` type errors, exit code `0`. |
| **Production Build & Assets** | `npm run build` (`vite build`) | **PASSED** | Built cleanly in `1.42s`; generated `dist/sitemap.xml` (`850 B`), `dist/robots.txt` (`62 B`), PWA `dist/sw.js` (`98` precache entries). |

---

## 2. Live Headless Chromium Verification (`playwright-cli` on `http://localhost:3000`)

| Scenario | Verified Assertions | Console Errors |
| :--- | :--- | :--- |
| **Desktop `1440×900` EN Dark (`/`)** | `canvases === 1`, `data-mode="interactive-hero"`, click `astrolabe-tab-local-ai` transitions `data-active-node` from `cpp` -> `local-ai`, `scrollOverflow === false`, `jsonLdCount === 1`, `robots === "index, follow"` | `0` errors, `0` warnings |
| **Desktop Route Transition (`/` -> `/projects`)** | Persistent `canvasesOnProjects === 1`, `hostModeOnProjects === "ambient-shell"`, `h1 === "Projects & Practice"` | `0` errors, `0` warnings |
| **Desktop Admin Guard (`/admin`)** | `canvasesOnAdmin === 0`, `hostPresentOnAdmin === false`, `robotsOnAdmin === "noindex, nofollow"`, `emailLeakedInDom === false`, renders Google Sign-In lock screen | `0` errors, `0` warnings |
| **Desktop `1440×900` AR RTL Light (`/`)** | `dir === "rtl"`, `lang === "ar"`, `.light` theme active, `canvasesDesktopAr === 1`, `scrollOverflowDesktopAr === false`, mirrored astrolabe stage | `0` errors, `0` warnings |
| **Mobile `390×844` & `320×640` (`/`)** | `canvasesMobile === 0`, `width390Overflow === false`, `width320Overflow === false`, mobile nav drawer opens cleanly (`drawerOpen === true`) | `0` errors, `0` warnings |
| **SEO Dev Endpoints** | `GET /robots.txt` & `GET /sitemap.xml` return expected `Allow`/`Disallow: /admin` and public route entries | N/A (`curl`) |

---

## 3. Blocked / Out-of-Scope Live Checks

- **Live Authenticated Firebase Admin Flows:** `BLOCKED — requires interactive Google OAuth sign-in (`abdalrahman32008@gmail.com`) in a non-automated browser session`.
- **Live Firestore Rules Enforcement & Deployment:** `BLOCKED — live Firebase rules deployment and live database mutations prohibited by task scope`.
