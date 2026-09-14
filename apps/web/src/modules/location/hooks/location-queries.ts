import { useQuery } from '@tanstack/react-query';
import {
  locationServiceListLocationsByCompany,
  locationServiceGetSlotLocationAssignments,
} from '@repo/client';

export const locationKeys = {
  all: ['LOCATIONS'] as const,
  company: (companyId: string) => ['LOCATIONS', companyId] as const,
  assignments: (companyId: string, slotId: string) =>
    ['LOCATIONS', companyId, 'SLOT', slotId] as const,
};

export function useCompanyLocations(companyId: string) {
  return useQuery({
    queryKey: locationKeys.company(companyId),
    enabled: Boolean(companyId),
    queryFn: async ({ signal }) => {
      const response = await locationServiceListLocationsByCompany({
        query: { companyId },
        signal,
        throwOnError: true,
      });
      return response.data.data;
    },
  });
}

export function useSlotLocationAssignments(companyId: string, slotId: string) {
  return useQuery({
    queryKey: locationKeys.assignments(companyId, slotId),
    enabled: Boolean(companyId && slotId),
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
