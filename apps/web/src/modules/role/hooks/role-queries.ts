import {
  roleServicesGetSystemDefaultRoles,
  roleServicesGetRole,
  roleServicesGetRolePermissions,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { roleKeys } from '@/shared/utils';

function useRoleListQueries() {
  const query = useQuery({
    queryKey: roleKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await roleServicesGetSystemDefaultRoles({ signal });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from roleServicesGetSystemDefaultRoles',
      );
    },
  });
  return query;
}

function useRoleDetailQueries(roleId: string) {
  const query = useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: async ({ signal }) => {
      const response = await roleServicesGetRole({
        signal,
        path: { id: roleId },
      });
      if (response.data) return response.data.data;
      throw new Error('No data returned from roleServicesGetRole');
    },
    enabled: Boolean(roleId),
  });
  return query;
}

function useRolePermissionsQueries(roleId: string) {
  const query = useQuery({
    queryKey: [...roleKeys.detail(roleId), 'permissions'] as const,
    queryFn: async ({ signal }) => {
      const response = await roleServicesGetRolePermissions({
        signal,
        path: { roleId },
      });
      if (response.data) return response.data.data;
      throw new Error('No data returned from roleServicesGetRolePermissions');
    },
    enabled: Boolean(roleId),
  });
  return query;
}

export { useRoleListQueries, useRoleDetailQueries, useRolePermissionsQueries };
