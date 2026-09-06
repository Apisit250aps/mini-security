import {
  attendanceServicesCheckIn,
  attendanceServicesCreateSchedule,
  attendanceServicesCreateSlot,
  attendanceServicesDeleteSlot,
  attendanceServicesManualCheckIn,
  attendanceServicesUpdateSchedule,
  attendanceServicesUpdateSlot,
} from '@repo/client';
import type {
  CheckInRequest,
  CreateAttendanceLog,
  CreateCheckInSchedule,
  CreateScheduleSlot,
  UpdateCheckInSchedule,
  UpdateScheduleSlot,
} from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { attendanceKeys, getErrorMessage } from '@/shared/utils';

export function useScheduleCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCheckInSchedule) => {
      const res = await attendanceServicesCreateSchedule({ body: data });
      return res.data;
    },
    onSuccess: () => {
      toast.success('สร้างตารางเวลาเช็คชื่อสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.schedules(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างตารางเวลา'));
    },
  });
}

export function useScheduleUpdate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCheckInSchedule;
    }) => {
      const res = await attendanceServicesUpdateSchedule({
        path: { id },
        body: data,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('อัปเดตตารางเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.schedules(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขตารางเวลา'));
    },
  });
}

export function useSlotCreate(scheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateScheduleSlot) => {
      const res = await attendanceServicesCreateSlot({
        path: { scheduleId },
        body: data,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('เพิ่มรอบเวลาเช็คชื่อสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.slots(scheduleId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเพิ่มรอบเวลา'));
    },
  });
}

export function useSlotUpdate(scheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateScheduleSlot;
    }) => {
      const res = await attendanceServicesUpdateSlot({
        path: { id },
        body: data,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('แก้ไขรอบเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.slots(scheduleId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขรอบเวลา'));
    },
  });
}

export function useSlotDelete(scheduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await attendanceServicesDeleteSlot({
        path: { id },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('ลบรอบเวลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.slots(scheduleId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบรอบเวลา'));
    },
  });
}

export function useAttendanceCheckIn(_companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CheckInRequest) => {
      const res = await attendanceServicesCheckIn({ body: data });
      return res.data;
    },
    onSuccess: () => {
      toast.success('บันทึกเวลาเข้างานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเช็คชื่อเข้างาน'));
    },
  });
}

export function useAttendanceManualCheckIn(_companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAttendanceLog) => {
      const res = await attendanceServicesManualCheckIn({ body: data });
      return res.data;
    },
    onSuccess: () => {
      toast.success('บันทึกเวลาเข้างานแทนพนักงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการบันทึกเวลาแทนพนักงาน'),
      );
    },
  });
}
