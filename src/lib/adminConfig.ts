/**
 * Fail-Closed Admin Allowlist Configuration
 *
 * The owner email below must match the email verified inside `firestore.rules`
 * (`isOwner()`). Both layers verify `email_verified === true` and exact email
 * match before enabling Admin Studio UI or Firestore mutations.
 */
export const OWNER_EMAIL_ALLOWLIST: string = 'abdalrahman32008@gmail.com';

export function isConfiguredOwner(
  email: string | null | undefined,
  emailVerified: boolean | undefined
): boolean {
  if (!email || emailVerified !== true) return false;
  // If the placeholder is still present, fail-closed
  if (OWNER_EMAIL_ALLOWLIST === 'REPLACE_WITH_YOUR_GOOGLE_EMAIL@example.com') {
    return false;
  }
  return email.toLowerCase().trim() === OWNER_EMAIL_ALLOWLIST.toLowerCase().trim();
}

export function isPlaceholderEmailConfigured(): boolean {
  return OWNER_EMAIL_ALLOWLIST === 'REPLACE_WITH_YOUR_GOOGLE_EMAIL@example.com';
}
