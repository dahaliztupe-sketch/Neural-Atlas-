# Performance and quality notes

Lab measurements only. These are local Lighthouse runs (mobile emulation, 4x CPU throttle, headless Chrome, production build served by `vite preview`). They are not real-device or field data (no CrUX / RUM). Re-measure on the deployed site and on a real phone before quoting a number anywhere public.

## Baseline on main (home page, Nov 2026)

| Metric | Value | Note |
| --- | --- | --- |
| Performance score | 0.70 | varies 0.70 to 0.76 between runs |
| LCP | 0.8 s | fine |
| CLS | 0 | fixed in an earlier PR (font-display optional) |
| TBT | about 2.6 to 3.3 s | the weak spot, noisy |
| Accessibility | 1.00 | |
| Best practices | 1.00 | |
| SEO | 0.92 | only `robots.txt` fails locally: no site URL at build time, so `Sitemap:` is relative |

On Vercel the build reads the project URL from the environment, so `robots.txt`, `sitemap.xml`, canonical and og:url become absolute (see `vite.config.ts`, `src/lib/seo.ts`). This is expected to pass after a deploy but has not been verified yet.

## What was ruled out

- The 3D scene is not the cause of the high TBT. With WebGL disabled TBT stayed about 3.0 s.
- Deferring the auth listener to idle time alone gave no measurable change.

## Where the cost is

- React and Firebase script evaluation, plus style and layout work.
- Firebase is about 169 KB gzip on every page. Much of it is unused on first load (Lighthouse reports about 109 KB unused).

## Ideas, not done yet (each needs a measurement before and after)

1. Load Firebase Auth on demand (draft PR, needs an `/admin` sign-in test after deploy).
2. Look at the Firestore SDK cost: the first content read needs it, so a lighter read path would be a larger change.
3. Check long tasks on a real phone with the Performance panel before more code changes.

## Checklist for a quality pass (per page)

- Lighthouse accessibility 1.00 and no new contrast failures (solid purple token is `#7c3aed` dark / `#6d28d9` light).
- Page text matches the owner's approved wording; no claims about users, revenue or shipped features that are not true.
- AI-assisted projects are labeled as AI-assisted; first-year student and "learning" framing is kept.
