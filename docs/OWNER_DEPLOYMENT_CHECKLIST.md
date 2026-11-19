# Neural Atlas — Owner Pre-Deployment & Operations Checklist

**Firebase Project:** `industrious-reference-9gtt6`  
**Firestore Database:** `ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`  
**Authorized Owner Email:** `abdalrahman32008@gmail.com`

---

## 1. Environment Configuration (`.env`)

- [ ] Set `VITE_SITE_URL=https://<your-verified-domain>` before building if deploying to a custom host so Vite generates absolute canonical links, OpenGraph URLs, `sitemap.xml`, and `robots.txt`. Leave unset when deploying to dynamic Cloud Run origins so runtime origin fallback applies cleanly.

## 2. Firebase Rules, Indexes & Authentication Setup

- [x] **Deploy `firestore.rules`:** Hardened rules enforcing `publicationStatus == 'published' && visibility == 'public'` on public `projects` reads, `internal_archive` isolation, `settings/profile` PII isolation, `courses`, `notes`, `milestones`, and `contactMessages` write-only create + owner status update have been linted (`eslint firestore.rules`) and deployed to project `industrious-reference-9gtt6`.
- [ ] **Verify Composite Indexes (`firestore.indexes.json`):** Confirm in Firebase Console -> Firestore -> Indexes (database `ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`) that composite indexes exist if queries ever report `failed-precondition`:
  - `projects`: `publicationStatus` (ASC) + `visibility` (ASC)
  - `projects`: `publicationStatus` (ASC) + `visibility` (ASC) + `slug` (ASC)
  - `notes`: `publicationStatus` (ASC) + `slug` (ASC)
- [ ] **Verify Firebase Auth Authorized Domains & Providers:** Ensure **Google Sign-In** is enabled in Firebase Console -> Authentication -> Sign-in method (with public Email/Password self-registration disabled), and add both your Cloud Run Dev/Shared hostnames (`ais-dev-*.run.app` / `ais-pre-*.run.app` or exact service domain) and any custom domain under **Authentication -> Settings -> Authorized domains**.
- [ ] **Consider Firebase App Check (Recommended):** Client contact-form honeypot and 60s cooldown do not constitute server-side rate limiting. Enable App Check / Cloud Functions if spam protection is needed at scale.

## 3. Initial Live Data Seeding & Admin Studio Verification

- [ ] Sign in at `/admin` with verified `abdalrahman32008@gmail.com`.
- [ ] Check **Overview** tab: run **Import Existing Site Content** once to seed/migrate live Firestore documents (7 project records: 6 public showcase/archive + 1 `internal_archive`, 7 Semester 1 Archive courses, 4 verified milestones, and the public `settings/profile` with learning tracks & practical Excel experience).
- [ ] Review existing legacy documents in `/admin` -> **Projects** to ensure every public project explicitly has `visibility: 'public'`, `archiveGroup`, and `featuredOnHome` saved, and that `local-ai-agent` stays `internal_archive`.
- [ ] Check **Diagnostics** tab: inspect per-collection load statuses (`loaded` vs `error`) and download a baseline JSON backup (`neural-atlas-backup-YYYY-MM-DD.json`).
