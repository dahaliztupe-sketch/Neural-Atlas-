# Neural Atlas — Phase 3 Features Changelog

- **`src/types/index.ts` & `src/data/translations.ts`**
  - Added `noIndex?: boolean` (`SeoOverride`), `CollectionLoadStatus`, `AdminCollectionStatuses`, and 40+ EN/AR dictionary entries covering draft banners, sharing, related items, slug warnings, SEO previews, Diagnostics, JSON backup/restore, Quick-Seed confirmation, and PWA updates.
- **`src/services/backupService.ts`** *(new)*
  - Implemented `BACKUP_SCHEMA_VERSION = 1`, `createPortfolioBackupPayload()` (with PII/message redaction), `parseAndValidateBackupJson()` (strict schema + protocol-safe URL validation), and `computeBackupDiff()`.
- **`src/pages/admin/AdminDiagnosticsTab.tsx`** *(new)*
  - Built Private Operational Diagnostics & JSON Backup/Restore console wired into `AdminDashboard` (`diagnostics` tab).
- **`src/pages/admin/AdminProjectModal.tsx`, `AdminNoteModal.tsx`, `AdminCourseModal.tsx`, `AdminMilestoneModal.tsx`**
  - Added duplicate-slug collision warnings, live EN/AR SEO search snippet previews, in-modal EN/AR preview tabs (courses/milestones), and public draft preview launch buttons (projects/notes).
- **`src/pages/admin/AdminProjectsTab.tsx`, `AdminNotesTab.tsx`, `AdminCoursesTab.tsx`, `AdminMilestonesTab.tsx`, `AdminShared.tsx`**
  - Added preview row actions (`onPreview`) and in-tab preview dialogs for courses & milestones.
- **`src/pages/ProjectDetailPage.tsx`, `src/pages/LearningNotesPage.tsx`, `src/components/OfflineIndicator.tsx`**
  - Added owner draft banner + `noIndex`, Copy Link sharing button, shared-tag Related Projects / Related Notes sections, and SW update notification banner.
