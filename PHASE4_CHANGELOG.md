# Neural Atlas — Phase 4 Changelog

- **`src/services/cacheService.ts`**
  - Added `CACHE_ENTRY_VERSION = 1`, key/version/shape validator eviction, and browser `BroadcastChannel('na_cache_sync_v1')` invalidation sync.
- **`src/hooks/useCachedResource.ts`**
  - Exported pure `resolveRevalidationState`, added `isErrorResult` option and `isStale` state so background errors preserve stale valid cache and avoid persisting error states.
- **`src/pages/HomePage.tsx`, `ProjectsPage.tsx`, `ProjectDetailPage.tsx`, `AcademicJourneyPage.tsx`, `LearningNotesPage.tsx`, `MilestonesPage.tsx`**
  - Wired `isErrorResult: (res) => res.status === 'error'` on public `useCachedResource` hooks; ensured `LearningNotesPage` keeps `listState` enabled on detail views for Related Notes derivation.
- **`src/lib/markdown.ts`**
  - Added `isEscapedAt` and `findUnescapedDelimiter` to skip escaped dollar tokens (`\$50`) while preserving KaTeX inline/block math and reading statistics accuracy.
- **`src/components/OptimizedImage.tsx`**
  - Added lightbox `document.body.style.overflow` lock/restore, close-button initial focus, `Tab`/`Shift+Tab` focus trapping, and trigger focus return on close.
- **Test Suites (`src/services/cacheService.test.ts`, `backupService.test.ts`, `contentRepository.test.ts`, `katex.test.ts`, `seo.test.ts`, `world.test.ts`)**
  - Expanded test coverage from earlier suites to `70 / 70` passing subtests.
