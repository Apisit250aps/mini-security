import {
  featureServicesGetOrganizationAvailableFeatures,
  featureServicesGetOrganizationFeatures,
  featureServicesGetOrganizationRoleFeatures,
  featureServicesGetFeatures,
  featureServicesGetRoleFeatures,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { featureKeys } from '@/shared/utils';

export function useFeatureListQueries(options?: {
  category?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: featureKeys.list(options),
    queryFn: async ({ signal }) => {
      const response = await featureServicesGetFeatures({
        signal,
        query: options,
      });
      if (response.data) return response.data.data;
      throw new Error('No data returned from featureServicesGetFeatures');
    },
  });
}

export function useOrganizationFeaturesQueries(
  organizationId: string,
  onlyEnabled?: boolean,
) {
  return useQuery({
    queryKey: [...featureKeys.organization(organizationId), { onlyEnabled }],
    queryFn: async ({ signal }) => {
      const response = await featureServicesGetOrganizationFeatures({
        signal,
        path: { organizationId },
        query: { onlyEnabled },
      });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from featureServicesGetOrganizationFeatures',
      );
    },
    enabled: Boolean(organizationId),
  });
}

export function useOrganizationAvailableFeaturesQueries(
  organizationId: string,
) {
  return useQuery({
    queryKey: featureKeys.organizationAvailable(organizationId),
    queryFn: async ({ signal }) => {
      const response = await featureServicesGetOrganizationAvailableFeatures({
        signal,
        path: { organizationId },
      });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from featureServicesGetOrganizationAvailableFeatures',
      );
    },
    enabled: Boolean(organizationId),
  });
}

export function useRoleFeaturesQueries(roleId: string) {
  return useQuery({
    queryKey: featureKeys.role(roleId),
    queryFn: async ({ signal }) => {
      const response = await featureServicesGetRoleFeatures({
        signal,
        path: { roleId },
      });
      if (response.data) return response.data.data;
      throw new Error('No data returned from featureServicesGetRoleFeatures');
    },
    enabled: Boolean(roleId),
  });
}

export function useOrganizationRoleFeaturesQueries(organizationId: string) {
  return useQuery({
    queryKey: featureKeys.organizationRoles(organizationId),
    queryFn: async ({ signal }) => {
      const response = await featureServicesGetOrganizationRoleFeatures({
        signal,
        path: { organizationId },
      });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from featureServicesGetOrganizationRoleFeatures',
      );
    },
    enabled: Boolean(organizationId),
  });
}
