import {
  leaveServicesGetCompanyRequests,
  leaveServicesGetMemberRequests,
  leaveServicesGetQuotasByMember,
  leaveServicesGetTypesByCompany,
} from '@repo/client';
import type { LeaveRequestStatus } from '@repo/domains/schema/leave';
import { useQuery } from '@tanstack/react-query';
import { leaveKeys } from '@/shared/utils';

export function useCompanyLeaveTypesQueries(
  companyId: string,
  onlyActive?: boolean,
) {
  return useQuery({
    queryKey: leaveKeys.types(companyId, onlyActive),
    queryFn: async ({ signal }) => {
      const response = await leaveServicesGetTypesByCompany({
        signal,
        path: { companyId },
        query: onlyActive !== undefined ? { onlyActive } : undefined,
      });
      return response.data?.data || [];
    },
    enabled: Boolean(companyId),
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

export function useCompanyLeaveRequestsQueries(
  companyId: string,
  filters?: {
    status?: LeaveRequestStatus;
    startDate?: string;
    endDate?: string;
  },
) {
  return useQuery({
    queryKey: leaveKeys.companyRequests(companyId, filters?.status),
    queryFn: async ({ signal }) => {
      const response = await leaveServicesGetCompanyRequests({
        signal,
        path: { companyId },
        query: filters,
      });
      return response.data?.data || [];
    },
    enabled: Boolean(companyId),
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
