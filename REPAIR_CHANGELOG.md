# Neural Atlas — Phase 1 Repair Changelog

- **`src/services/contentRepository.ts`**
  - Exported pure `resolvePublicCoursesCatchResult(err)` guaranteeing `getPublishedCoursesResult()` returns `{ items: [], source: 'firestore', status: 'error', errorCode }` on `permission_denied` or `firestore_unavailable` instead of leaking local fallback items.
  - Added owner slug-scan fallback in `getProjectBySlugResult()` and `getNoteBySlugResult()` when `isOwner === true` and Firestore document ID differs from stored `slug`.
- **`src/lib/adminConfig.ts`**
  - Removed obsolete placeholder comments while keeping fail-closed `isConfiguredOwner(email, emailVerified)` logic.
- **`src/pages/admin/AdminOverviewTab.tsx` & `src/pages/admin/AdminDashboard.tsx`**
  - Added per-collection `AdminCollectionStatuses` (`projects`, `courses`, `notes`, `milestones`, `contactMessages`, `profile`) so baseline seeding checks strictly verify `'loaded'` collections (`projects.length === 0 || courses.length === 0`) and ignore intentionally empty `milestones`.
  - Added Quick-Seed confirmation dialog before invoking baseline Firestore seeding.
- **`ADMIN_SETUP.md`**
  - Corrected seeding documentation summary to accurately state 2 verified projects, 7 baseline courses, and public profile settings.
- **`src/services/contentRepository.test.ts`**
  - Added regression test for `resolvePublicCoursesCatchResult` verifying `permission_denied` and offline errors return `status: 'error'` and empty `items`.
