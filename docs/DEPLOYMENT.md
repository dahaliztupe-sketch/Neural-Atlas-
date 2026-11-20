# Deployment & Operations Guide

This guide covers building **Neural Atlas** for production hosting, configuring SEO/PWA origins, deploying Firebase Security Rules and indexes, and seeding the live database via Admin Studio.

---

## 1. Build for Production

```bash
npm install
npm run lint
npm run lint:rules
npm test
npm run build
```

Vite outputs the static bundle into `dist/`, including:
- Split vendor & route JavaScript chunks under `dist/assets/`
- `dist/manifest.webmanifest`, `dist/sw.js`, and `dist/registerSW.js` (`vite-plugin-pwa`)
- `dist/sitemap.xml` and `dist/robots.txt` (`Disallow: /admin`)

---

## 2. Optional Canonical Domain (`VITE_SITE_URL`)

If deploying to a custom domain, set `VITE_SITE_URL` in `.env` (or your CI build environment) before running `npm run build`:

```bash
VITE_SITE_URL="https://your-domain.example" npm run build
```

- When set, Vite generates absolute URLs inside `dist/sitemap.xml`, `dist/robots.txt`, `<link rel="canonical">`, `og:url`, `og:image`, and `twitter:image`.
- When left unset (such as multi-environment Cloud Run previews), the app resolves origins cleanly from `window.location.origin` at runtime and writes relative static paths.

---

## 3. Static Hosting & SPA Routing Catch-All

All routes (`/`, `/about`, `/academic`, `/projects/:slug`, `/notes/:slug`, `/milestones`, `/connect`, `/admin`) use HTML5 History API navigation. Configure your static host or reverse proxy to rewrite unknown non-asset paths to `/index.html`:

- **Vercel (`vercel.json`)**: Preconfigured in [`vercel.json`](../vercel.json) with SPA fallback rewrites to `/index.html`, PWA service worker revalidation headers (`/sw.js`, `/registerSW.js`, `/index.html`), immutable caching on `/assets/*`, and `Cross-Origin-Opener-Policy: same-origin-allow-popups` for Firebase Google Sign-In.
- **Firebase Hosting (`firebase.json`)**:
  ```json
  {
    "hosting": {
      "public": "dist",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  }
  ```
- **Cloudflare Pages / Netlify**: Enable single-page app fallback (`/* /index.html 200`).

---

## 4. Firebase Project Configuration

- **Firebase Project ID**: `industrious-reference-9gtt6`
- **Firestore Database ID**: `ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`

### Rules & Composite Indexes
- Validate local rules before every deployment:
  ```bash
  npm run lint:rules
  npm test
  ```
- Deploy `firestore.rules` and ensure the composite indexes declared in [`firestore.indexes.json`](../firestore.indexes.json) exist on the target database:
  - `projects`: `publicationStatus` (ASC) + `visibility` (ASC)
  - `projects`: `publicationStatus` (ASC) + `visibility` (ASC) + `slug` (ASC)
  - `notes`: `publicationStatus` (ASC) + `slug` (ASC)

### Firebase Authentication Domains
In **Firebase Console -> Authentication -> Settings -> Authorized domains**, verify that:
- `localhost` (local dev)
- Your live hosting / Cloud Run preview hostname(s)
are listed under Authorized domains, and **Google** is enabled as the sign-in provider.

---

## 5. Initial Live Data Seeding (`/admin`)

Because public queries do not fall back silently to local arrays when Firebase is configured, a newly provisioned database displays an honest empty state until seeded:

1. Navigate to `/admin` and sign in with the authorized owner Google account.
2. Open the **Overview** tab and click **Import Existing Site Content** once to seed:
   - `7` project records (`6` public showcase/archive entries + `1` `internal_archive` entry)
   - `7` Semester 1 Archive courses
   - `4` verified milestone records
   - Public `settings/profile` (including learning tracks and operational Excel experience)
3. Visit the **Diagnostics** tab to confirm per-collection status and export a baseline JSON backup.

For the actionable launch checklist, see [OWNER_DEPLOYMENT_CHECKLIST.md](./OWNER_DEPLOYMENT_CHECKLIST.md).
