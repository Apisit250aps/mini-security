import {
  featureServicesGetCompanyAvailableFeatures,
  featureServicesGetCompanyFeatures,
  featureServicesGetCompanyRoleFeatures,
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

export function useCompanyFeaturesQueries(
  companyId: string,
  onlyEnabled?: boolean,
) {
  return useQuery({
    queryKey: [...featureKeys.company(companyId), { onlyEnabled }],
    queryFn: async ({ signal }) => {
      const response = await featureServicesGetCompanyFeatures({
        signal,
        path: { companyId },
        query: { onlyEnabled },
      });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from featureServicesGetCompanyFeatures',
      );
    },
    enabled: Boolean(companyId),
  });
}

export function useCompanyAvailableFeaturesQueries(companyId: string) {
  return useQuery({
    queryKey: featureKeys.companyAvailable(companyId),
    queryFn: async ({ signal }) => {
      const response = await featureServicesGetCompanyAvailableFeatures({
        signal,
        path: { companyId },
      });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from featureServicesGetCompanyAvailableFeatures',
      );
    },
    enabled: Boolean(companyId),
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

export function useCompanyRoleFeaturesQueries(companyId: string) {
  return useQuery({
    queryKey: featureKeys.companyRoles(companyId),
    queryFn: async ({ signal }) => {
      const response = await featureServicesGetCompanyRoleFeatures({
        signal,
        path: { companyId },
      });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from featureServicesGetCompanyRoleFeatures',
      );
    },
    enabled: Boolean(companyId),
  });
}
