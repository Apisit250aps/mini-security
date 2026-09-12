import {
  attendanceServicesGetCompanyLogs,
  attendanceServicesGetMemberLogs,
  attendanceServicesGetSchedulesByRole,
  attendanceServicesGetSchedulesByCompany,
  attendanceServicesGetSlotsBySchedule,
} from '@repo/client';
import type { CheckInSchedule } from '@repo/client';
import { useQueries, useQuery } from '@tanstack/react-query';
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

export function useRoleSchedulesQueries(companyId: string, roleId?: string) {
  return useQuery({
    queryKey: roleId
      ? attendanceKeys.scheduleByRole(companyId, roleId)
      : ['ATTENDANCE', 'SCHEDULE', 'ROLE', 'NONE'],
    queryFn: async ({ signal }) => {
      if (!roleId) return [];
      const response = await attendanceServicesGetSchedulesByRole({
        signal,
        path: { companyId, roleId },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(companyId && roleId),
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

/** Load each assigned schedule's slots concurrently through their existing cache keys. */
export function useAssignedScheduleSlotsQueries(schedules: CheckInSchedule[]) {
  const queries = useQueries({
    queries: schedules.map((schedule) => ({
      queryKey: attendanceKeys.slots(schedule.id),
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const response = await attendanceServicesGetSlotsBySchedule({
          signal,
          path: { scheduleId: schedule.id },
        });
        return response.data?.data ?? [];
      },
    })),
  });
  return {
    data: queries.flatMap((query, index) =>
      (query.data ?? []).map((slot) => ({
        ...slot,
        scheduleName: schedules[index]!.name,
      })),
    ),
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
  };
}
