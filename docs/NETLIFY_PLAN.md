# Netlify deployment plan (plan only, nothing created)

Status: plan. No Netlify account, site or deploy exists. Nothing here runs until the owner says so, and no production deploy happens without his explicit "ننشر".

## Why this works with little change
Neural Atlas is a static Vite build (`dist/`). Content and sign-in come from Firebase (Firestore + Auth), which is independent of the host. No server adapter is needed.

## netlify.toml (to add when approved; not added now)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

# SPA fallback. Real files (assets, sw.js, sitemap.xml) are served first.
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Cross-Origin-Opener-Policy = "same-origin-allow-popups"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/registerSW.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```
These mirror `vercel.json` (same security headers, caching, and the COOP header the Google sign-in popup needs). Check the Node version against `package.json` engines / the Vercel build before copying.

## Environment variables
- `VITE_SITE_URL` = the final site URL, for example `https://<name>.netlify.app` or the custom domain. Needed because `vite.config.ts` only reads `VITE_SITE_URL` or Vercel variables; without it, sitemap.xml, robots.txt, canonical and og:url stay relative (Lighthouse robots.txt check fails).
- Nothing else is required. The Firebase web config is committed in `firebase-applet-config.json` (public web config, not a secret). `GEMINI_API_KEY` / `APP_URL` in `.env.example` are AI Studio leftovers; the app code does not read them.

## Firebase Auth step (owner action, required for /admin)
Firebase console, project `industrious-reference-9gtt6`: Authentication, Settings, Authorized domains, add the Netlify domain (and the custom domain if used). Without it Google sign-in fails with an unauthorized-domain error on the new host. If the Firebase API key has HTTP referrer restrictions in Google Cloud Console, add the new domain there too. Firestore rules do not depend on the host.

## What the owner must do or approve
1. Approve creating a Netlify account/site (an account action, not done by the assistant without his yes). Free or paid plan and limits to be checked by him.
2. Choose the domain (default `*.netlify.app` or a custom domain; a custom domain means DNS changes).
3. Approve the PR that adds `netlify.toml`.
4. Add the authorized domain in Firebase (step above).
5. Say "ننشر" before the first production deploy.

## After the first deploy: checks
- `/`, `/projects/neural-atlas`, a deep-link refresh (SPA fallback works), `/sitemap.xml` and `/robots.txt` absolute URLs.
- `/admin`: Google sign-in popup, project list loads, sign out.
- Service worker: clear old caches once, since the same app was served from another origin before.

## Open point
WANASBRAND is a separate project already on Netlify. This plan does not touch it.
