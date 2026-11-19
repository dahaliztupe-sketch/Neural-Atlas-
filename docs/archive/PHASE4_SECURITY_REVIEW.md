# Neural Atlas — Phase 4 Security Review

## 1. Threat Surface & Mitigations Verified in Code

| Surface | Control Implemented | Verification |
| :--- | :--- | :--- |
| **Owner Authorization (`src/lib/adminConfig.ts`, `firestore.rules`)** | Requires `emailVerified === true` and exact match on `abdalrahman32008@gmail.com`. Client guards treat UI auth strictly as presentation convenience; `firestore.rules` enforces `isOwner()`. | `contentRepository.test.ts` (`isConfiguredOwner` + rules checks) |
| **XSS & Unsafe URL Protocols (`src/lib/markdown.ts`, `validation.ts`, `backupService.ts`)** | `markdown.ts` uses KaTeX `trust: false`, sanitizes `javascript:`/`vbscript:`/`data:` hrefs, and blocks non-http(s) markdown links/images. `backupService.ts` rejects any raw backup URL field failing `isValidOptionalUrl`. | `markdown.test.ts`, `katex.test.ts`, `backupService.test.ts` |
| **PII & Private Inbox Protection** | `contactMessages` has write-only public `create` (`status == 'unread'`) and owner-only `get`/`list`/`delete` in local `firestore.rules`; JSON backup export omits `contactMessages` and zeroes `contactEmail`; JSON-LD omits email; `/admin` DOM emits `emailLeakedInDom: false`. | `seo.test.ts`, `backupService.test.ts`, headless Chromium DOM check |
| **Search Indexing Isolation (`src/lib/seo.ts`, `AppContext.tsx`)** | `/admin`, `not-found`, and draft preview routes emit `<meta name="robots" content="noindex, nofollow" />` and are disallowed in `robots.txt` / excluded from `sitemap.xml`. | `seo.test.ts`, headless Chromium `/admin` check |

## 2. Residual Operational Notes

- Local `firestore.rules` changes remain undeployed in the live Firebase project until the owner runs deployment (see `OWNER_DEPLOYMENT_CHECKLIST.md`).
- Contact form honeypot and client cooldown are anti-noise helpers only; Firebase App Check or server-side endpoints are required if adversarial automated flood mitigation is needed.
