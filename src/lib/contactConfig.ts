import { isValidOptionalEmail } from './validation';

export const CONTACT_EMAIL = 'abdalrahman32008@gmail.com';

const CLIENT_CONTACT_EMAIL_STORAGE_KEY = 'neural-atlas-contact-email';

export function getClientContactEmail(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return CONTACT_EMAIL;
  }
  try {
    const stored = window.localStorage.getItem(CLIENT_CONTACT_EMAIL_STORAGE_KEY)?.trim() || '';
    if (stored && isValidOptionalEmail(stored)) {
      return stored;
    }
  } catch {
    // Storage access blocked; fall back cleanly to default contact email constant
  }
  return CONTACT_EMAIL;
}

export function setClientContactEmail(email: string): string {
  const trimmed = String(email || '').trim();
  const next = trimmed && isValidOptionalEmail(trimmed) ? trimmed : CONTACT_EMAIL;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (!trimmed || next === CONTACT_EMAIL) {
        window.localStorage.removeItem(CLIENT_CONTACT_EMAIL_STORAGE_KEY);
      } else {
        window.localStorage.setItem(CLIENT_CONTACT_EMAIL_STORAGE_KEY, next);
      }
    } catch {
      // Ignore storage quota or private-mode restrictions
    }
  }
  return next;
}
