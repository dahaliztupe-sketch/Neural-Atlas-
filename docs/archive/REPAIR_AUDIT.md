# Neural Atlas — Phase 1 Repair & Foundation Audit

**Firebase Project ID:** `industrious-reference-9gtt6`  
**Firestore Database ID:** `ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`  
**Configured Owner Account:** `abdalrahman32008@gmail.com` (verified email required)  
**Recoverable Checkpoint:** Git commit `e07879c`

---

## 1. Data Authority & Publication Invariants

| Check | Status | Source Evidence |
| :--- | :--- | :--- |
| Local seed fallback strictly limited to unconfigured Firebase | **VERIFIED** | `src/services/contentRepository.ts` (`isFirebaseConfigured()`) |
| `getPublishedCoursesResult()` error path returns explicit error, never local fallback | **REPAIRED & TESTED** | Extracted `resolvePublicCoursesCatchResult(err)` returning `{ items: [], source: 'firestore', status: 'error', errorCode }`; covered by `contentRepository.test.ts` |
| Missing remote project/note returns `not_found` without local substitution | **VERIFIED** | `getProjectBySlugResult` & `getNoteBySlugResult` return `status: 'not_found'` when Firestore is configured |
| Owner lookup by slug when Firestore doc ID differs from stored `slug` | **REPAIRED** | Owner path in `getProjectBySlugResult` and `getNoteBySlugResult` scans owner-accessible collection when `doc(db, ..., slug)` is absent |
| Draft records blocked from unauthenticated public queries | **VERIFIED** | Public queries filter `where('publicationStatus', '==', 'published')` and local `firestore.rules` enforce `resource.data.publicationStatus == 'published' || isOwner()` |
| Quick-Seed condition integrity (`needsBaselineSeed`) | **REPAIRED** | `AdminOverviewTab.tsx` gates prompt strictly on `collectionStatuses.projects === 'loaded' && collectionStatuses.courses === 'loaded'`, checking `(projects.length === 0 || courses.length === 0)` without false-triggering on intentionally empty `milestones` (`INITIAL_MILESTONES = []`) |

---

## 2. Firebase Security & Privacy Audit

- **Client Allowlist Hygiene (`src/lib/adminConfig.ts`):** Fail-closed check verifies `emailVerified === true` and case-insensitive match against `abdalrahman32008@gmail.com`. Stale placeholder header comments removed.
- **Public Metadata Privacy (`src/lib/seo.ts`, `src/services/backupService.ts`):** `buildStructuredDataJsonLd()` and `createPortfolioBackupPayload()` never include `contactEmail` or `contactMessages`. Browser inspection of `/admin` confirmed `emailLeakedInDom: false`.
- **Contact Form Controls (`src/lib/validation.ts`, `src/pages/ConnectPage.tsx`):** Honeypot (`company` hidden field) and 60-second client cooldown are strictly client-side anti-spam UX helpers, not server-side rate limiting. Server-side App Check / Cloud Functions rate enforcement is **not deployed** in this workspace.
- **Firestore Rules (`firestore.rules`):** Checked via unit tests (`contentRepository.test.ts`). Note: `firestore.rules` was NOT deployed to live Firebase per strict non-deployment instructions (`BLOCKED — live rules deployment excluded by scope`).

---

## 3. Factual Preservation Audit

- **Courses:** Exactly 7 owner-provided Semester 1 courses (`COURSES.length === 7`), syllabus descriptions preserved as unverified/owner-provided.
- **Projects:** Exactly 2 verified active projects (`cpp-problem-solving`, `local-ai-agent`).
- **Milestones / Notes:** Start empty (`INITIAL_MILESTONES = []`) until authored by the owner.
