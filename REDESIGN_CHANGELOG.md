# Neural Atlas — Phase 2 Redesign Changelog

- **`src/components/world/WorldSceneContext.tsx`** *(new)*
  - Added shared React context holding `selectedNodeId` and `hoveredNodeId` across shell and Home routes.
- **`src/components/world/worldCapability.ts`**
  - Added `isPublicShell3DRoute`, `shouldEnableShell3D`, and `computeShellCanvasOpacity` alongside existing `shouldEnableHero3D`.
- **`src/components/world/WorldCameraRig.tsx` & `src/components/world/HeroCanvasScene.tsx`**
  - Added `isHeroRoute` camera pullback (`+1.5` Z) and reduced pointer parallax intensity on secondary public routes.
- **`src/components/world/ImmersiveWorldBackground.tsx`**
  - Switched host gating to `shouldEnableShell3D`, applied `computeShellCanvasOpacity`, added `data-mode="interactive-hero" | "ambient-shell"`, and restricted node hover/click handlers to `'home'`.
- **`src/App.tsx` & `src/pages/HomePage.tsx`**
  - Moved `<HeroAmbientCanvasHost />` to root layout inside `<WorldSceneProvider>`; removed duplicate Home canvas mount; applied `pointer-events-none` pass-through only on `'home'` foreground wrapper so canvas node picking works cleanly without blocking UI cards.
- **`src/components/OptimizedImage.tsx`**
  - Added body scroll lock (`overflow: hidden` + restore), initial close-button focus, `Tab` focus trap, and focus restoration on lightbox dismissal.
- **`src/lib/seo.ts`, `vite.config.ts`, `index.html`, `.env.example`, `src/context/AppContext.tsx`**
  - Added `normalizeSiteUrl`, `resolveBaseSiteUrl`, `resolveRobotsMetaContent`, `generateSitemapXml`, `generateRobotsTxt`, and Vite `neuralAtlasSeoPlugin` emitting `/sitemap.xml` & `/robots.txt`. Removed static `<link rel="canonical" href="/" />` that triggered Vite `build-html` `EISDIR`, injecting static canonical/OG tags when `VITE_SITE_URL` is configured and maintaining dynamic runtime updates in `AppContext`.
