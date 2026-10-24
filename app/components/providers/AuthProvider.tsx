'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from 'firebase/auth';
import {
  getIdToken,
  signInWithEmail,
  signInWithGoogle,
  signOut as authSignOut,
  signUpWithEmail,
  subscribeToAuthState,
} from '@/app/lib/firebase-auth';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  idToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function bootstrapProfile(idToken: string) {
  const response = await fetch('/api/profile/bootstrap', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? 'Failed to bootstrap profile.');
  }

  return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshToken = useCallback(async () => {
    if (!user) {
      setIdToken(null);
      return null;
    }

    const token = await getIdToken(user);
    setIdToken(token);
    return token;
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        try {
          const token = await getIdToken(nextUser);
          setIdToken(token);
          await bootstrapProfile(token);
        } catch (error) {
          console.error('[AuthProvider] bootstrap failed:', error);
        }
      } else {
        setIdToken(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmail(email, password);
    const token = await getIdToken(credential.user);
    setIdToken(token);
    await bootstrapProfile(token);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const credential = await signUpWithEmail(email, password);
    const token = await getIdToken(credential.user);
    setIdToken(token);
    await bootstrapProfile(token);
  }, []);

  const signInGoogle = useCallback(async () => {
    const credential = await signInWithGoogle();
    const token = await getIdToken(credential.user);
    setIdToken(token);
    await bootstrapProfile(token);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setIdToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      idToken,
      signIn,
      signUp,
      signInGoogle,
      signOut,
      refreshToken,
    }),
    [user, loading, idToken, signIn, signUp, signInGoogle, signOut, refreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
