# Security Policy

## Security Architecture Summary

**Neural Atlas** is a client-rendered SPA backed by **Firebase Authentication** and **Cloud Firestore** (`ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`). Security boundaries follow a fail-closed server-authoritative model:

1. **Public Client Config vs. Secrets**:
   - `firebase-applet-config.json` contains standard Firebase Web SDK client identifiers (`projectId`, `apiKey`, `appId`). These values are public by design in browser applications and do **not** grant administrative privileges.
   - True authorization is enforced server-side in [`firestore.rules`](./firestore.rules), not in client JavaScript.
2. **Authentication & Owner Access Control**:
   - Administrative operations require Google Sign-In (`email_verified == true`) matching the configured owner account.
   - Client-side checks (`src/lib/adminConfig.ts`) control dashboard UI visibility only.
3. **Public Data & Privacy Boundaries**:
   - Public `projects` queries require **both** `publicationStatus == 'published'` and `visibility == 'public'`. Items marked `internal_archive` or legacy documents missing `visibility` are inaccessible to public readers.
   - `settings/profile` rejects private fields such as `contactEmail` (`!('contactEmail' in incoming())`).
   - `contactMessages` operates as a write-only public dropbox (`create` with `status == 'unread'`; `get`, `list`, `update`, and `delete` restricted strictly to the verified owner).
4. **Content Sanitization**:
   - Markdown + KaTeX rendering (`src/lib/markdown.ts`) runs with `trust: false` and strips `javascript:`, `vbscript:`, and `data:` protocols from links and images.

---

## Reporting a Vulnerability

If you discover a security issue in `firestore.rules`, client sanitization, XSS handling, or authentication logic:

- **Do not** open a public GitHub issue with exploit details.
- **Preferred**: Use GitHub **Private Vulnerability Reporting** under the repository's **Security** tab (`Security Advisories -> Report a vulnerability`), if enabled on GitHub.
- **Alternative**: Reach out privately through the verified channels linked on the live site's [`/connect`](https://ais-pre-ahuiyvesdomlkxjzyw7kqw-152637699957.europe-west1.run.app/connect) page or LinkedIn profile, referencing `[Neural Atlas Security]`.

Please include:
- A clear description of the vulnerability and affected files or rules
- Steps to reproduce or proof-of-concept payload
- Potential impact assessment

Reports will be reviewed promptly, and validated fixes will be documented in `CHANGELOG.md` once remediated and deployed.
