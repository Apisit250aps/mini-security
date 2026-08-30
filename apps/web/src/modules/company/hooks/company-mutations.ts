import {
  companyServicesAddCompanyMember,
  companyServicesCreateCompany,
  companyServicesDeleteCompany,
  companyServicesRemoveCompanyMember,
  companyServicesUpdateCompany,
  companyServicesUpdateCompanyMember,
} from '@repo/client';
import type {
  CreateCompany,
  CreateCompanyMember,
  UpdateCompany,
  UpdateCompanyMember,
} from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { companyKeys, getErrorMessage } from '@/shared/utils';

function useCompanyDelete() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (companyId: string) => {
      const res = await companyServicesDeleteCompany({
        path: { id: companyId },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบข้อมูลบริษัทสำเร็จ');
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบบริษัท'));
    },
  });
  return mutation;
}

function useCompanyUpdate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: string;
      data: UpdateCompany;
    }) => {
      const res = await companyServicesUpdateCompany({
        path: { id: companyId },
        body: data,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('บันทึกข้อมูลบริษัทสำเร็จ');
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: companyKeys.detail(variables.companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลบริษัท'),
      );
    },
  });
  return mutation;
}

function useCompanyCreate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateCompany) => {
      const res = await companyServicesCreateCompany({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('สร้างบริษัทใหม่สำเร็จ');
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างบริษัท'));
    },
  });
  return mutation;
}

function useCompanyMemberAdd(companyId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateCompanyMember) => {
      const res = await companyServicesAddCompanyMember({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('เพิ่มสมาชิกในบริษัทสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: [...companyKeys.detail(companyId), 'members'],
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเพิ่มสมาชิก'));
    },
  });
  return mutation;
}

function useCompanyMemberUpdate(companyId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCompanyMember;
    }) => {
      const res = await companyServicesUpdateCompanyMember({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('อัปเดตข้อมูลสมาชิกสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: [...companyKeys.detail(companyId), 'members'],
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขสมาชิก'));
    },
  });
  return mutation;
}

function useCompanyMemberRemove(companyId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await companyServicesRemoveCompanyMember({
        path: { id: memberId },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบสมาชิกออกจากบริษัทสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: [...companyKeys.detail(companyId), 'members'],
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบสมาชิก'));
    },
  });
  return mutation;
}

export {
  useCompanyDelete,
  useCompanyUpdate,
  useCompanyCreate,
  useCompanyMemberAdd,
  useCompanyMemberUpdate,
  useCompanyMemberRemove,
};
