import {
  roleServicesGetOrganizationRoles,
  roleServicesGetSystemDefaultRoles,
  roleServicesGetRole,
  roleServicesGetRolePermissions,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { roleKeys } from '@/shared/utils';

export function useRoleListQueries() {
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

export function useGetOrganizationRoles(organizationId: string) {
  const query = useQuery({
    queryKey: roleKeys.organization(organizationId),
    queryFn: async ({ signal }) => {
      const response = await roleServicesGetOrganizationRoles({
        signal,
        path: { organizationId },
      });
      if (response.data) return response.data.data;
      throw new Error('No data returned from roleServicesGetOrganizationRoles');
    },
    enabled: Boolean(organizationId),
  });
  return query;
}

export function useRoleDetailQueries(roleId: string) {
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

export function useRolePermissionsQueries(roleId: string) {
  const query = useQuery({
    queryKey: roleKeys.permissions(roleId),
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
