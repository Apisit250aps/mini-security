import {
  roleServicesCreateRole,
  roleServicesDeleteRole,
  roleServicesUpdateRole,
  roleServicesAssignPermissionToRole,
  roleServicesRevokePermissionFromRole,
} from '@repo/client';
import type {
  CreateRole,
  UpdateRole,
  CreateRolePermission,
} from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { roleKeys, getErrorMessage } from '@/shared/utils';

function useRoleDelete() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (roleId: string) => {
      const res = await roleServicesDeleteRole({ path: { id: roleId } });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบบทบาทสำเร็จ');
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบบทบาท'));
    },
  });
  return mutation;
}

function useRoleUpdate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      roleId,
      data,
    }: {
      roleId: string;
      data: UpdateRole;
    }) => {
      const res = await roleServicesUpdateRole({
        path: { id: roleId },
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('บันทึกข้อมูลบทบาทสำเร็จ');
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลบทบาท'),
      );
    },
  });
  return mutation;
}

function useRoleCreate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateRole) => {
      const res = await roleServicesCreateRole({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('สร้างบทบาทใหม่สำเร็จ');
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างบทบาท'));
    },
  });
  return mutation;
}

function useRoleAssignPermission() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateRolePermission) => {
      const res = await roleServicesAssignPermissionToRole({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('กำหนดสิทธิ์แก่บทบาทสำเร็จ');
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการกำหนดสิทธิ์'));
    },
  });
  return mutation;
}

function useRoleRevokePermission() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => {
      const res = await roleServicesRevokePermissionFromRole({
        path: { roleId, permissionId },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ยกเลิกสิทธิ์สำเร็จ');
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการยกเลิกสิทธิ์'));
    },
  });
  return mutation;
}

export {
  useRoleDelete,
  useRoleUpdate,
  useRoleCreate,
  useRoleAssignPermission,
  useRoleRevokePermission,
};
