import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  Firestore,
  FirestoreSettings,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export { firebaseConfig };

export function getFirestoreTransportSettings(): FirestoreSettings {
  return {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  };
}

let appInstance: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;

try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const databaseId = firebaseConfig.firestoreDatabaseId || undefined;
  try {
    dbInstance = databaseId
      ? initializeFirestore(appInstance, getFirestoreTransportSettings(), databaseId)
      : initializeFirestore(appInstance, getFirestoreTransportSettings());
  } catch {
    // Fallback if Firestore was already initialized on this app instance (e.g. HMR)
    dbInstance = databaseId
      ? getFirestore(appInstance, databaseId)
      : getFirestore(appInstance);
  }
  authInstance = getAuth(appInstance);
} catch (err) {
  console.warn('Firebase initialization notice:', err);
  // Fallback mocks if needed in isolated non-browser test runs
  appInstance = {} as FirebaseApp;
  authInstance = {} as Auth;
  dbInstance = {} as Firestore;
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth?.currentUser;
  const rawMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: rawMessage,
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let activeConnectionTest: Promise<boolean> | null = null;

export async function testConnection(): Promise<boolean> {
  if (!db || !db.type) return false;
  if (activeConnectionTest) return activeConnectionTest;

  activeConnectionTest = (async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration.');
        return false;
      }
      return true;
    } finally {
      activeConnectionTest = null;
    }
  })();

  return activeConnectionTest;
}

if (typeof window !== 'undefined') {
  window.setTimeout(() => {
    void testConnection();
  }, 0);
}
