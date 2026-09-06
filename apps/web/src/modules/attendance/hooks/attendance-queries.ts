import {
  attendanceServicesGetCompanyLogs,
  attendanceServicesGetMemberLogs,
  attendanceServicesGetScheduleByRole,
  attendanceServicesGetSchedulesByCompany,
  attendanceServicesGetSlotsBySchedule,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { attendanceKeys } from '@/shared/utils';

export function useCompanySchedulesQueries(companyId: string) {
  return useQuery({
    queryKey: attendanceKeys.schedules(companyId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetSchedulesByCompany({
        signal,
        path: { companyId },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(companyId),
  });
}

export function useRoleScheduleQueries(roleId?: string) {
  return useQuery({
    queryKey: roleId
      ? attendanceKeys.scheduleByRole(roleId)
      : ['ATTENDANCE', 'SCHEDULE', 'ROLE', 'NONE'],
    queryFn: async ({ signal }) => {
      if (!roleId) return null;
      const response = await attendanceServicesGetScheduleByRole({
        signal,
        path: { roleId },
      });
      return response.data?.data || null;
    },
    enabled: Boolean(roleId),
  });
}

export function useScheduleSlotsQueries(scheduleId?: string) {
  return useQuery({
    queryKey: scheduleId
      ? attendanceKeys.slots(scheduleId)
      : ['ATTENDANCE', 'SLOTS', 'NONE'],
    queryFn: async ({ signal }) => {
      if (!scheduleId) return [];
      const response = await attendanceServicesGetSlotsBySchedule({
        signal,
        path: { scheduleId },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(scheduleId),
  });
}

export function useMemberAttendanceLogsQueries(
  memberId?: string,
  filters?: { workDate?: string; startDate?: string; endDate?: string },
) {
  return useQuery({
    queryKey: memberId
      ? attendanceKeys.memberLogs(memberId, filters)
      : ['ATTENDANCE', 'LOGS', 'MEMBER', 'NONE'],
    queryFn: async ({ signal }) => {
      if (!memberId) return [];
      const response = await attendanceServicesGetMemberLogs({
        signal,
        path: { memberId },
        query: filters,
      });
      return response.data?.data || [];
    },
    enabled: Boolean(memberId),
  });
}

export function useCompanyAttendanceLogsQueries(
  companyId: string,
  filters: { startDate: string; endDate: string },
) {
  return useQuery({
    queryKey: attendanceKeys.companyLogs(companyId, filters),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetCompanyLogs({
        signal,
        path: { companyId },
        query: filters,
      });
      return response.data?.data || [];
    },
    enabled: Boolean(companyId && filters.startDate && filters.endDate),
  });
}
