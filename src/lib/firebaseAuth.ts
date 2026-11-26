import type { FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

// Only imported dynamically from lib/firebase.ts (loadFirebaseAuth).
export const googleProvider = new GoogleAuthProvider();

export function getFirebaseAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}
