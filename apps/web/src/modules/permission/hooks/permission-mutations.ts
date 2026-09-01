import {
  permissionServicesCreatePermission,
  permissionServicesDeletePermission,
  permissionServicesUpdatePermission,
} from '@repo/client';
import type { CreatePermission, UpdatePermission } from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { permissionKeys, getErrorMessage } from '@/shared/utils';

function usePermissionDelete() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (permissionId: string) => {
      const res = await permissionServicesDeletePermission({
        path: { id: permissionId },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบสิทธิ์สำเร็จ');
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบสิทธิ์'));
    },
  });
  return mutation;
}

function usePermissionUpdate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      permissionId,
      data,
    }: {
      permissionId: string;
      data: UpdatePermission;
    }) => {
      const res = await permissionServicesUpdatePermission({
        path: { id: permissionId },
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('บันทึกข้อมูลสิทธิ์สำเร็จ');
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลสิทธิ์'),
      );
    },
  });
  return mutation;
}

function usePermissionCreate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreatePermission) => {
      const res = await permissionServicesCreatePermission({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('สร้างสิทธิ์ใหม่สำเร็จ');
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างสิทธิ์'));
    },
  });
  return mutation;
}

export { usePermissionDelete, usePermissionUpdate, usePermissionCreate };
