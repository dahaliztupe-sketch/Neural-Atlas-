# Neural Atlas

**Neural Atlas** is the personal portfolio and academic archive of **Abdalrahman Mostafa**, a first-year Intelligent Computing student at the Faculty of Science, Al-Azhar University.

## Architecture & Key Capabilities
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, bilingual English/Arabic with RTL/LTR parity (`Plus Jakarta Sans` + `IBM Plex Sans Arabic`).
- **Progressive-Enhancement 3D Hero**: Subtle Three.js / React Three Fiber ambient background (`HeroCanvasScene` lazy-loaded strictly on desktop `/` viewports `>= 768px` with WebGL and motion enabled). Sub-routes, mobile viewports, and `prefers-reduced-motion` render a zero-WebGL static atmospheric grid backdrop.
- **Data & Security**: Firebase Authentication (Google Sign-In) & Cloud Firestore (`industrious-reference-9gtt6`). Public pages strictly enforce configured Firestore query semantics (no silent local fallback masks on remote errors/empty collections).
- **CMS Studio**: Fail-closed private admin dashboard at `/admin` with draft/publish quality gates, case-study fields, external HTTPS cover image + alt-text support, and dynamic per-item SEO overrides.

## Local Development & Verification
```bash
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
npm test         # Runs node:test suite (36 tests across data, routing, repository, validation)
npm run lint     # Runs TypeScript type checking (tsc --noEmit)
npm run build    # Builds production bundle into dist/
```

## Hosting & SPA Routing Note
All public routes (`/`, `/about`, `/academic`, `/projects/:slug`, `/notes/:slug`, `/milestones`, `/connect`, `/admin`) use HTML5 History API routing. When deploying `dist/` to static hosting (e.g., Firebase Hosting, Vercel, Cloudflare Pages, Netlify), configure a catch-all rewrite to `/index.html` so direct deep links and refreshes resolve properly.

## Additional Documentation
- **Admin Setup, Rules & Auth Hardening**: [ADMIN_SETUP.md](./ADMIN_SETUP.md)
- **Evidence-First Redesign & Verification Report**: [REDESIGN_VERIFICATION_REPORT.md](./REDESIGN_VERIFICATION_REPORT.md)
