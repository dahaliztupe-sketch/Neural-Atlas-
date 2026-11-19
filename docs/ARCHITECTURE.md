# System Architecture

**Neural Atlas** is structured as a modular React 19 + TypeScript single-page application (`src/`) backed by Cloud Firestore and Firebase Authentication (`industrious-reference-9gtt6`).

---

## 1. Routing & Code Splitting

- **Router (`src/router/router.ts`)**: Uses the browser HTML5 History API to resolve `/`, `/about`, `/academic`, `/projects`, `/projects/:slug`, `/notes`, `/notes/:slug`, `/milestones`, `/connect`, and `/admin`.
- **Lazy Route Chunks (`src/App.tsx`)**: Secondary pages and `/admin` (`AdminDashboard`) are loaded dynamically via `React.lazy` + `Suspense`, keeping public initial bundle weights small and isolating Admin Studio code from visitor downloads.
- **Vendor Splitting (`vite.config.ts`)**: Splits `vendor-react`, `vendor-firebase`, `vendor-markdown`, `vendor-katex`, and `vendor-three` into dedicated long-lived cache groups.

---

## 2. Data Access, SWR Cache & Fallback Boundaries

- **Authoritative Query API (`src/services/contentRepository.ts`)**:
  - Returns typed `DataQueryResult<T>` and `SingleDataQueryResult<T>` envelopes (`status: 'success' | 'empty' | 'error' | 'not_found' | 'unconfigured'`).
  - When Firebase is configured (`isFirebaseConfigured() === true`), empty collections or backend errors are surfaced explicitly — never masked with silent fallback to `src/data/portfolioData.ts`.
  - Public `projects` queries explicitly filter `where('publicationStatus', '==', 'published')` and `where('visibility', '==', 'public')`.
- **Client SWR Cache (`src/services/cacheService.ts`, `src/hooks/useCachedResource.ts`)**:
  - Dual-layer cache (in-memory `Map` + `window.sessionStorage` under `na_cache_v1:`) with schema version checks (`CACHE_ENTRY_VERSION = 1`).
  - Cross-tab synchronization via `BroadcastChannel('na_cache_sync_v1')` when Admin mutations invalidate collections.
  - Preserves stale cached entries cleanly during transient background revalidation failures without overwriting valid cache data with errors.

---

## 3. Home-Only Progressive 3D Astrolabe

Implemented in `src/components/world/`:

- **Strict Home-Only Capability Gate (`worldCapability.ts`)**:
  - `shouldEnableShell3D` / `shouldPreloadShell3D` enable WebGL exclusively when `routeName === 'home'`, desktop width `>= 768px`, `!prefersReducedMotion`, and real WebGL capability (`probeWebGL().supported`) is present.
  - Inner routes (`/about`, `/academic`, `/projects`, `/notes`, `/milestones`, `/connect`), `/admin`, mobile viewports, and reduced-motion environments render **zero `<canvas>` elements** and trigger **zero Three.js network requests**.
- **Software-WebGL Demand Settlement**:
  - Detects software WebGL renderers (`SwiftShader`, `llvmpipe`, `Software`, `ANGLE`) via `detectSoftwareWebGL()` and switches the R3F canvas to `frameloop="demand"`.
  - Camera and portal damping checks (`hasDampingDelta`) call `invalidate()` only while motion deltas remain above threshold, allowing CPU-rendered headless browsers to settle cleanly with zero idle RAF spin.
- **Context Resilience (`HeroCanvasScene.tsx`)**:
  - Binds `webglcontextlost` and `webglcontextrestored` listeners directly to the canvas element in `onCreated` with cleanup refs and renders a clean DOM fallback overlay if WebGL context is lost.

---

## 4. Hardened Markdown + KaTeX & Media Pipelines

- **Markdown + Math (`src/lib/markdown.ts`)**:
  - Custom `marked` extension tokenizes block (`$$...$$`) and inline (`$...$`) LaTeX math while ignoring fenced/inline code and escaped currency delimiters (`\$50`).
  - KaTeX renders with `trust: false` and `strict: 'ignore'`, wrapped in `dir="ltr"` containers for clean Arabic RTL embedding.
  - Sanitizes rendered links and images against `javascript:`, `vbscript:`, and `data:` protocols.
- **Zero-CLS Images (`src/components/OptimizedImage.tsx`)**:
  - Reserves explicit aspect-ratio dimensions prior to decode, displays Mineral Glass shimmer skeletons during fetch, falls back to geometric placeholders offline/on error, and supports accessible lightbox zooming.

---

## 5. Firestore Collections & Schema Parity

Canonical schemas are defined in [`firebase-blueprint.json`](../firebase-blueprint.json) and enforced verbatim in [`firestore.rules`](../firestore.rules) and [`src/lib/validation.ts`](../src/lib/validation.ts):

| Collection | Public Read Rule | Write Rule | Notes |
| :--- | :--- | :--- | :--- |
| `projects` | `publicationStatus == 'published' && visibility == 'public'` | Owner only | `internal_archive` & missing `visibility` denied publicly |
| `courses` | `publicationStatus == 'published'` | Owner only | Preserves Semester 1 archive & unverified syllabus tags |
| `notes` | `publicationStatus == 'published'` | Owner only | Supports bilingual Markdown + LaTeX |
| `milestones` | `publicationStatus == 'published'` | Owner only | Verified timeline entries |
| `settings` | `settingId == 'profile'` (`get` only) | Owner only (`profile`) | Rejects `contactEmail` PII; collection `list` denied publicly |
| `contactMessages` | Denied | Public `create` (`status == 'unread'`) | Owner-only `get`, `list`, `update` (`status`/`updatedAt`), `delete` |

---

## 6. Further Reading

- [Admin Studio Setup & Auth Boundaries](./ADMIN_SETUP.md)
- [Owner Deployment Checklist](./OWNER_DEPLOYMENT_CHECKLIST.md)
- [Security Specification](./SECURITY_SPEC.md)
- [Historical Engineering Archive](./archive/README.md)
