import { useQuery } from '@tanstack/react-query';
import {
  locationServiceListLocationsByOrganization,
  locationServiceListLocationsBySite,
  locationServiceGetSlotLocationAssignments,
  locationServiceGetSlotLocations,
} from '@repo/client';
import { locationKeys } from '@/shared/utils/query';

export { locationKeys };

export function useListLocationsByOrganization(organizationId: string) {
  return useQuery({
    queryKey: locationKeys.organization(organizationId),
    enabled: Boolean(organizationId),
    queryFn: async ({ signal }) => {
      const response = await locationServiceListLocationsByOrganization({
        query: { organizationId },
        signal,
        throwOnError: true,
      });
      return response.data.data;
    },
  });
}

export function useListLocationsBySite(siteId: string) {
  return useQuery({
    queryKey: locationKeys.site(siteId),
    enabled: Boolean(siteId),
    queryFn: async ({ signal }) => {
      const response = await locationServiceListLocationsBySite({
        path: { siteId },
        signal,
        throwOnError: true,
      });
      return response.data.data;
    },
  });
}

export function useSlotLocationAssignments(
  organizationId: string,
  slotId: string,
) {
  return useQuery({
    queryKey: locationKeys.assignments(organizationId, slotId),
    enabled: Boolean(organizationId && slotId),
    queryFn: async ({ signal }) => {
      const response = await locationServiceGetSlotLocationAssignments({
        path: { slotId },
        signal,
        throwOnError: true,
      });
      return response.data.data;
    },
  });
}

export function useSlotLocations(slotId: string) {
  return useQuery({
    queryKey: ['LOCATIONS', 'SLOT', slotId],
    enabled: Boolean(slotId),
    queryFn: async ({ signal }) => {
      const response = await locationServiceGetSlotLocations({
        path: { slotId },
        signal,
        throwOnError: true,
      });
      return response.data.data;
    },
  });
}
