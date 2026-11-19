# Contributing to Neural Atlas

Thank you for your interest in improving **Neural Atlas**. Because this repository serves both as an engineered web application and as **Abdalrahman Mostafa**'s personal academic portfolio, contributions should preserve both code quality and factual integrity.

---

## Scope of Contributions

Welcome contributions include:
- Bug fixes, accessibility improvements (WCAG / ARIA / keyboard navigation), and RTL/LTR layout refinements
- Performance optimizations, WebGL/Three.js resilience, and PWA caching improvements
- Documentation clarity, architecture notes, and automated test coverage

Out-of-scope contributions:
- Altering personal academic history, course records, project statuses, or fabricated achievements in `src/data/portfolioData.ts`
- Weakening `firestore.rules`, `src/lib/validation.ts`, or `src/lib/adminConfig.ts`
- Introducing unrequested tracking scripts, external ad SDKs, or unvetted dependencies

---

## Local Development Setup

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000`.

---

## Engineering Conventions

1. **TypeScript & Modularity**: Keep business logic, validation, and data normalization decoupled from React components (`src/lib/`, `src/services/`, `src/router/`) so it remains unit-testable with `node:test`.
2. **Bilingual Parity (EN & AR)**: Every user-facing string must have matching English and Arabic entries in `src/data/translations.ts`, and layouts must work cleanly in both `dir="ltr"` and `dir="rtl"`.
3. **Theme Parity**: Test UI changes in both Obsidian Dark and Mineral Alabaster Light modes using CSS custom properties defined in `src/index.css`.
4. **3D Progressive Enhancement**: Keep `HeroCanvasScene` lazy-loaded and restricted to desktop `/` with `prefers-reduced-motion` and WebGL capability checks intact.
5. **Security & Schema Parity**: Whenever changing entity shapes in `src/types/index.ts`, synchronize `firebase-blueprint.json`, `firestore.rules`, `src/lib/validation.ts`, and `firestore.rules.test.ts`.

---

## Required Verification Before Opening a Pull Request

Run all checks locally and ensure zero errors:

```bash
npm run lint         # TypeScript typecheck (tsc --noEmit)
npm run lint:rules   # ESLint check on firestore.rules
npm test             # Full node:test unit & security-rules suite
npm run build        # Production Vite + PWA build
```

---

## Pull Request Process

1. Fork the repository and create a focused branch from `main` (e.g., `fix/rtl-header-wrap` or `docs/architecture-diagram`).
2. Keep pull requests scoped to a single concern with clear commit messages.
3. Fill out the [Pull Request Template](./.github/PULL_REQUEST_TEMPLATE.md), including verification outputs and screenshots for UI changes.
4. Respect the [Code of Conduct](./CODE_OF_CONDUCT.md).
