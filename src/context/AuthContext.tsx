import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
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

  useEffect(() => {
    if (!auth || !auth.onAuthStateChanged) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
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

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      if (!auth || !auth.app) {
        throw new Error('Firebase Authentication is not configured or unavailable.');
      }
      await signInWithPopup(auth, googleProvider);
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
      if (auth && auth.app) {
        await fbSignOut(auth);
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
