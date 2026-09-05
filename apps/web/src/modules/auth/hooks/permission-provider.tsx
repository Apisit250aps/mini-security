'use client';

import React, { useCallback, useMemo } from 'react';
import { useSession } from './session-provider';

type PermissionProviderProps = {
  children: React.ReactNode;
  permissions?: string;
};

export type PermissionContext = {
  actions: string[];
  getActions: () => string[];
  hasPermission: (action: string) => boolean;
  isSuperAdmin: boolean;
};

const permissionContext = React.createContext<PermissionContext | null>(null);

export function PermissionProvider({
  children,
  permissions = '',
}: PermissionProviderProps) {
  const { data } = useSession();
  const isSuperAdmin = Boolean((data?.user as { isAdmin?: boolean })?.isAdmin);
  const actions = useMemo(
    () =>
      permissions
        .split(',')
        .map((action) => action.trim())
        .filter(Boolean),
    [permissions],
  );
  const actionSet = useMemo(() => new Set(actions), [actions]);
  const getActions = useCallback(() => actions, [actions]);
  const hasPermission = useCallback(
    (action: string): boolean => {
      if (isSuperAdmin || actionSet.has('*') || actionSet.has(action)) {
        return true;
      }

      const modulePrefix = action.split(':')[0];
      return actionSet.has(`${modulePrefix}:*`);
    },
    [actionSet, isSuperAdmin],
  );

  const value = useMemo(
    () => ({ actions, getActions, hasPermission, isSuperAdmin }),
    [actions, getActions, hasPermission, isSuperAdmin],
  );

  return (
    <permissionContext.Provider value={value}>
      {children}
    </permissionContext.Provider>
  );
}

export function usePermission() {
  const context = React.useContext(permissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}

export const useHasPermission = (action: string): boolean => {
  const { hasPermission } = usePermission();
  return hasPermission(action);
};
