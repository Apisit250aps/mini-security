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
  hasAnyPermission: (permissions?: string | string[]) => boolean;
  hasAllPermissions: (permissions?: string | string[]) => boolean;
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

      const [targetModule, targetAction] = action.split(':');

      // Case 1: Target action is a wildcard pattern like '*:read'
      if (targetModule === '*' && targetAction) {
        if (actionSet.has(`*:${targetAction}`)) return true;
        for (const act of actionSet) {
          if (act.endsWith(`:${targetAction}`) || act === '*') return true;
        }
        return false;
      }

      // Case 2: Target action is a wildcard pattern like 'attendance:*'
      if (targetAction === '*' && targetModule) {
        if (actionSet.has(`${targetModule}:*`)) return true;
        for (const act of actionSet) {
          if (act.startsWith(`${targetModule}:`) || act === '*') return true;
        }
        return false;
      }

      // Case 3: User has module wildcard e.g. 'attendance:*'
      if (targetModule && actionSet.has(`${targetModule}:*`)) {
        return true;
      }

      // Case 4: User has action wildcard e.g. '*:read'
      if (targetAction && actionSet.has(`*:${targetAction}`)) {
        return true;
      }

      return false;
    },
    [actionSet, isSuperAdmin],
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions?: string | string[]): boolean => {
      if (!requiredPermissions) return true;
      if (Array.isArray(requiredPermissions)) {
        if (requiredPermissions.length === 0) return true;
        return requiredPermissions.some((p) => hasPermission(p));
      }
      return hasPermission(requiredPermissions);
    },
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions?: string | string[]): boolean => {
      if (!requiredPermissions) return true;
      if (Array.isArray(requiredPermissions)) {
        if (requiredPermissions.length === 0) return true;
        return requiredPermissions.every((p) => hasPermission(p));
      }
      return hasPermission(requiredPermissions);
    },
    [hasPermission],
  );

  const value = useMemo(
    () => ({
      actions,
      getActions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      isSuperAdmin,
    }),
    [
      actions,
      getActions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      isSuperAdmin,
    ],
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

export const useHasAnyPermission = (
  permissions?: string | string[],
): boolean => {
  const { hasAnyPermission } = usePermission();
  return hasAnyPermission(permissions);
};

export const useHasAllPermissions = (
  permissions?: string | string[],
): boolean => {
  const { hasAllPermissions } = usePermission();
  return hasAllPermissions(permissions);
};
