# Neural Atlas — Admin Setup & Security Architecture Guide

This guide documents the private administration dashboard (`/admin`), content publishing workflow, Firebase Security Rules, and future authorization hardening path for **Neural Atlas**.

---

## 1. Dual-Layer Fail-Closed Security Model

1. **Client-Side Route Guard (`src/lib/adminConfig.ts` & `src/context/AuthContext.tsx`)**:
   - Authorizes UI access strictly when a Firebase user is signed in with Google, `emailVerified === true`, and `email` matches `abdalrahman32008@gmail.com`.
   - Unauthorized or signed-out visitors never see dashboard controls or private draft lists.
   - *Boundary Note*: Client-side checks improve UX only; the compiled client bundle is never a security boundary.

2. **Server-Enforced Firestore Security Rules (`firestore.rules`)**:
   - Authoritative access control evaluated on Google Cloud Firestore servers:
     ```rules
     function isOwner() {
       return isSignedIn() &&
         request.auth.token.email_verified == true &&
         request.auth.token.email == 'abdalrahman32008@gmail.com';
     }
     ```
   - Collection `list` queries and existing document reads are restricted to `publicationStatus == 'published' && visibility == 'public'` on `projects` (and `publicationStatus == 'published'` on `courses`, `notes`, `milestones`, or `isOwner()`), while `settings` reads are isolated to `settingId == 'profile'` (or `isOwner()`).
   - Writes validate strict field allowlists (`keys().hasOnly(...)`), protocol safety (`^https?://.*` on URLs including `coverImageUrl`), string length caps, and list element typing.

---

## 2. Optional Future Hardening: UID / Custom-Claims Migration Path
While `request.auth.token.email == 'abdalrahman32008@gmail.com'` combined with `email_verified == true` provides strong single-owner enforcement for Google Sign-In, the owner can optionally strengthen rules further by binding directly to Firebase Auth UID or a server-minted custom claim (`request.auth.token.admin == true`):
1. Obtain the owner's immutable `uid` from Firebase Console -> Authentication -> Users (or `user.uid` in the Account tab after signing in).
2. Either check `request.auth.uid == '<OWNER_UID>'` inside `isOwner()` in `firestore.rules`, or assign `{ admin: true }` via the Firebase Admin SDK (`admin.auth().setCustomUserClaims(uid, { admin: true })`) and check `request.auth.token.admin == true`.
3. Re-deploy `firestore.rules` after updating.

---

## 3. Content & Media Workflow in `/admin`
- **Projects & Case Studies**:
  - Support bilingual titles, explicit `visibility` (`public` vs `internal_archive`), `archiveGroup`, `featuredOnHome`, status labels, summaries, full descriptions, technologies, external HTTPS repo/live links, external `coverImageUrl` (with required EN/AR alt text when publishing), structured evidence fields (`role`, `problem`, `approach`, `outcome`), and SEO overrides (`seoTitle`, `seoDescription`).
  - **Cover Images Note**: Cover images use external HTTPS URLs only (`isOptionalHttpUrl`); Firebase Storage file uploads are intentionally not enabled so no unconfigured storage bucket is assumed.
- **Draft vs. Published Invariants**:
  - Drafts allow incremental saving with minimal fields (`titleEn`, `titleAr`, `slug`).
  - Publishing enforces meaningful bilingual descriptions/content (`>= 12` chars on projects/milestones; `>= 20` chars on notes) and accessible alt text when a cover image URL is provided.
- **One-Time Seed Migration**:
  - From the **Overview** tab, click **Import Existing Site Content** once after deploying `firestore.rules`. It checks existing IDs idempotently and seeds the 7 project records (6 public showcase/archive entries + 1 internal_archive entry), 7 baseline courses, 4 verified milestones, and public profile without overwriting existing documents.

---

## 4. Owner Deployment & Verification Checklist (Remote Firebase)
1. **Deploy Updated Rules**:
   - Run `firebase deploy --only firestore:rules` (or `DeployRules` RPC) targeting project `industrious-reference-9gtt6` and database `ai-studio-neuralatlasabdal-7ac05a16-2036-45ec-8f41-c9ea05e44304`.
2. **Verify Authorized Domains**:
   - In Firebase Console -> Authentication -> Settings -> Authorized domains, ensure your production domain (plus `localhost` for local dev) is listed for Google Sign-In popups.
3. **Seed Live Data**:
   - Sign in at `/admin` with `abdalrahman32008@gmail.com` and run the one-time seed migration.
