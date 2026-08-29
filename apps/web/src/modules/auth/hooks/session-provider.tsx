'use client';

import React, { useMemo } from 'react';
import { createAuthClient, jwtClient } from '@repo/infrastructures/auth/client';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [jwtClient()],
});

const { signIn, signUp, useSession: useAuthSession, signOut } = authClient;

type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading';

type SessionContextProps = {
  signIn: typeof signIn;
  signUp: typeof signUp;
  signOut: typeof signOut;
  data: ReturnType<typeof useAuthSession>['data'];
  status: SessionStatus;
  getToken: () => Promise<string | null>;
};

const sessionContext = React.createContext<SessionContextProps | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const query = useAuthSession();

  const { status, data } = useMemo<
    Pick<SessionContextProps, 'status' | 'data'>
  >(() => {
    if (query.isPending) {
      return { status: 'loading', data: null };
    }
    if (query.data) {
      return { status: 'authenticated', data: query.data };
    }
    return { status: 'unauthenticated', data: null };
  }, [query.isPending, query.data]);

  const getToken = React.useCallback(async (): Promise<string | null> => {
    try {
      const res = await authClient.$fetch<{ token: string }>('/api/auth/token');
      return res.data?.token ?? null;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({ signIn, signUp, signOut, data, status, getToken }),
    [data, status, getToken],
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
