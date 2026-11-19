# Changelog

All notable changes to **Neural Atlas** are documented in this file.  
Earlier phase-by-phase engineering logs and audit snapshots are preserved under [`docs/archive/`](./docs/archive/).

## [1.2.0] — Personal Identity Migration, Security Hardening & Home-Only 3D

### Added
- **Explicit Project Visibility & Archive Split**: Added `visibility` (`'public' | 'internal_archive'`) and `archiveGroup` (`'showcase' | 'experiments_discontinued'`) across domain types, `firebase-blueprint.json`, `firestore.rules`, and Admin Studio modals.
- **Dedicated About Route (`/about`) & Operational Experience Section**: Added transparent documentation of **Microsoft Excel** workforce & wage coordination under `Administrative & Operational Data Experience` without fabricated titles, dates, or KPIs.
- **Learning Track Modeling (`settings/profile`)**: Structured editable tracks for **Harvard CS50x** (`Paused / Needs Review`), **Elzero Web School C++** (`Completed Track (Self-Paced)`), **GKS-U 2027** (`Application Submitted`), and paused Korean study (`showInActiveHighlights: false`).
- **Semester 1 Academic Archive**: Preserved all 7 first-semester subjects under `semester-1-archive` / `unverified-syllabus` with dynamic university/department/term fields on `settings/profile`.
- **GitHub Repository Professionalization**: Added `LICENSE` (MIT for application code), `.github/` templates, CI workflow, Dependabot config, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, live screenshots, and refreshed `1200x630` Obsidian social preview assets.

### Changed
- **Firestore Security Rules (`firestore.rules`)**: Public reads on `projects` now require both `publicationStatus == 'published'` and `visibility == 'public'`, preventing exposure of `internal_archive` items or legacy documents missing `visibility`. Deployed rules to Firebase project `industrious-reference-9gtt6`.
- **Projects Directory Filtering (`/projects`)**: Added `All / Active Practice / Experiments & Archive` filters, explicit `needs_confirmation` badge for `WANASBRAND`, and separated `Experiments & Discontinued Archive` (`Kalmeron-Two`, `Sanad`, `Ruwadverse`, `SmartLifeAI`, `WANASBRAND`).
- **Home-Only 3D Astrolabe (`src/components/world/`)**: Restricted WebGL canvas mounting and Three.js chunk preloading strictly to desktop Home (`/`). Implemented `webglcontextlost`/`webglcontextrestored` handling and software-WebGL damping settlement (`demand` frameloop).

### Removed
- Eliminated unverified legacy event, certification, and course-progress claims as well as internal-archive item references from public UI copy, translations, SEO metadata, and social preview graphics.

---

## [1.1.0] — Architecture, Caching, Math Rendering & Admin Hardening

### Added
- **Client SWR Cache (`cacheService.ts`, `useCachedResource.ts`)**: Dual in-memory + `sessionStorage` cache with TTL validation, cross-tab `BroadcastChannel` invalidation, and error-safe stale fallback.
- **Hardened Markdown + KaTeX (`src/lib/markdown.ts`)**: Custom delimiter scanner with `trust: false` and protocol sanitization.
- **Zero-CLS Media (`OptimizedImage.tsx`)**: Aspect-ratio reservation, shimmer placeholders, and lightbox preview.
- **JSON Backup & Diff Engine (`backupService.ts`)**: Schema-validated export/import excluding private `contactMessages` and `contactEmail`.
- **Admin Studio (`/admin`)**: Full CRUD modals with focus traps, course/note/milestone/message management, diagnostics tab, and one-time seed migration.

---

## [1.0.0] — Initial Platform Launch

### Added
- Bilingual English / Arabic (`LTR` / `RTL`) React 19 + TypeScript + Vite SPA with Tailwind CSS v4.
- Light (Mineral Alabaster) & Dark (Obsidian) theme system.
- Firebase Authentication (Google Sign-In) & Cloud Firestore integration (`ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`).
- PWA manifest & Workbox service worker (`vite-plugin-pwa`), dynamic route SEO (`JSON-LD`), and `sitemap.xml` / `robots.txt` generation.
