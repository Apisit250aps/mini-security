import {
  attendanceServicesApproveAttendanceRecord,
  attendanceServicesAssignCheckpointLocation,
  attendanceServicesAssignMemberWorkSchedule,
  attendanceServicesAssignRoleAttendancePolicy,
  attendanceServicesCreateAttendanceCheckpoint,
  attendanceServicesCreateAttendanceLocation,
  attendanceServicesCreateAttendanceLog,
  attendanceServicesCreateAttendancePolicy,
  attendanceServicesCreateAttendanceRecord,
  attendanceServicesCreateLeaveRequest,
  attendanceServicesCreateWorkSchedule,
  attendanceServicesCreateWorkShift,
  attendanceServicesDeleteAttendanceCheckpoint,
  attendanceServicesDeleteAttendanceLocation,
  attendanceServicesDeleteAttendanceLog,
  attendanceServicesDeleteAttendancePolicy,
  attendanceServicesDeleteAttendanceRecord,
  attendanceServicesDeleteLeaveRequest,
  attendanceServicesDeleteMemberWorkSchedule,
  attendanceServicesDeleteWorkSchedule,
  attendanceServicesDeleteWorkShift,
  attendanceServicesRemoveCheckpointLocation,
  attendanceServicesRemoveRoleAttendancePolicy,
  attendanceServicesReviewLeaveRequest,
  attendanceServicesUpdateAttendanceCheckpoint,
  attendanceServicesUpdateAttendanceLocation,
  attendanceServicesUpdateAttendancePolicy,
  attendanceServicesUpdateAttendanceRecord,
  attendanceServicesUpdateLeaveRequest,
  attendanceServicesUpdateMemberWorkSchedule,
  attendanceServicesUpdateWorkSchedule,
  attendanceServicesUpdateWorkShift,
} from '@repo/client';
import type {
  ApproveAttendanceRecordRequest,
  CreateAttendanceCheckpoint,
  CreateAttendanceLocation,
  CreateAttendanceLog,
  CreateAttendancePolicy,
  CreateAttendanceRecord,
  CreateCheckpointLocation,
  CreateLeaveRequest,
  CreateMemberWorkSchedule,
  CreateRoleAttendancePolicy,
  CreateWorkSchedule,
  CreateWorkShift,
  ReviewLeaveRequest,
  UpdateAttendanceCheckpoint,
  UpdateAttendanceLocation,
  UpdateAttendancePolicy,
  UpdateAttendanceRecord,
  UpdateLeaveRequest,
  UpdateMemberWorkSchedule,
  UpdateWorkSchedule,
  UpdateWorkShift,
} from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { attendanceKeys, getErrorMessage } from '@/shared/utils';

// ─── Work Schedules ─────────────────────────────────────────────────────────
export function useWorkScheduleCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkSchedule) => {
      const res = await attendanceServicesCreateWorkSchedule({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('สร้างตารางเวลาทำงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.schedules(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างตารางเวลา'));
    },
  });
}

export function useWorkScheduleUpdate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWorkSchedule;
    }) => {
      const res = await attendanceServicesUpdateWorkSchedule({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('อัปเดตตารางเวลาทำงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.schedules(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.scheduleDetail(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตตารางเวลา'));
    },
  });
}

export function useWorkScheduleDelete(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteWorkSchedule({
        path: { id },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบตารางเวลาทำงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.schedules(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบตารางเวลา'));
    },
  });
}

// ─── Work Shifts ────────────────────────────────────────────────────────────
export function useWorkShiftCreate(workScheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkShift) => {
      const res = await attendanceServicesCreateWorkShift({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('สร้างกะการทำงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.shifts(workScheduleId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างกะ'));
    },
  });
}

export function useWorkShiftUpdate(workScheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWorkShift }) => {
      const res = await attendanceServicesUpdateWorkShift({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('อัปเดตกะการทำงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.shifts(workScheduleId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.shiftDetail(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตกะ'));
    },
  });
}

export function useWorkShiftDelete(workScheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteWorkShift({
        path: { id },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบกะการทำงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.shifts(workScheduleId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบกะ'));
    },
  });
}

// ─── Attendance Policies ───────────────────────────────────────────────────
export function useAttendancePolicyCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAttendancePolicy) => {
      const res = await attendanceServicesCreateAttendancePolicy({
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('สร้างนโยบายการลงเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.policies(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างนโยบาย'));
    },
  });
}

export function useAttendancePolicyUpdate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAttendancePolicy;
    }) => {
      const res = await attendanceServicesUpdateAttendancePolicy({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('อัปเดตนโยบายการลงเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.policies(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.policyDetail(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตนโยบาย'));
    },
  });
}

export function useAttendancePolicyDelete(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteAttendancePolicy({
        path: { id },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบนโยบายการลงเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.policies(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบนโยบาย'));
    },
  });
}

// ─── Attendance Checkpoints ─────────────────────────────────────────────────
export function useAttendanceCheckpointCreate(policyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAttendanceCheckpoint) => {
      const res = await attendanceServicesCreateAttendanceCheckpoint({
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('เพิ่มจุดเช็คชื่อสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.checkpoints(policyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการเพิ่มจุดเช็คชื่อ'),
      );
    },
  });
}

export function useAttendanceCheckpointUpdate(policyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAttendanceCheckpoint;
    }) => {
      const res = await attendanceServicesUpdateAttendanceCheckpoint({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('อัปเดตจุดเช็คชื่อสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.checkpoints(policyId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.checkpointDetail(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตจุดเช็คชื่อ'),
      );
    },
  });
}

export function useAttendanceCheckpointDelete(policyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteAttendanceCheckpoint({
        path: { id },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบจุดเช็คชื่อสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.checkpoints(policyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบจุดเช็คชื่อ'));
    },
  });
}

// ─── Role Attendance Policies ───────────────────────────────────────────────
export function useRoleAttendancePolicyAssign(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRoleAttendancePolicy) => {
      const res = await attendanceServicesAssignRoleAttendancePolicy({
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('กำหนดนโยบายให้บทบาทสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.rolePolicies(roleId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการกำหนดนโยบายให้บทบาท'),
      );
    },
  });
}

export function useRoleAttendancePolicyRemove(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId: rId,
      policyId,
    }: {
      roleId: string;
      policyId: string;
    }) => {
      const res = await attendanceServicesRemoveRoleAttendancePolicy({
        path: { roleId: rId, policyId },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ยกเลิกนโยบายของบทบาทสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.rolePolicies(roleId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการยกเลิกนโยบาย'));
    },
  });
}

// ─── Attendance Locations ───────────────────────────────────────────────────
export function useAttendanceLocationCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAttendanceLocation) => {
      const res = await attendanceServicesCreateAttendanceLocation({
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('เพิ่มสถานที่ลงเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.locations(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเพิ่มสถานที่'));
    },
  });
}

export function useAttendanceLocationUpdate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAttendanceLocation;
    }) => {
      const res = await attendanceServicesUpdateAttendanceLocation({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('อัปเดตสถานที่ลงเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.locations(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.locationDetail(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตสถานที่'));
    },
  });
}

export function useAttendanceLocationDelete(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteAttendanceLocation({
        path: { id },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบสถานที่ลงเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.locations(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบสถานที่'));
    },
  });
}

export function useCheckpointLocationAssign(checkpointId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCheckpointLocation) => {
      const res = await attendanceServicesAssignCheckpointLocation({
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ผูกสถานที่กับจุดเช็คชื่อสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.checkpointLocations(checkpointId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการผูกสถานที่'));
    },
  });
}

export function useCheckpointLocationRemove(checkpointId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      checkpointId: cpId,
      locationId,
    }: {
      checkpointId: string;
      locationId: string;
    }) => {
      const res = await attendanceServicesRemoveCheckpointLocation({
        path: { checkpointId: cpId, locationId },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ปลดสถานที่ออกจากจุดเช็คชื่อสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.checkpointLocations(checkpointId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการปลดสถานที่'));
    },
  });
}

// ─── Member Work Schedules ─────────────────────────────────────────────────
export function useMemberWorkScheduleAssign(companyMemberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMemberWorkSchedule) => {
      const res = await attendanceServicesAssignMemberWorkSchedule({
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('มอบหมายกะทำงานให้พนักงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.memberSchedules(companyMemberId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.currentMemberSchedule(companyMemberId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการมอบหมายกะให้พนักงาน'),
      );
    },
  });
}

export function useMemberWorkScheduleUpdate(companyMemberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMemberWorkSchedule;
    }) => {
      const res = await attendanceServicesUpdateMemberWorkSchedule({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('อัปเดตตารางงานพนักงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.memberSchedules(companyMemberId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.currentMemberSchedule(companyMemberId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตตารางงานพนักงาน'),
      );
    },
  });
}

export function useMemberWorkScheduleDelete(companyMemberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteMemberWorkSchedule({
        path: { id },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบตารางงานพนักงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.memberSchedules(companyMemberId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.currentMemberSchedule(companyMemberId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบตารางงานพนักงาน'),
      );
    },
  });
}

// ─── Attendance Records & Logs ──────────────────────────────────────────────
export function useAttendanceRecordCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAttendanceRecord) => {
      const res = await attendanceServicesCreateAttendanceRecord({
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('บันทึกเวลาทำงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.records(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการบันทึกเวลา'));
    },
  });
}

export function useAttendanceRecordUpdate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAttendanceRecord;
    }) => {
      const res = await attendanceServicesUpdateAttendanceRecord({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('อัปเดตบันทึกเวลาทำงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.records(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.recordDetail(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตบันทึกเวลา'),
      );
    },
  });
}

export function useAttendanceRecordDelete(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteAttendanceRecord({
        path: { id },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบบันทึกเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.records(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบบันทึกเวลา'));
    },
  });
}

export function useAttendanceRecordApprove(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ApproveAttendanceRecordRequest;
    }) => {
      const res = await attendanceServicesApproveAttendanceRecord({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('ดำเนินการตรวจสอบและอนุมัติเวลาทำงานเรียบร้อย');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.records(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.recordDetail(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการอนุมัติเวลาทำงาน'),
      );
    },
  });
}

export function useAttendanceLogCreate(attendanceRecordId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAttendanceLog) => {
      const res = await attendanceServicesCreateAttendanceLog({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('บันทึก Event การลงเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.recordLogs(attendanceRecordId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการบันทึก Check-in Log'),
      );
    },
  });
}

export function useAttendanceLogDelete(attendanceRecordId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteAttendanceLog({
        path: { id },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบ Event การลงเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.recordLogs(attendanceRecordId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบ Event การลงเวลา'),
      );
    },
  });
}

// ─── Leave Requests ─────────────────────────────────────────────────────────
export function useLeaveRequestCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLeaveRequest) => {
      const res = await attendanceServicesCreateLeaveRequest({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('ส่งคำขอลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.leaveRequests(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการส่งคำขอลา'));
    },
  });
}

export function useLeaveRequestUpdate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateLeaveRequest;
    }) => {
      const res = await attendanceServicesUpdateLeaveRequest({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('อัปเดตคำขอลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.leaveRequests(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.leaveDetail(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตคำขอลา'));
    },
  });
}

export function useLeaveRequestDelete(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteLeaveRequest({
        path: { id },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบคำขอลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.leaveRequests(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบคำขอลา'));
    },
  });
}

export function useLeaveRequestReview(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ReviewLeaveRequest;
    }) => {
      const res = await attendanceServicesReviewLeaveRequest({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('ดำเนินการอนุมัติ/ปฏิเสธคำขอลาเรียบร้อย');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.leaveRequests(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.leaveDetail(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการพิจารณาคำขอลา'));
    },
  });
}
