import {
  userServicesCreateUser,
  userServicesDeleteUser,
  userServicesUpdateUser,
} from '@repo/client';
import type { CreateUser, UpdateUser } from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';

function useUserDelete() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await userServicesDeleteUser({ path: { id: userId } });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบผู้ใช้สำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['GET', 'USER'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    },
  });
  return mutation;
}

function useUserUpdate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUser;
    }) => {
      const res = await userServicesUpdateUser({
        path: { id: userId },
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('บันทึกข้อมูลผู้ใช้สำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['GET', 'USER'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้');
    },
  });
  return mutation;
}

function useUserCreate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateUser) => {
      const res = await userServicesCreateUser({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('สร้างผู้ใช้ใหม่สำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['GET', 'USER'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้');
    },
  });
  return mutation;
}

export { useUserDelete, useUserUpdate, useUserCreate };
