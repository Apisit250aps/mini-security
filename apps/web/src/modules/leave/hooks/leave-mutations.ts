import {
  leaveServicesCancelRequest,
  leaveServicesCreateQuota,
  leaveServicesCreateType,
  leaveServicesReviewRequest,
  leaveServicesSubmitRequest,
  leaveServicesUpdateQuota,
  leaveServicesUpdateType,
} from '@repo/client';
import type {
  CreateLeaveQuota,
  CreateLeaveRequest,
  CreateLeaveType,
  ReviewLeaveRequestRequest,
  UpdateLeaveQuota,
  UpdateLeaveType,
} from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { getErrorMessage, leaveKeys } from '@/shared/utils';

export function useLeaveTypeCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLeaveType) => {
      const res = await leaveServicesCreateType({ body: data });
      return res.data;
    },
    onSuccess: () => {
      toast.success('สร้างประเภทการลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: leaveKeys.types(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างประเภทการลา'),
      );
    },
  });
}

export function useLeaveTypeUpdate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeaveType }) => {
      const res = await leaveServicesUpdateType({
        path: { id },
        body: data,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('อัปเดตประเภทการลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: leaveKeys.types(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขประเภทการลา'),
      );
    },
  });
}

export function useLeaveQuotaCreate(memberId: string, year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLeaveQuota) => {
      const res = await leaveServicesCreateQuota({ body: data });
      return res.data;
    },
    onSuccess: () => {
      toast.success('กำหนดโควต้าวันลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: leaveKeys.quotas(memberId, year),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการกำหนดโควต้าวันลา'),
      );
    },
  });
}

export function useLeaveQuotaUpdate(memberId: string, year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateLeaveQuota;
    }) => {
      const res = await leaveServicesUpdateQuota({
        path: { id },
        body: data,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('อัปเดตโควต้าวันลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: leaveKeys.quotas(memberId, year),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขโควต้า'));
    },
  });
}

export function useLeaveRequestSubmit(_companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLeaveRequest) => {
      const res = await leaveServicesSubmitRequest({ body: data });
      return res.data;
    },
    onSuccess: () => {
      toast.success('ส่งคำขอลาหยุดงานสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: leaveKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการส่งคำขอลา'));
    },
  });
}

export function useLeaveRequestReview(_companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ReviewLeaveRequestRequest;
    }) => {
      const res = await leaveServicesReviewRequest({
        path: { id },
        body: data,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('บันทึกผลการพิจารณาคำขอลาเรียบร้อย');
      queryClient.invalidateQueries({
        queryKey: leaveKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการพิจารณาคำขอลา'));
    },
  });
}

export function useLeaveRequestCancel(_companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await leaveServicesCancelRequest({
        path: { id },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('ยกเลิกคำขอลาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: leaveKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการยกเลิกคำขอลา'));
    },
  });
}
