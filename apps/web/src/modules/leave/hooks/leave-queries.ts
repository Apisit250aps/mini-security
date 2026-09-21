import {
  leaveServicesGetOrganizationRequests,
  leaveServicesGetMemberRequests,
  leaveServicesGetQuotasByMember,
  leaveServicesGetTypesByOrganization,
} from '@repo/client';
import type { LeaveRequestStatus } from '@repo/domains/schema/leave';
import { useQuery } from '@tanstack/react-query';
import { leaveKeys } from '@/shared/utils';

export function useOrganizationLeaveTypesQueries(
  organizationId: string,
  onlyActive?: boolean,
) {
  return useQuery({
    queryKey: leaveKeys.types(organizationId, onlyActive),
    queryFn: async ({ signal }) => {
      const response = await leaveServicesGetTypesByOrganization({
        signal,
        path: { organizationId },
        query: onlyActive !== undefined ? { onlyActive } : undefined,
      });
      return response.data?.data || [];
    },
    enabled: Boolean(organizationId),
  });
}

export function useMemberLeaveQuotasQueries(
  memberId?: string,
  year: number = new Date().getFullYear(),
) {
  return useQuery({
    queryKey: memberId
      ? leaveKeys.quotas(memberId, year)
      : ['LEAVE', 'QUOTAS', 'NONE'],
    queryFn: async ({ signal }) => {
      if (!memberId) return [];
      const response = await leaveServicesGetQuotasByMember({
        signal,
        path: { memberId, year },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(memberId),
  });
}

export function useOrganizationLeaveRequestsQueries(
  organizationId: string,
  filters?: {
    status?: LeaveRequestStatus;
    startDate?: string;
    endDate?: string;
  },
) {
  return useQuery({
    queryKey: leaveKeys.organizationRequests(organizationId, filters),
    queryFn: async ({ signal }) => {
      const response = await leaveServicesGetOrganizationRequests({
        signal,
        path: { organizationId },
        query: filters,
      });
      return response.data?.data || [];
    },
    enabled: Boolean(organizationId),
  });
}

export function useMemberLeaveRequestsQueries(memberId?: string) {
  return useQuery({
    queryKey: memberId
      ? leaveKeys.memberRequests(memberId)
      : ['LEAVE', 'REQUESTS', 'MEMBER', 'NONE'],
    queryFn: async ({ signal }) => {
      if (!memberId) return [];
      const response = await leaveServicesGetMemberRequests({
        signal,
        path: { memberId },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(memberId),
  });
}
