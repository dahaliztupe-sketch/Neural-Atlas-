> **Historical Snapshot Notice**: This earlier redesign report is superseded by `REDESIGN_GUIDE.md`, `REDESIGN_CHANGELOG.md`, and `PHASE4_TEST_REPORT.md` under the Unified Phase 1–4 Roadmap.

# Neural Atlas — Calm Computational Atlas Redesign & Verification Report

**Date**: 2026-11-14  
**Scope**: Comprehensive Calm Computational Atlas Redesign, 3D Architecture Streamlining, UX/Accessibility Audit & Verification  
**Owner**: Abdalrahman Mostafa (`abdalrahman32008@gmail.com`)  
**Firebase Target**: Project `industrious-reference-9gtt6`, Firestore Database `ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`

---

## 1. Summary of Implemented Improvements

1. **Streamlined Hero 3D "Neural Atlas Core" & Dead-Code Cleanup**:
   - Deleted 4 orphaned, unused 3D scene modules: `ArchiveZone.tsx`, `ConstructionLab.tsx`, `GatewayZone.tsx`, and `KnowledgeLattice.tsx`.
   - Simplified `worldAnchors.ts` and `types.ts` to strictly match the active Hero scene (removing unused multi-route `SEC-XX` telemetry HUD metadata).
   - Redesigned `MonumentalPortal.tsx` into the asymmetric, trailing-side **Neural Atlas Core** (`x = isRtl ? -2.25 : 2.25`) with translucent crystal geometry, octagram lattice, 2 delicate orbital rings, and 3 constellation anchor filaments (`cpp`, `local-ai`, `python`), with explicit Three.js geometry/material disposal on unmount.
   - Added `webglcontextlost` / `webglcontextrestored` handling and renderer disposal in `HeroCanvasScene.tsx`.
   - Reduced `CosmicAtmosphere.tsx` to 135 deterministic seeded-PRNG starfield points with calm opacity (`0.44` dark / `0.25` light).
   - Added `computeHeroCanvasOpacity(...)` + rAF-throttled direct DOM opacity updates in `ImmersiveWorldBackground.tsx` (smoothly fading canvas opacity over `75%` of initial viewport scroll height with zero React re-renders).
   - Added `routeName`-aware zero-WebGL SVG/CSS textures in `StaticAtmosphericBackdrop.tsx` across public routes and an ultra-clean zero-pattern surface on `/admin`.
2. **Anti-Slop Editorial Hierarchy, Surface Discipline & RTL Parity**:
   - Introduced `--color-surface-solid` and `--hero-veil` in `src/index.css` so foreground cards, modals, and hero typography maintain crisp WCAG contrast without smearing WebGL via `backdrop-blur`.
   - Added `[dir="rtl"] body { line-height: 1.7; }` for balanced Arabic diacritics and line spacing.
   - Removed HUD telemetry jargon (`Sector SEC-03 · Knowledge Lattice Synchronized`, `Spatial Node #01` -> `Course 01` / `مقرر 01`) and department status pill noise from `AcademicJourneyPage.tsx`, `CourseCard.tsx`, and `CourseDetailModal.tsx`.
   - Restructured `ProjectDetailPage.tsx` from nested bordered sub-cards into unboxed, hairline-separated editorial prose sections with localized `publishedAt` / `updatedAt` timestamps (`formatLocalizedDate`).
   - Added honest **Notes & Milestones Preview** (displaying published items or honest `In Preparation` links) and **About & Connect Invitation** sections to `HomePage.tsx`.
   - Fixed a `16px` mobile horizontal overflow (`scrollWidth: 406 -> 390` at `390px`, `336 -> 320` at `320px`) by constraining the hero veil (`inset-x-0 sm:-inset-x-4`) and adding `overflow-x-clip`.
3. **CMS Resilience & Public Query Hardening**:
   - Added inline unsaved-draft confirmation guard (`isModalDirty` + `discardConfirmOpen`) in `AdminDashboard.tsx` to prevent accidental dismissal via backdrop click, Escape, or Cancel.
   - Updated unauthenticated single-record slug lookups (`getProjectBySlugResult` and `getNoteBySlugResult`) in `src/services/contentRepository.ts` to query `where('publicationStatus', '==', 'published')` cleanly, returning `status: 'not_found'` instead of a false `permission_denied` banner on missing/unseeded Firestore documents while keeping `isOwner` direct lookup and fail-closed security intact.

---

## 2. File Inventory Summary

- **Deleted**: `src/components/world/ArchiveZone.tsx`, `src/components/world/ConstructionLab.tsx`, `src/components/world/GatewayZone.tsx`, `src/components/world/KnowledgeLattice.tsx`
- **Updated (`world/` & styling)**: `src/index.css`, `src/App.tsx`, `src/components/world/types.ts`, `src/components/world/worldAnchors.ts`, `src/components/world/worldCapability.ts`, `src/components/world/WorldEnvironmentLighting.tsx`, `src/components/world/MonumentalPortal.tsx`, `src/components/world/CosmicAtmosphere.tsx`, `src/components/world/WorldCameraRig.tsx`, `src/components/world/HeroCanvasScene.tsx`, `src/components/world/ImmersiveWorldBackground.tsx`, `src/components/world/StaticAtmosphericBackdrop.tsx`
- **Updated (UI, CMS, Services, Tests & Docs)**: `src/data/translations.ts`, `src/components/CourseCard.tsx`, `src/components/CourseDetailModal.tsx`, `src/pages/HomePage.tsx`, `src/pages/AcademicJourneyPage.tsx`, `src/pages/ProjectDetailPage.tsx`, `src/pages/LearningNotesPage.tsx`, `src/pages/admin/AdminDashboard.tsx`, `src/services/contentRepository.ts`, `src/lib/validation.test.ts`, `README.md`, `REDESIGN_VERIFICATION_REPORT.md`
- **Unreferenced Dependencies Note**: `package.json` still lists template packages (`@google/genai`, `express`, `@types/express`, `dotenv`, `motion`); verified via source grep and production `vite build` output that none are imported by `src/`, `index.html`, or `vite.config.ts` (`0` bytes in `dist/`). Left untouched intentionally to avoid unnecessary lockfile churn.

---

## 3. Measured Build & Bundle Metrics

| Artifact / Metric | Post-Redesign Measured (`vite build` / CLI) | Notes |
| --- | --- | --- |
| `HeroCanvasScene` lazy chunk | `11.47 kB` (`3.41 kB` gzip) | Down from `14.57 kB`; loaded **only** on desktop `/` when WebGL + motion are active |
| `vendor-three` chunk | `1,003.86 kB` (`271.41 kB` gzip) | **0 kB** fetched on `/academic`, `/projects`, `/notes`, `/milestones`, `/about`, `/connect`, `/admin`, mobile `<768px`, and `reduced-motion` |
| `vendor-firebase` chunk | `558.10 kB` (`167.97 kB` gzip) | Modular Auth/Firestore SDK chunk |
| `vendor-react` chunk | `400.79 kB` (`121.79 kB` gzip) | Core React 19 + UI runtime |
| Entry CSS (`index-*.css`) | `43.46 kB` (`8.12 kB` gzip) | Single stylesheet compiled cleanly by Tailwind v4 |
| Unit Tests (`npm test`) | **`32 / 32` passing** (`node:test` via `tsx`) | Includes `computeHeroCanvasOpacity` scroll-fade test + boundary/rules regression checks |
| Type Check (`npm run lint`) | **`0` errors** (`tsc --noEmit`) | Strict TypeScript validation clean |

---

## 4. Verification Status Breakdown

### A. Verified & Passed Locally
1. **`npm test`**: `32 / 32` tests passed across `src/data/data.test.ts`, `src/router/router.test.ts`, `src/services/contentRepository.test.ts`, and `src/lib/validation.test.ts`.
2. **`npm run lint`**: `tsc --noEmit` exited `0` with no errors.
3. **`npm run build`**: `vite build` transformed `1,730` modules cleanly in `1.15s`.
4. **Playwright Real-Browser Verification (`http://localhost:3000`, Headless Chromium)**:
   - **Desktop EN Dark (`1440x900`, `/`)**: `canvasCount: 1`, asymmetric right-side **Neural Atlas Core** behind hero ledger card without muddying typography contrast, `scrollWidth: 1440 === innerWidth`, scroll-linked opacity attenuation confirmed (`scrollY: 650` -> `inlineOpacity: 0.101`, computed `0.109953`), `0` console errors.
   - **Desktop AR RTL Dark (`1440x900`, `/`)**: `lang="ar"`, `dir="rtl"`, trailing-side 3D mirrored left cleanly, `scrollWidth: 1440`, `canvasCount: 1`, `0` console errors.
   - **Desktop Light Secondary Routes (`1440x900`, `/academic` & `/projects/cpp-problem-solving`)**: `canvasCount: 0`, `vendor-three` never requested, zero `SEC-03` telemetry / department pills, unseeded project detail renders clean `"Project Entry Not Found"` state without false permission error banner.
   - **Mobile EN & AR (`390x844` & `320x568`, `/`)**: `canvasCount: 0`, `scrollWidth === innerWidth` (`390 === 390` and `320 === 320` after Round 1 veil overflow fix); keyboard menu toggle (`Enter`) opens `#mobile-nav-drawer`, `Escape` closes and restores focus (`opened: true, closed: true, restored: true`).
   - **Reduced Motion (`prefers-reduced-motion: reduce`)**: `canvasCount: 0`.
   - **Admin Gate (`/admin`)**: Signed-out visitor sees calm `"Neural Atlas Studio"` Google Sign-In Gate only (`hasAdminTabs: false`, `abdalrahman32008@gmail.com` not exposed in DOM).

### B. Not Verified in This Environment
- **Firebase Firestore Rules Emulator Suite**: `java` is absent in the execution container, so live evaluation against the local Firestore Emulator (`@firebase/rules-unit-testing`) could not be executed. Static schema/allowlist assertions pass in `src/services/contentRepository.test.ts`.
- **Authenticated Live Admin Session & CRUD Persistence**: Real Google OAuth popups and live Firestore writes against `industrious-reference-9gtt6` require interactive owner credentials and are intentionally outside automated headless scope.
- **Unsaved-Draft Modal Guard Interaction in Live Browser**: Verified via TypeScript compilation and logic inspection; runtime execution requires authenticated `/admin` session access.

### C. Requires Owner Action (Out of Scope for Local Run)
1. **Deploy Updated `firestore.rules`**: Publish `firestore.rules` (via Firebase CLI or Firebase Console) to project `industrious-reference-9gtt6` so missing-document reads (`resource == null`), structured case-study fields (`role*`, `problem*`, `approach*`, `outcome*`), and `coverImageAlt*` allowlists match the client schema.
2. **Verify Authorized OAuth Domains**: Confirm `localhost` and production hosting domain(s) are registered in Firebase Console -> Authentication -> Settings -> Authorized domains.
3. **Sign In & Manage Content**: Open `/admin` with `abdalrahman32008@gmail.com` to optionally import the verified project & profile baselines or author/publish Projects, Learning Notes, and Milestones.
4. **Configure Production SPA Catch-All Rewrite**: Route unknown non-file paths to `/index.html` on hosting so deep links (`/projects/:slug`, `/notes/:slug`, `/admin`) resolve cleanly.
