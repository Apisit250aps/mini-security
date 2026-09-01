import {
  permissionServicesGetMyPermissions,
  permissionServicesGetPermissions,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { permissionKeys } from '@/shared/utils';

function usePermissionListQueries() {
  const query = useQuery({
    queryKey: permissionKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await permissionServicesGetPermissions({ signal });
      if (response.data) return response.data.data;
      throw new Error('No data returned from permissionServicesGetPermissions');
    },
  });
  return query;
}

function useMyPermissionsQueries(companyId?: string, enabled = true) {
  const query = useQuery({
    queryKey: permissionKeys.my(companyId),
    queryFn: async ({ signal }) => {
      const response = await permissionServicesGetMyPermissions({
        signal,
        query: companyId ? { companyId } : undefined,
      });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from permissionServicesGetMyPermissions',
      );
    },
    enabled,
  });
  return query;
}

export { usePermissionListQueries, useMyPermissionsQueries };
