# Neural Atlas — Phase 2 Redesign & Visual Architecture Guide

## 1. Visual Identity ("Obsidian & Mineral Glass")

- **Palette & Surfaces:**
  - Dark mode (`#050811` Obsidian canvas, translucent mineral glass cards with crisp hairline borders, cyan `#22d3ee` and electric amethyst `#8b5cf6` accents).
  - Light mode (`#f4f6fb` pale mineral paper with high-contrast charcoal typography and accessible accent weights).
- **Typography & Bilingual Parity:**
  - English (`dir="ltr"`, `lang="en"`): `Plus Jakarta Sans` + `JetBrains Mono` for metadata indices.
  - Arabic (`dir="rtl"`, `lang="ar"`): `IBM Plex Sans Arabic`, mirrored 3D astrolabe stage offset (`getAstrolabeStageOffsetX(isRtl)`), and RTL-isolated `<bdi>`/LTR math formulas.

## 2. Shared Shell 3D Astrolabe Architecture

- **Single Persistent WebGL Host:** `src/App.tsx` renders `<HeroAmbientCanvasHost />` wrapped in `WorldSceneProvider` (`src/components/world/WorldSceneContext.tsx`) once at the shell root instead of remounting a `<Canvas>` per route.
- **Route & Capability Gating (`src/components/world/worldCapability.ts`):**
  - **Interactive Hero Mode (`/` on Desktop `>=768px`, WebGL enabled, non-reduced motion):** Full astrolabe opacity (`0.92` dark / `0.52` light at top, smoothly dimming on scroll), interactive orbital node hover/click (`cpp`, `local-ai`, `python`) synchronized via `WorldSceneContext`.
  - **Ambient Shell Mode (`/about`, `/academic`, `/projects`, `/notes`, `/milestones`, `/connect` on Desktop `>=768px`):** Calm attenuated backdrop (`0.24` dark / `0.14` light), Z-axis camera pullback (`+1.5` in `WorldCameraRig.tsx`), dampened parallax, and `pointer-events-none` on the canvas layer so all page controls remain effortless to click.
  - **Calm Unmounted Fallback (`/admin`, `not-found`, mobile `<768px`, `prefers-reduced-motion`, or unsupported WebGL):** Zero `<canvas>` elements mounted (`0` WebGL overhead).

## 3. Keyboard, Lightbox & Focus Discipline

- `OptimizedImage.tsx` renders zero-CLS framed containers (`aspect-ratio` + Mineral Glass shimmer skeleton) and an optional project lightbox that locks `document.body` scrolling, focuses the Close button on open, traps `Tab`/`Shift+Tab` inside the modal, closes on `Escape`, and restores focus to the trigger element on close.
