'use client';

import React from 'react';
import type { Session } from '@repo/infrastructures/types/auth';
export type { Session };
import { createAuthClient, jwtClient } from '@repo/infrastructures/auth/client';

const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [jwtClient()],
});

const { signIn, signUp, signOut } = authClient;

export type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading';
export type SessionContext = {
  signIn: typeof signIn;
  signUp: typeof signUp;
  signOut: typeof signOut;
  data: Session;
  status: SessionStatus;
};

const sessionContext = React.createContext<SessionContext | null>(null);

export function SessionProvider({
  children,
  session = null,
}: {
  children: React.ReactNode;
  session?: Session;
}) {
  const data = session;
  const status: SessionStatus = session ? 'authenticated' : 'unauthenticated';
  const value: SessionContext = { signIn, signUp, signOut, data, status };

  return (
    <sessionContext.Provider value={value}>{children}</sessionContext.Provider>
  );
}

export const useSession = () => {
  const context = React.useContext(sessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
