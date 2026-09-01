'use client';

import React, { useCallback, useMemo } from 'react';
import { createAuthClient, jwtClient } from '@repo/infrastructures/auth/client';
import type auth from '@repo/infrastructures/auth';
import type { Permission } from '@repo/domains/entities';

const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [jwtClient()],
});

const { signIn, signUp, signOut } = authClient;

export type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading';
export type Session = typeof auth.$Infer.Session | null;

export type SessionContext = {
  signIn: typeof signIn;
  signUp: typeof signUp;
  signOut: typeof signOut;
  data: Session;
  status: SessionStatus;
  permissions: Permission[];
  hasPermission: (action: string) => boolean;
  isSuperAdmin: boolean;
};

const sessionContext = React.createContext<SessionContext | null>(null);

export function SessionProvider({
  children,
  session = null,
  permissions = [],
}: {
  children: React.ReactNode;
  session?: Session;
  permissions: Permission[];
}) {
  const data = session;
  const status: SessionStatus = session ? 'authenticated' : 'unauthenticated';
  const isSuperAdmin = Boolean((data?.user as { isAdmin?: boolean })?.isAdmin);
  const permissionActionsSet = useMemo(() => {
    return new Set(permissions.map((p) => p.action));
  }, [permissions]);

  const hasPermission = useCallback(
    (action: string): boolean => {
      if (isSuperAdmin) return true;
      if (permissionActionsSet.has('*')) return true;
      if (permissionActionsSet.has(action)) return true;

      const modulePrefix = action.split(':')[0];
      if (permissionActionsSet.has(`${modulePrefix}:*`)) return true;

      return false;
    },
    [isSuperAdmin, permissionActionsSet],
  );
  const value = useMemo<SessionContext>(
    () => ({
      signIn,
      signUp,
      signOut,
      data,
      status,
      permissions,
      hasPermission,
      isSuperAdmin,
    }),
    [data, status, permissions, hasPermission, isSuperAdmin],
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

export const useHasPermission = (action: string): boolean => {
  const { hasPermission } = useSession();
  return hasPermission(action);
};
