import {
  attendanceServicesGetAttendanceCheckpoint,
  attendanceServicesGetAttendanceCheckpoints,
  attendanceServicesGetAttendanceLocation,
  attendanceServicesGetAttendanceLocations,
  attendanceServicesGetAttendanceLog,
  attendanceServicesGetAttendanceLogsByRecord,
  attendanceServicesGetAttendancePolicies,
  attendanceServicesGetAttendancePolicy,
  attendanceServicesGetAttendanceRecord,
  attendanceServicesGetAttendanceRecords,
  attendanceServicesGetCheckpointLocations,
  attendanceServicesGetCurrentRoleWorkSchedule,
  attendanceServicesGetLeaveRequest,
  attendanceServicesGetLeaveRequests,
  attendanceServicesGetMemberAttendanceRecordByDate,
  attendanceServicesGetRoleAttendancePolicies,
  attendanceServicesGetRoleWorkSchedulesByCompany,
  attendanceServicesGetWorkSchedule,
  attendanceServicesGetWorkSchedules,
  attendanceServicesGetCompanyWorkShifts,
  attendanceServicesGetWorkShift,
  attendanceServicesGetWorkShifts,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { attendanceKeys } from '@/shared/utils';

// ─── Work Schedules & Shifts ──────────────────────────────────────────────────
export function useWorkSchedulesQueries(companyId: string) {
  return useQuery({
    queryKey: attendanceKeys.schedules(companyId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetWorkSchedules({
        path: { companyId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch work schedules');
    },
    enabled: Boolean(companyId),
  });
}

export function useCompanyWorkShiftsQueries(companyId: string) {
  return useQuery({
    queryKey: attendanceKeys.companyShifts(companyId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetCompanyWorkShifts({
        path: { companyId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch company work shifts');
    },
    enabled: Boolean(companyId),
  });
}

export function useWorkScheduleDetailQueries(id: string) {
  return useQuery({
    queryKey: attendanceKeys.scheduleDetail(id),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetWorkSchedule({
        path: { id },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch work schedule detail');
    },
    enabled: Boolean(id),
  });
}

export function useWorkShiftsQueries(workScheduleId: string) {
  return useQuery({
    queryKey: attendanceKeys.shifts(workScheduleId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetWorkShifts({
        path: { workScheduleId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch work shifts');
    },
    enabled: Boolean(workScheduleId),
  });
}

export function useWorkShiftDetailQueries(id: string) {
  return useQuery({
    queryKey: attendanceKeys.shiftDetail(id),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetWorkShift({
        path: { id },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch work shift detail');
    },
    enabled: Boolean(id),
  });
}

// ─── Attendance Policies & Checkpoints ────────────────────────────────────────
export function useAttendancePoliciesQueries(companyId: string) {
  return useQuery({
    queryKey: attendanceKeys.policies(companyId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendancePolicies({
        path: { companyId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch attendance policies');
    },
    enabled: Boolean(companyId),
  });
}

export function useAttendancePolicyDetailQueries(id: string) {
  return useQuery({
    queryKey: attendanceKeys.policyDetail(id),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendancePolicy({
        path: { id },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch attendance policy detail');
    },
    enabled: Boolean(id),
  });
}

export function useAttendanceCheckpointsQueries(policyId: string) {
  return useQuery({
    queryKey: attendanceKeys.checkpoints(policyId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendanceCheckpoints({
        path: { policyId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch attendance checkpoints');
    },
    enabled: Boolean(policyId),
  });
}

export function useAttendanceCheckpointDetailQueries(id: string) {
  return useQuery({
    queryKey: attendanceKeys.checkpointDetail(id),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendanceCheckpoint({
        path: { id },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch attendance checkpoint detail');
    },
    enabled: Boolean(id),
  });
}

export function useRoleAttendancePoliciesQueries(roleId: string) {
  return useQuery({
    queryKey: attendanceKeys.rolePolicies(roleId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetRoleAttendancePolicies({
        path: { roleId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch role attendance policies');
    },
    enabled: Boolean(roleId),
  });
}

// ─── Attendance Locations ───────────────────────────────────────────────────
export function useAttendanceLocationsQueries(companyId: string) {
  return useQuery({
    queryKey: attendanceKeys.locations(companyId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendanceLocations({
        path: { companyId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch attendance locations');
    },
    enabled: Boolean(companyId),
  });
}

export function useAttendanceLocationDetailQueries(id: string) {
  return useQuery({
    queryKey: attendanceKeys.locationDetail(id),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendanceLocation({
        path: { id },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch attendance location detail');
    },
    enabled: Boolean(id),
  });
}

export function useCheckpointLocationsQueries(checkpointId: string) {
  return useQuery({
    queryKey: attendanceKeys.checkpointLocations(checkpointId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetCheckpointLocations({
        path: { checkpointId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch checkpoint locations');
    },
    enabled: Boolean(checkpointId),
  });
}

// ─── Role Schedules ─────────────────────────────────────────────────────────
export function useRoleWorkSchedulesByCompanyQueries(companyId: string) {
  return useQuery({
    queryKey: attendanceKeys.roleSchedules(companyId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetRoleWorkSchedulesByCompany({
        path: { companyId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch role work schedules');
    },
    enabled: Boolean(companyId),
  });
}

export function useCurrentRoleWorkScheduleQueries(roleId: string) {
  return useQuery({
    queryKey: attendanceKeys.currentRoleSchedule(roleId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetCurrentRoleWorkSchedule({
        path: { roleId },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch current role work schedule');
    },
    enabled: Boolean(roleId),
  });
}

// ─── Attendance Records & Logs ──────────────────────────────────────────────
export function useAttendanceRecordsQueries(
  companyId: string,
  filters?: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  },
) {
  return useQuery({
    queryKey: attendanceKeys.records(companyId, filters),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendanceRecords({
        query: {
          companyId,
          memberId: filters?.memberId,
          startDate: filters?.startDate,
          endDate: filters?.endDate,
        },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch attendance records');
    },
    enabled: Boolean(companyId),
  });
}

export function useAttendanceRecordDetailQueries(id: string) {
  return useQuery({
    queryKey: attendanceKeys.recordDetail(id),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendanceRecord({
        path: { id },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch attendance record detail');
    },
    enabled: Boolean(id),
  });
}

export function useMemberAttendanceRecordByDateQueries(
  companyMemberId: string,
  workDate: string,
) {
  return useQuery({
    queryKey: ['ATTENDANCE', 'RECORD_BY_DATE', companyMemberId, workDate],
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetMemberAttendanceRecordByDate({
        query: {
          companyMemberId,
          workDate,
        },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch attendance record by date');
    },
    enabled: Boolean(companyMemberId && workDate),
  });
}

export function useAttendanceLogsQueries(attendanceRecordId: string) {
  return useQuery({
    queryKey: attendanceKeys.recordLogs(attendanceRecordId),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendanceLogsByRecord({
        path: { attendanceRecordId },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch attendance logs');
    },
    enabled: Boolean(attendanceRecordId),
  });
}

export function useAttendanceLogDetailQueries(id: string) {
  return useQuery({
    queryKey: ['ATTENDANCE', 'LOG', id],
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetAttendanceLog({
        path: { id },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch attendance log detail');
    },
    enabled: Boolean(id),
  });
}

// ─── Leave Requests ─────────────────────────────────────────────────────────
export function useLeaveRequestsQueries(
  companyId: string,
  filters?: {
    memberId?: string;
    status?: string;
  },
) {
  return useQuery({
    queryKey: attendanceKeys.leaveRequests(companyId, filters),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetLeaveRequests({
        query: {
          companyId,
          memberId: filters?.memberId,
          status: filters?.status,
        },
        signal,
      });
      if (response.data) return response.data.data ?? [];
      throw new Error('Failed to fetch leave requests');
    },
    enabled: Boolean(companyId),
  });
}

export function useLeaveRequestDetailQueries(id: string) {
  return useQuery({
    queryKey: attendanceKeys.leaveDetail(id),
    queryFn: async ({ signal }) => {
      const response = await attendanceServicesGetLeaveRequest({
        path: { id },
        signal,
      });
      if (response.data) return response.data.data;
      throw new Error('Failed to fetch leave request detail');
    },
    enabled: Boolean(id),
  });
}
