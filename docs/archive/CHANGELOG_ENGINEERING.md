> **Historical Snapshot Notice**: This changelog captures an earlier milestone prior to the Unified Phase 1–4 Roadmap. See `REPAIR_CHANGELOG.md`, `REDESIGN_CHANGELOG.md`, `FEATURES_CHANGELOG.md`, and `PHASE4_CHANGELOG.md` for current changes.

# Neural Atlas — Engineering Changelog

All modifications listed below were verified against TypeScript (`tsc --noEmit`), Node tests (`npm test`), Vite 8 production builds (`npm run build`), and live headless Chromium inspection (`playwright-cli`).

---

## Security, Rules & Data Integrity

- **`/firestore.rules`** *(local file updated; remote deployment pending owner action)*
  - Fixed missing-document read rule bug: separated `allow get` (`resource == null || resource.data.publicationStatus == 'published' || isOwner()`) from strict `allow list` (`resource.data.publicationStatus == 'published' || isOwner()`).
  - Hardened write rules with field allowlists (`keys().hasOnly`), string `.size()` and list `.size()` limits, `isValidId` regex, `incoming().id == <docId>` consistency, `isOptionalHttpUrl` (`^https?://.*`) enforcement, and `settingId == 'profile'` scoping.
- **`/firebase-blueprint.json`**
  - Synchronized `Project`, `LearningNote`, and `Milestone` schemas with TypeScript models (`url`, `repoUrl`, `statusEn`, `statusAr`, `seoTitle*`, `seoDescription*`, milestone `publishedAt`).
- **`/src/lib/firebase.ts`**
  - Updated `handleFirestoreError` to preserve full `FirestoreErrorInfo` diagnostics in `console.error` while throwing sanitized user/UI error messages without `authInfo` UID/email JSON leakage.
- **`/src/services/contentRepository.ts`**
  - Added `stripUndefined()` and applied it to `saveProject`, `saveNote`, `saveMilestone`, and `saveProfileSettings` so saving drafts (`publishedAt: undefined`) no longer crashes Firestore `setDoc`.
  - Added `isValidOptionalUrl`, `sanitizeSafeUrl`, and `isValidOptionalEmail`; enforced validation on saves and sanitized external links (`url`, `repoUrl`, `coverImageUrl`, `externalReference`, `githubUrl`, `linkedinUrl`) on public reads.
  - Guarded empty normalized slugs in `getProjectBySlugResult` and `getNoteBySlugResult`.

---

## Architecture, Public Sync & Admin CMS Completeness

- **`/src/types/index.ts`**
  - Added `'completed'` to `ProjectItem['statusType']` union, eliminating `as any` casts across `ProjectsPage.tsx` and `ProjectDetailPage.tsx`.
- **`/src/context/AppContext.tsx`**
  - Loaded `publicProfile` (`ProfileSettingsRecord`) on startup via `getPublicProfileSettingsResult()` and exposed `publicProfile` + `refreshPublicProfile()`.
  - Added dynamic per-route, per-language `document.title` and `<meta name="description">` updates synced with `publicProfile`.
- **`/src/pages/HomePage.tsx`**
  - Replaced static `PROJECTS` and `OWNER_INFO` with live `publicProfile` and `getPublishedProjectsResult()`, honoring Firestore loading/error/empty publication semantics.
- **`/src/pages/ConnectPage.tsx`, `/src/components/Footer.tsx`, `/src/components/Header.tsx`**
  - Bound social URLs (`GitHub`, `LinkedIn`), mobile drawer owner name, and optional direct contact email to validated `publicProfile` fields (`isValidUrl` / non-empty `contactEmail`).
- **`/src/pages/ProjectsPage.tsx`, `/src/pages/ProjectDetailPage.tsx`**
  - Removed `as any` casts, added conditional `completed` filter and badge styling, guarded external `url`/`repoUrl` with `isValidUrl`, and rendered repository links on detail pages when present.
- **`/src/pages/LearningNotesPage.tsx`, `/src/pages/MilestonesPage.tsx`**
  - Added honest error-state UI panels, localized hardcoded English strings, added `topicLabels` display, converted note list cards into semantic `<button type="button">` elements, and safely rendered `externalReference` links.
- **`/src/pages/admin/AdminDashboard.tsx`**
  - Replaced silent `.catch(() => [])` calls with `Promise.allSettled` + explicit `loadWarning` feedback banner.
  - Added `messageTimerRef` timeout cleanup on consecutive notifications and unmount.
  - Locked `slug` editing for existing projects/notes, expanded forms with all missing bilingual fields (Project statuses/overviews, Note Arabic content & topic tags, Milestone descriptions & external reference, Profile faculty, current/future focus, contact email), and wired `refreshPublicProfile()` after save/import.
  - Localized all dashboard labels/buttons via `t(...)` and added URL/email client-side validation.
- **`/src/data/translations.ts`**
  - Added 40+ bilingual EN/AR translation keys (`badgeCompleted`, `statusCompleted`, `readNote`, `notesBackToNotes`, `notesNotFoundTitle`, `notesLoadErrorTitle`/`Desc`, `milestonesLoadErrorTitle`/`Desc`, `externalReference`, `emailDirectDesc`, `emailContactBtn`, and full `admin*` dictionary).

---

## Performance, 3D World Hygiene, Accessibility & Responsive UI

- **Removed Dead Code:** Deleted unused `/src/components/HeroScene.tsx` (744 lines, zero references).
- **`/src/components/world/ImmersiveWorldBackground.tsx`**
  - Unified `detectSoftwareGl()` and `checkWebGLAvailable()` into a single `probeWebGL()` call releasing its context immediately via `WEBGL_lose_context`.
  - Attenuated canvas container opacity (`opacity-35`) in Light Mode to improve contrast for dark foreground typography.
- **`/src/components/world/WorldCameraRig.tsx`**
  - Pre-allocated `desiredPosRef` and `desiredTargetRef` (`THREE.Vector3`) to eliminate per-frame allocations inside `useFrame`.
  - Added `ResizeObserver` on `document.documentElement` to recalculate scroll progress when dynamic content loads.
- **`/src/components/world/CosmicAtmosphere.tsx`, `/src/components/world/KnowledgeLattice.tsx`**
  - Stabilized random particle coordinates across theme toggles, updated vertex colors in-place (`needsUpdate = true`), and disposed Three.js geometries and materials on update/unmount.
- **`/src/App.tsx`, `/vite.config.ts`**
  - Added `React.lazy` + `Suspense` route splitting for `AdminDashboard` and secondary pages.
  - Replaced deprecated `__dirname` with `import.meta.dirname` and configured `build.rolldownOptions.output.codeSplitting` (`vendor-three`, `vendor-firebase`, `vendor-react`).
- **Accessibility & Mobile Responsiveness (`/src/components/Header.tsx`, `/src/components/Footer.tsx`, `/src/pages/ProjectsPage.tsx`, `/src/pages/AcademicJourneyPage.tsx`, `/src/pages/admin/AdminDashboard.tsx`, `/src/index.css`)**
  - Added `Escape` key handlers, `role="dialog"`, `aria-modal="true"`, `htmlFor`/`id` form label bindings, and explicit `type="button"` attributes.
  - Wrapped `Footer.tsx` brand/nav flex rows and `ProjectsPage.tsx` filter pill bar to eliminate horizontal overflow at `390px`.
  - Raised `html.light --color-surface` opacity to `0.88` for higher card contrast over the 3D scene.

---

## Automated Tests

- **`/src/services/contentRepository.test.ts`**
  - Added `after()` hook calling `terminate(db)` to prevent idle Firestore gRPC test hangs (`91.4s` -> `1.06s`).
  - Added unit tests for `stripUndefined`, `isValidOptionalUrl`, `sanitizeSafeUrl`, `isValidOptionalEmail`, and hardened `firestore.rules` assertions.
- **`/src/data/data.test.ts`**
  - Added EN/AR `TRANSLATIONS` key parity and non-empty string verification.
