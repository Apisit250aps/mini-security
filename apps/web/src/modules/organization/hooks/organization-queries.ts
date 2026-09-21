import {
  organizationServicesGetOrganizations,
  organizationServicesGetOrganization,
  organizationServicesGetOrganizationMembers,
  organizationServicesGetSites,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { organizationKeys } from '@/shared/utils';

export function useOrganizationListQueries() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await organizationServicesGetOrganizations({ signal });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from organizationServicesGetOrganizations',
      );
    },
  });
}

export function useOrganizationDetailQueries(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: async ({ signal }) => {
      const response = await organizationServicesGetOrganization({
        signal,
        path: { id: organizationId },
      });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from organizationServicesGetOrganization',
      );
    },
  });
}

export function useOrganizationMembersQueries(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.members(organizationId),
    queryFn: async ({ signal }) => {
      const response = await organizationServicesGetOrganizationMembers({
        signal,
        path: { organizationId },
      });
      if (response.data) return response.data.data;
      throw new Error(
        'No data returned from organizationServicesGetOrganizationMembers',
      );
    },
    enabled: Boolean(organizationId),
  });
}

export function useSitesQueries(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.sites(organizationId),
    queryFn: async ({ signal }) => {
      const response = await organizationServicesGetSites({
        signal,
        path: { organizationId },
      });
      if (response.data) return response.data.data;
      throw new Error('No data returned from organizationServicesGetSites');
    },
    enabled: Boolean(organizationId),
  });
}

export const useOrganizationsQuery = useOrganizationListQueries;
export const useOrganizationQuery = useOrganizationDetailQueries;
export const useOrganizationMembersQuery = useOrganizationMembersQueries;
export const useSitesQuery = useSitesQueries;
export const useOrganizationSitesQueries = useSitesQueries;
