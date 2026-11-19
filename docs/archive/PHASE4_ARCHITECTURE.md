# Neural Atlas — Phase 4 System Architecture

## 1. Layered Client SWR Cache (`cacheService.ts` + `useCachedResource.ts`)

- **Dual Storage:** In-memory `Map` + `window.sessionStorage` (`na_cache_v1:` prefix) storing `CACHE_ENTRY_VERSION = 1` envelopes (`{ version, key, data, storedAt, ttlMs }`).
- **Corruption & Schema Resilience:** Mismatched versions/keys, malformed JSON, or failed optional shape validators trigger automatic entry eviction without throwing.
- **Cross-Tab Synchronization:** `BroadcastChannel('na_cache_sync_v1')` broadcasts `invalidate` and `clear` events across open browser tabs while Admin writes invoke `clientCache.invalidate(...)`.
- **Error-Safe Revalidation (`resolveRevalidationState`):** When background SWR revalidation fails or returns a domain error result (`status === 'error'`), stale valid cached data is preserved (`isStale: true`) and the failed response is never written into cache.

## 2. Hardened KaTeX & Markdown Pipeline (`src/lib/markdown.ts`)

- **Parser:** Custom `marked` extension tokenizing `$$...$$` display math and `$...$` inline math with `isEscapedAt` / `findUnescapedDelimiter` so escaped currency (`\$50`) and fenced/inline code blocks are ignored.
- **Security:** Enforces `trust: false` and `strict: 'ignore'` inside KaTeX, strips `javascript:` / `vbscript:` / `data:` protocols in markdown links, images, and rendered KaTeX anchors, and isolates every equation inside `dir="ltr"` containers for Arabic RTL readability.

## 3. Zero-CLS Image Pipeline (`src/components/OptimizedImage.tsx`)

- Reserves exact aspect-ratio geometry prior to image decode, shows a Mineral Glass shimmer placeholder while loading, falls back to a geometric monogram surface offline or on load failure, and provides an accessible lightbox modal on Project Detail views.

## 4. Persistent Shell 3D Host (`src/components/world/*`)

- Single `<Canvas>` hosted in `App.tsx` under `WorldSceneProvider`, sharing `selectedNodeId` / `hoveredNodeId` with `HomePage`, switching cleanly between `interactive-hero` and calm `ambient-shell` across public desktop routes, and unmounting completely on `/admin`, `not-found`, `<768px`, and reduced-motion environments.
