'use client';

import React, { useMemo } from 'react';
import { createAuthClient } from 'better-auth/react';
import { Session, User } from 'better-auth';

const {
  signIn,
  signUp,
  useSession: useAuthSession,
  signOut,
} = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
});

type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading';

type SessionContextProps = {
  signIn: typeof signIn;
  signUp: typeof signUp;
  signOut: typeof signOut;
  data: ReturnType<typeof useAuthSession['data']>;
  status: SessionStatus;
};

const sessionContext = React.createContext<SessionContextProps | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const query = useAuthSession();

  const { status, data } = useMemo(() => {
    if (query.isPending) {
      return { status: 'loading', data: null };
    }
    if (query.data) {
      return { status: 'authenticated', data: query.data };
    }
    return { status: 'unauthenticated', data: null };
  }, [query.isPending, query.data]);

  const value = useMemo(
    () => ({ signIn, signUp, signOut, data, status }),
    [data, status],
  );
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
