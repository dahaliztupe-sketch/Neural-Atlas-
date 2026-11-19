# Neural Atlas — Phase 4 Bundle & Performance Report

Measured from `vite build` (`dist/assets/`) on Vite 8 / Rolldown:

## 1. Code Splitting & Chunk Isolation

| Chunk | Raw Size | Gzip Size | Loading Boundary |
| :--- | :--- | :--- | :--- |
| `index-*.js` (App Entry) | `169.49 kB` | `45.66 kB` | Initial boot shell |
| `vendor-react-*.js` | `400.79 kB` | `121.80 kB` | Core React 19 runtime |
| `vendor-firebase-*.js` | `560.74 kB` | `168.74 kB` | Firebase Auth/Firestore client SDK |
| `vendor-three-*.js` | `1,252.85 kB` | `375.42 kB` | Isolated lazy chunk (`HeroCanvasScene`: `21.59 kB` / `6.35 kB` gzip) — never downloaded on mobile `<768px`, `/admin`, `not-found`, or reduced motion |
| `vendor-katex-*.js` | `259.13 kB` | `77.69 kB` | Isolated lazy chunk — loaded only on Markdown/math views (`ProjectDetailPage`, `LearningNotesPage`, `MarkdownEditorField`) |
| `vendor-markdown-*.js` | `119.49 kB` | `37.47 kB` | Isolated `marked` + selective `highlight.js` languages |
| `AdminDashboard-*.js` | `53.13 kB` | `9.81 kB` | Route-split admin bundle (`AdminDiagnosticsTab`: `24.78 kB` / `5.56 kB` gzip) |

## 2. Runtime Optimizations

- **Zero-Mount Route Switching on Desktop:** Keeping one shared `<Canvas>` in `App.tsx` avoids tearing down and recompiling WebGL shaders across public route transitions (`/` -> `/projects` -> `/academic`).
- **Software WebGL & Hidden Tab Throttling:** `resolveFrameloopMode` switches to `'never'` when `document.hidden` is true and `'demand'` under software GL renderers (e.g., SwiftShader).
- **SWR Navigation Speed:** `clientCache` serves immediate in-memory / `sessionStorage` data across public views while revalidating silently in the background.
