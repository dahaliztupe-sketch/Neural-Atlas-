> **Historical Snapshot Notice**: This report predates the Unified Phase 1–4 Roadmap repairs and upgrades. For current source-verified status, see `REPAIR_AUDIT.md`, `FEATURES_AUDIT.md`, `PHASE4_ARCHITECTURE.md`, `PHASE4_SECURITY_REVIEW.md`, and `PHASE4_TEST_REPORT.md`.

# Neural Atlas — Principal Engineering Audit

**Project:** Neural Atlas (Personal Portfolio & Academic Atlas)
**Owner:** Abdalrahman Mostafa — First-Year Intelligent Computing Student, Faculty of Science, Al-Azhar University
**Firebase Project ID:** `industrious-reference-9gtt6`
**Firestore Database ID:** `ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`

---

## 1. Executive Summary

Neural Atlas already possesses a strong architectural foundation: a persistent React Three Fiber / Three.js 3D universe (`ImmersiveWorldBackground`), clean route-driven camera trajectories (`WorldCameraRig`), bilingual EN/AR support with RTL/LTR flipping, verified factual discipline (7 owner-provided first-semester course titles, 2 active projects, empty initial milestones), and strict owner-only admin allowlisting (`abdalrahman32008@gmail.com`).

This audit uncovered and remediated critical runtime, security, data-integrity, CMS-completeness, 3D WebGL resource, accessibility, responsive layout, and bundle-splitting weaknesses across the codebase. **One critical operational action remains outside code scope:** the hardened local `firestore.rules` file has not been deployed remotely (deployment was prohibited during this audit), so live Firestore still enforces the prior ruleset until the owner deploys `firestore.rules`.

---

## 2. Architecture Map

| Layer | Primary Modules | Responsibilities & Findings |
| :--- | :--- | :--- |
| **Shell & Routing** | `src/App.tsx`, `src/router/useRouter.ts`, `src/context/AppContext.tsx` | Client-side pathname routing, bilingual EN/AR dictionary (`TRANSLATIONS`), light/dark theming, public profile synchronization, dynamic route `<title>` / `<meta name="description">`. |
| **Persistent 3D World** | `src/components/world/ImmersiveWorldBackground.tsx`, `WorldCameraRig.tsx`, `CosmicAtmosphere.tsx`, `KnowledgeLattice.tsx`, `MonumentalPortal.tsx`, `ConstructionLab.tsx`, `ArchiveZone.tsx`, `GatewayZone.tsx` | Full-viewport fixed WebGL canvas with route & scroll-driven camera interpolation, reduced-motion handling, software-GL fallback detection, and static SVG fallback. |
| **Firebase & Repository** | `src/lib/firebase.ts`, `src/lib/adminConfig.ts`, `src/services/contentRepository.ts`, `firestore.rules`, `firebase-blueprint.json` | Google Auth allowlist guard, Firestore persistence for `projects`, `notes`, `milestones`, and `settings/profile`, publication status queries, URL/email validation, and error handling. |
| **Public Pages** | `HomePage.tsx`, `AboutPage.tsx`, `AcademicJourneyPage.tsx`, `ProjectsPage.tsx`, `ProjectDetailPage.tsx`, `LearningNotesPage.tsx`, `MilestonesPage.tsx`, `ConnectPage.tsx` | Translucent glass surfaces layered above the 3D scene; live Firestore publication semantics with explicit loading/error/empty states. |
| **Admin CMS** | `src/context/AuthContext.tsx`, `src/pages/admin/AdminDashboard.tsx` | Private CRUD studio for Projects, Learning Notes, Milestones, Profile Settings, and initial data import gated behind Google verified owner email. |

---

## 3. Prioritized Findings (`P0` – `P3`)

### `P0` — Critical Security, Correctness & Data Integrity

1. **Missing-Document Permission Error in `firestore.rules` (`firestore.rules:158, 167, 176`)**
   - **Evidence:** Baseline `npm test` Test 17 (`getProjectBySlugResult('non-existent-project-12345', false)`) failed at the live Firestore boundary with `Missing or insufficient permissions` instead of `not_found`. Old rules wrote `allow get, list: if resource.data.publicationStatus == 'published' || isOwner();`, which evaluates `resource.data` when `resource == null` on single-doc `get` lookups of non-existent slugs.
   - **Remediation:** Split `get` and `list` rules locally so `allow get: if resource == null || resource.data.publicationStatus == 'published' || isOwner();` while keeping `allow list: if resource.data.publicationStatus == 'published' || isOwner();` strict.
   - **Deployment Caveat:** Remote rules still return `Missing or insufficient permissions` until `/firestore.rules` is deployed.

2. **Firestore `setDoc` Crash on Draft Saves (`src/services/contentRepository.ts`)**
   - **Evidence:** `saveProject`, `saveNote`, and `saveMilestone` constructed payloads with `publishedAt: status === 'published' ? ... : undefined` and optional URL fields potentially `undefined`. Firestore Web SDK throws `Unsupported field value: undefined` on `setDoc`.
   - **Remediation:** Implemented `stripUndefined()` and applied it to all `setDoc` write payloads. Added unit tests covering `publishedAt: undefined` draft payloads.

3. **Lack of Schema Allowlists, Document ID Binding & URL Protocol Validation (`firestore.rules`, `src/services/contentRepository.ts`, `firebase-blueprint.json`)**
   - **Evidence:** Prior `firestore.rules` checked only `isOwner()` on writes with zero field allowlists (`keys().hasOnly`), length limits, `id` equality, or `https?://` checks; `firebase-blueprint.json` drifted from TypeScript fields (`url`, `repoUrl`, `statusEn`, `statusAr`, SEO fields, milestone `publishedAt`); repository reads did not sanitize stored `javascript:`/`data:` URLs.
   - **Remediation:** Synchronized `firebase-blueprint.json`; added `keys().hasOnly(...)`, `.size()` bounds, `incoming().id == <docId>`, `isOptionalHttpUrl(...)`, and `settingId == 'profile'` restrictions in local `firestore.rules`; added `sanitizeSafeUrl`, `isValidOptionalUrl`, and `isValidOptionalEmail` in `contentRepository.ts`.

4. **Firestore Auth Metadata Exposure in UI Error Strings (`src/lib/firebase.ts:56–78`)**
   - **Evidence:** `handleFirestoreError` threw a JSON-serialized `FirestoreErrorInfo` containing `authInfo` (`userId`, `email`, `emailVerified`, `tenantId`, `providerInfo`) directly into component error state rendered in the UI.
   - **Remediation:** Preserved full diagnostic JSON in `console.error`, while throwing a sanitized `${rawMessage} (${operationType} on ${path})` error message.

---

### `P1` — Architecture, Data Flow, CMS Completeness & Reliability

5. **Static Fallback Leak on `HomePage.tsx`, `Footer.tsx`, and `ConnectPage.tsx`**
   - **Evidence:** `HomePage.tsx` previously rendered static `PROJECTS` and `OWNER_INFO` instead of querying `getPublishedProjectsResult()` and `publicProfile`; `Footer.tsx` and `ConnectPage.tsx` read static `SOCIAL_LINKS` instead of Firestore `settings/profile` updates saved in the Admin CMS.
   - **Remediation:** Added `publicProfile` (`ProfileSettingsRecord`) state and `refreshPublicProfile()` to `AppContext.tsx`; connected `HomePage.tsx`, `Footer.tsx`, `Header.tsx`, and `ConnectPage.tsx` to live `publicProfile` with URL sanitization (`isValidUrl`); updated `HomePage.tsx` to fetch live published projects with honest loading/error/empty states. `ConnectPage.tsx` continues hiding `abdalrahman32008@gmail.com` unless explicitly set as `contactEmail`.

6. **Incomplete Admin CMS Fields & Silent Error Swallowing (`src/pages/admin/AdminDashboard.tsx`)**
   - **Evidence:** `AdminDashboard` used `.catch(() => [])` in `Promise.all`, silently masking network/permission failures as empty lists; `slug` could be edited on existing records (creating duplicate docs); forms lacked Project `statusEn`/`statusAr`/`fullOverviewEn`/`fullOverviewAr`, Note `contentAr`/`topicLabels`, Milestone `descriptionEn`/`descriptionAr`/`externalReference`, and Profile `faculty*`/`currentFocus*`/`futureFocus*`/`contactEmail`.
   - **Remediation:** Replaced `Promise.all` with `Promise.allSettled` + visible `loadWarning` banner; locked `slug` when editing existing entries; added all missing bilingual CMS fields and client-side URL/email validation; removed `as any` casts on `statusType` by adding `'completed'` to `ProjectItem['statusType']`.

7. **Missing Error States on Public Notes & Milestones Pages (`LearningNotesPage.tsx`, `MilestonesPage.tsx`)**
   - **Evidence:** Public repository failures were not surfaced cleanly, and several strings (`Read Note`, `Back to Notes`, `Note Entry Not Found`) were hardcoded in English inside Arabic mode.
   - **Remediation:** Added dedicated error-state UI panels and full EN/AR translations in `src/data/translations.ts`.

---

### `P2` — Performance, Bundle Splitting, 3D WebGL Hygiene & Accessibility

8. **Monolithic Single-Chunk Bundle (`2,231.02 kB`) & Vite 8 Warning (`src/App.tsx`, `vite.config.ts`)**
   - **Evidence:** Baseline `vite build` emitted a single `2,231.02 kB` JS bundle (`609.23 kB` gzip), bundling Three.js, Firebase, and `AdminDashboard` on initial load, plus a Vite 8 deprecation warning for `__dirname` in `vite.config.ts:11`.
   - **Remediation:** Lazy-loaded `AdminDashboard` and all secondary pages in `src/App.tsx` via `React.lazy` + `Suspense`; replaced `__dirname` with `import.meta.dirname`; configured `build.rolldownOptions.output.codeSplitting` groups (`vendor-three`, `vendor-firebase`, `vendor-react`). Entry bundle dropped to **`78.40 kB` (`17.14 kB` gzip)**, while `AdminDashboard` is isolated into a lazy `96.37 kB` (`12.18 kB` gzip) chunk.

9. **3D Scene Dead Code, Per-Frame Allocations & GPU Resource Leaks (`src/components/world/*`, `HeroScene.tsx`)**
   - **Evidence:** `src/components/HeroScene.tsx` (744 lines) had zero imports across `src/`; `ImmersiveWorldBackground.tsx` opened two separate probe WebGL contexts; `WorldCameraRig.tsx` allocated two `new THREE.Vector3()` instances per frame inside `useFrame` and ignored dynamic document height changes; `CosmicAtmosphere.tsx` regenerated random particle positions on theme switches and leaked `BufferGeometry`/`LineBasicMaterial`; `KnowledgeLattice.tsx` lacked `lineGeometry.dispose()`.
   - **Remediation:** Deleted `HeroScene.tsx`; merged WebGL capability + SwiftShader probing into one `probeWebGL()` call; pre-allocated `desiredPosRef`/`desiredTargetRef` and added `ResizeObserver` in `WorldCameraRig.tsx`; stabilized particle coordinates and disposed Three.js geometries/materials cleanly in `CosmicAtmosphere.tsx` and `KnowledgeLattice.tsx`.

10. **Mobile Viewport Overflow (`403px > 390px`) & Light-Mode 3D Contrast (`Footer.tsx`, `ProjectsPage.tsx`, `ImmersiveWorldBackground.tsx`, `index.css`)**
    - **Evidence:** Live Playwright inspection at `390x844` revealed `scrollWidth: 403` across all routes caused by unwrapped horizontal flex rows in `Footer.tsx` (`flex items-center gap-5`) and `ProjectsPage.tsx` (`inline-flex`), and showed saturated 3D torus lines bleeding through dark foreground text in Light Mode (`v3-academic-light.png`).
    - **Remediation:** Added `flex-wrap justify-center` in `Footer.tsx` and `inline-flex flex-wrap max-w-full` in `ProjectsPage.tsx`; attenuated `<Canvas>` container opacity to `opacity-35` in Light Mode and increased `html.light --color-surface` to `rgba(255, 255, 255, 0.88)`. Re-verified `scrollW: 390` across all 7 routes.

11. **Accessibility, Dynamic Document Metadata & Modal Keyboard Support**
    - **Evidence:** Modals in `AdminDashboard` lacked `role="dialog"`, `aria-modal="true"`, `Escape` handlers, and `htmlFor`/`id` label bindings; `Header.tsx` mobile drawer lacked `Escape` closing; `LearningNotesPage` list items used clickable `<div>` elements; `<title>` and `<meta name="description">` remained static across routes.
    - **Remediation:** Added full ARIA dialog attributes, `Escape` closing, semantic `<button type="button">` cards, label `htmlFor`/`id` bindings, and dynamic per-route/per-language `<title>` and `<meta name="description">` updates in `AppContext.tsx`.

---

### `P3` — Hygiene, Tooling & Non-Blocking Technical Debt

12. **Test Suite Hang from Open Firestore gRPC Stream (`src/services/contentRepository.test.ts`)**
    - **Evidence:** Baseline `npm test` hung for `91.4s` waiting on Firestore's idle channel.
    - **Remediation:** Added an `after()` hook invoking `terminate(db)`, dropping full suite runtime to **`1.06s`**.

13. **Unused Packages in `package.json` (Documented Only — Preserved per Constraints)**
    - **Evidence:** `@google/genai`, `express`, `@types/express`, and `dotenv` in `package.json` have no imports in `src/` and no active backend server. Left untouched to comply with the no-dependency-churn constraint.

14. **CourseCard Interactive Container (`src/components/CourseCard.tsx`)**
    - Uses `<div role="button" tabIndex={0} onKeyDown={...}>` with nested `<span>`; functional for keyboard & screen readers, optionally convertible to `<button type="button">` in a future UI pass.

15. **Vendor Chunk Size Above 500 kB (`vendor-three` / `vendor-firebase`)**
    - Expected consequence of bundling Three.js (`1,003.86 kB` / `271.41 kB` gzip) and Firebase Web SDK (`558.10 kB` / `167.97 kB` gzip) for the persistent global 3D shell and Firestore client.
