import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import type { Auth, GoogleAuthProvider, User } from 'firebase/auth';
import { loadFirebaseAuth } from '../lib/firebase';
import { isConfiguredOwner, isPlaceholderEmailConfigured, OWNER_EMAIL_ALLOWLIST } from '../lib/adminConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isOwner: boolean;
  isPlaceholderConfigured: boolean;
  configuredOwnerEmail: string;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Firebase Auth is a separate chunk. Detail and admin routes need the owner
  // state to decide draft visibility, so they load it at once. Other public
  // routes load it when the browser is idle, after first paint.
  const authRef = useRef<{ auth: Auth; googleProvider: GoogleAuthProvider } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const start = async () => {
      try {
        const loaded = await loadFirebaseAuth();
        if (cancelled) return;
        authRef.current = loaded;
        const { onAuthStateChanged } = await import('firebase/auth');
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(
          loaded.auth,
          (currentUser) => {
            setUser(currentUser);
            setLoading(false);
          },
          (err) => {
            console.error('Auth state change error:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Firebase Auth failed to load:', err);
        if (!cancelled) setLoading(false);
      }
    };

    const path = window.location.pathname;
    const needsAuthNow = path.startsWith('/admin') || /^\/(projects|notes)\/.+/.test(path);
    if (needsAuthNow) {
      void start();
    } else if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => void start(), { timeout: 1500 });
    } else {
      timeoutId = setTimeout(() => void start(), 1000);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId);
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const loaded = authRef.current ?? (await loadFirebaseAuth());
      if (!loaded.auth || !loaded.auth.app) {
        throw new Error('Firebase Authentication is not configured or unavailable.');
      }
      const { signInWithPopup } = await import('firebase/auth');
      await signInWithPopup(loaded.auth, loaded.googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Google Sign-In failed:', err);
      setError(msg);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      const loaded = authRef.current ?? (await loadFirebaseAuth());
      if (loaded.auth && loaded.auth.app) {
        const { signOut: fbSignOut } = await import('firebase/auth');
        await fbSignOut(loaded.auth);
      }
      setUser(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Sign out error:', err);
      setError(msg);
    }
  };

  const clearError = () => setError(null);

  const isOwner = Boolean(user && isConfiguredOwner(user.email, user.emailVerified));
  const isPlaceholderConfigured = isPlaceholderEmailConfigured();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOwner,
        isPlaceholderConfigured,
        configuredOwnerEmail: OWNER_EMAIL_ALLOWLIST,
        error,
        signInWithGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
