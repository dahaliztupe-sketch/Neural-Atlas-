# Neural Atlas — Firestore Security Specification

## 1. Data & Access Control Invariants

1. **Default Deny & Zero Blanket Reads**: Every path not explicitly matched fails closed. No collection allows unauthenticated or blanket `allow list: if true`.
2. **Verified Owner Allowlist (`isOwner()`)**: Only an authenticated Google user whose `email_verified == true` and `email == 'abdalrahman32008@gmail.com'` can read drafts, read `internal_archive` projects, read `/contactMessages`, list `/settings`, or mutate CMS collections (`/projects`, `/notes`, `/milestones`, `/courses`, `/settings/profile`).
3. **Explicit Visibility & Publication Boundary (`projects`)**:
   - `get`: Allowed only when `isValidId(projectId)` AND (`isOwner()` OR (`resource != null` AND `resource.data.publicationStatus == 'published'` AND `resource.data.visibility == 'public'`)). Missing or legacy untagged documents are never exposed publicly.
   - `list`: Allowed only when `isOwner()` OR (`resource.data.publicationStatus == 'published'` AND `resource.data.visibility == 'public'`), forcing public queries to filter `where('publicationStatus', '==', 'published')` AND `where('visibility', '==', 'public')`.
4. **Publication Boundary (`notes`, `milestones`, `courses`)**:
   - `get`: Allowed only when `isValidId(docId)` AND (`resource == null` OR `resource.data.publicationStatus == 'published'` OR `isOwner()`).
   - `list`: Allowed only when `resource.data.publicationStatus == 'published'` OR `isOwner()`, forcing public queries to filter `where('publicationStatus', '==', 'published')`.
   - `create` / `update`: Owner only + `isValidId(docId)` + `incoming().id == docId` + `isValid[Entity](incoming())` enforcing `hasAll(...)` required keys, `hasOnly(...)` allowlists, type/size bounds, bounded lists with string element type guards, and HTTP/HTTPS-only URLs.
   - `update`: `createdAt` is immutable once present (`!('createdAt' in resource.data) || incoming().createdAt == resource.data.createdAt`).
5. **Write-Only Contact Dropbox (`contactMessages`)**:
   - Public `create` requires `isValidId(messageId)`, `incoming().id == messageId`, `incoming().status == 'unread'`, `hasAll(['id', 'senderName', 'subject', 'message', 'language', 'status', 'createdAt'])`, `hasOnly(...)`, length/enum validation.
   - Zero public `get`, `list`, `update`, or `delete`.
   - Owner `update` enforces `isValidContactMessage(incoming())`, immutable `id` and `createdAt`, and restricts mutable keys to `['status', 'updatedAt']`.
6. **PII Isolation on Public Profile (`settings/profile`)**:
   - Public `get` is restricted exclusively to `settingId == 'profile'` (all other `/settings/*` docs require `isOwner()`).
   - `allow list` requires `isOwner()`.
   - `contactEmail` and private owner metadata are completely excluded from `ProfileSettings` allowlist and schema so personal PII is never stored or leaked on publicly readable documents.
   - `delete` is unconditionally `false`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Collection / Path | Attack Vector | Target Violation | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `/projects/bad-proj` | Owner or attacker writes with `isAdmin: true` shadow field | `hasOnly(...)` schema allowlist | `PERMISSION_DENIED` |
| 2 | `/projects/bad-proj` | Missing required key (`visibility`, `titleAr`, or `statusType` omitted) on create/update | `hasAll(...)` required keys | `PERMISSION_DENIED` |
| 3 | `/projects/bad-proj` | Owner or attacker writes `url: "javascript:alert(1)"` | `isOptionalHttpUrl` protocol guard | `PERMISSION_DENIED` |
| 4 | `/projects/bad-proj` | Update mutates `createdAt` to forge earlier/later creation timestamp | `createdAt` immutability gate | `PERMISSION_DENIED` |
| 5 | `/notes/bad-note` | Payload injects `contentEn` > 20,000 chars (DoW exhaustion) or `topicLabels` > 20 items | String/array size bounds | `PERMISSION_DENIED` |
| 6 | `/milestones/bad-ms` | Update mutates `createdAt` or sets invalid `category: "award"` | `createdAt` immutability & enum | `PERMISSION_DENIED` |
| 7 | `/settings/profile` | Profile payload includes `contactEmail: "leak@example.com"` or invalid `learningTracks` | PII exclusion & `hasOnly(...)` | `PERMISSION_DENIED` |
| 8 | `/settings/private` | Anonymous `get` on non-profile settings doc or `list` on `/settings` | Settings isolation gate | `PERMISSION_DENIED` |
| 9 | `/contactMessages/msg-1` | Public `create` sets `status: "read"` or injects `replyNote` ghost field | `status == 'unread'` & `hasOnly(...)` | `PERMISSION_DENIED` |
| 10 | `/contactMessages/msg-1` | Public visitor tries `get`, `list`, `update`, or `delete` on inbox messages | Write-only dropbox boundary | `PERMISSION_DENIED` |
| 11 | `/contactMessages/msg-1` | Owner `update` mutates `message`, `senderName`, or `createdAt` | `affectedKeys().hasOnly(['status', 'updatedAt'])` | `PERMISSION_DENIED` |
| 12 | `/projects/private-archive-example` (and `/projects/..poison..`) | Anonymous `get`/`list` attempts to read `visibility == 'internal_archive'` or legacy missing-`visibility` project, or forged doc ID / unverified email | Explicit `visibility == 'public'` + `isValidId` + `email_verified == true` | `PERMISSION_DENIED` |
