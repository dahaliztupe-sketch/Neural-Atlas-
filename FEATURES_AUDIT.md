# Neural Atlas — Phase 3 Features Audit

## 1. Public UX & Discovery

- **Related Content Discovery (`ProjectDetailPage.tsx`, `LearningNotesPage.tsx`):** Added real similarity-ranked Related Projects (shared `technologies` count) and Related Notes (shared `topicLabels` count) derived strictly from cached published Firestore/local records—never fabricated placeholders.
- **Share / Copy Link:** Both project details and learning notes provide one-click permalink copy with localized feedback badge.
- **Owner Draft Previews:** Signed-in owner viewing an unpublished `draft` receives an explicit Obsidian/amber Preview Banner with `Back to Admin Studio` action and `noindex, nofollow` robots protection.
- **PWA Update Notification (`OfflineIndicator.tsx`):** Detects `waiting` / `updatefound` service worker updates and offers a clean non-blocking Refresh prompt, alongside theme-safe offline banner contrast.

## 2. Admin Studio Operational Completeness

- **Overview Quick-Seed Guard:** Shows confirmation modal explaining exact baseline item counts (7 courses, 2 projects, profile) only after collections finish loading (`status === 'loaded'`) and are actually empty.
- **Duplicate Slug Warnings & SEO Snippet Preview (`AdminProjectModal.tsx`, `AdminNoteModal.tsx`, `AdminCourseModal.tsx`):** Real-time `existingSlugs` collision check prevents accidental slug collisions, and live SERP snippet cards preview EN/AR titles, URLs, and descriptions.
- **Live Owner Previews:**
  - Projects & Notes: Save-gated `Open Public Preview` button navigates to `/projects/:slug` or `/notes/:slug`.
  - Courses & Milestones: In-modal/in-tab EN/AR live previews render `<CourseDetailModal>` and milestone card previews without requiring public deployment.
- **Operational Diagnostics & Backup/Restore (`AdminDiagnosticsTab.tsx`, `backupService.ts`):**
  - Displays live Firebase project/database IDs (`industrious-reference-9gtt6`, `ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`), verified owner status, online/SW state, per-collection load statuses, and explicit client-vs-server rules notice.
  - Supports sanitized JSON Export (redacting `contactMessages` and `contactEmail`) and a schema-validated Restore wizard with conflict diff preview and `skip`/`overwrite` strategies.
