'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Permission, Role } from '@repo/domains/entities';

import {
  useRoleAssignPermission,
  useRoleRevokePermission,
} from '../hooks/role-mutations';
import { useRolePermissionsQueries } from '../hooks/role-queries';
import { usePermissionListQueries } from '@/modules/permission/hooks/permission-queries';

interface RolePermissionContextValue {
  role: Role;
  allPermissions: Permission[];
  assignedPermissions: Permission[];
  assignedPermissionIds: Set<string>;
  groupedPermissions: Record<string, Permission[]>;
  isLoading: boolean;
  mutatingPermissionId: string | null;
  isMutatingModule: string | null;
  isAssigned: (permissionId: string) => boolean;
  isModuleAllSelected: (moduleName: string) => boolean;
  togglePermission: (permissionId: string) => Promise<void>;
  toggleModuleAll: (moduleName: string, selectAll: boolean) => Promise<void>;
}

const RolePermissionContext = createContext<RolePermissionContextValue | null>(
  null,
);

export function RolePermissionProvider({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const [mutatingPermissionId, setMutatingPermissionId] = useState<
    string | null
  >(null);
  const [isMutatingModule, setIsMutatingModule] = useState<string | null>(null);

  const permissionsQuery = usePermissionListQueries();
  const rolePermissionsQuery = useRolePermissionsQueries(role.id);

  const assignMutation = useRoleAssignPermission();
  const revokeMutation = useRoleRevokePermission();

  const allPermissions = useMemo<Permission[]>(
    () => permissionsQuery.data || [],
    [permissionsQuery.data],
  );

  const assignedPermissions = useMemo<Permission[]>(
    () => rolePermissionsQuery.data || [],
    [rolePermissionsQuery.data],
  );

  const assignedPermissionIds = useMemo(
    () => new Set(assignedPermissions.map((p) => p.id)),
    [assignedPermissions],
  );

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const perm of allPermissions) {
      const moduleKey = perm.module || 'other';
      if (!groups[moduleKey]) {
        groups[moduleKey] = [];
      }
      groups[moduleKey].push(perm);
    }
    return groups;
  }, [allPermissions]);

  const isAssigned = useCallback(
    (permissionId: string) => assignedPermissionIds.has(permissionId),
    [assignedPermissionIds],
  );

  const isModuleAllSelected = useCallback(
    (moduleName: string) => {
      const perms = groupedPermissions[moduleName] || [];
      if (perms.length === 0) return false;
      return perms.every((p) => assignedPermissionIds.has(p.id));
    },
    [groupedPermissions, assignedPermissionIds],
  );

  const togglePermission = useCallback(
    async (permissionId: string) => {
      setMutatingPermissionId(permissionId);
      try {
        if (assignedPermissionIds.has(permissionId)) {
          await revokeMutation.mutateAsync({
            roleId: role.id,
            permissionId,
          });
        } else {
          await assignMutation.mutateAsync({
            roleId: role.id,
            permissionId,
          });
        }
      } finally {
        setMutatingPermissionId(null);
      }
    },
    [assignedPermissionIds, assignMutation, revokeMutation, role.id],
  );

  const toggleModuleAll = useCallback(
    async (moduleName: string, selectAll: boolean) => {
      const perms = groupedPermissions[moduleName] || [];
      if (perms.length === 0) return;

      setIsMutatingModule(moduleName);
      try {
        if (selectAll) {
          const toAssign = perms.filter(
            (p) => !assignedPermissionIds.has(p.id),
          );
          for (const p of toAssign) {
            await assignMutation.mutateAsync({
              roleId: role.id,
              permissionId: p.id,
            });
          }
        } else {
          const toRevoke = perms.filter((p) => assignedPermissionIds.has(p.id));
          for (const p of toRevoke) {
            await revokeMutation.mutateAsync({
              roleId: role.id,
              permissionId: p.id,
            });
          }
        }
      } finally {
        setIsMutatingModule(null);
      }
    },
    [
      groupedPermissions,
      assignedPermissionIds,
      assignMutation,
      revokeMutation,
      role.id,
    ],
  );

  const isLoading =
    permissionsQuery.isLoading || rolePermissionsQuery.isLoading;

  const value = useMemo<RolePermissionContextValue>(
    () => ({
      role,
      allPermissions,
      assignedPermissions,
      assignedPermissionIds,
      groupedPermissions,
      isLoading,
      mutatingPermissionId,
      isMutatingModule,
      isAssigned,
      isModuleAllSelected,
      togglePermission,
      toggleModuleAll,
    }),
    [
      role,
      allPermissions,
      assignedPermissions,
      assignedPermissionIds,
      groupedPermissions,
      isLoading,
      mutatingPermissionId,
      isMutatingModule,
      isAssigned,
      isModuleAllSelected,
      togglePermission,
      toggleModuleAll,
    ],
  );

  return (
    <RolePermissionContext.Provider value={value}>
      {children}
    </RolePermissionContext.Provider>
  );
}

export function useRolePermissionContext() {
  const context = useContext(RolePermissionContext);
  if (!context) {
    throw new Error(
      'useRolePermissionContext must be used within a RolePermissionProvider',
    );
  }
  return context;
}
