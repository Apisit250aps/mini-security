import {
  companyServicesCreateCompany,
  companyServicesDeleteCompany,
  companyServicesUpdateCompany,
} from '@repo/client';
import type { CreateCompany, UpdateCompany } from '@repo/client';
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
    onSuccess: () => {
      toast.success('บันทึกข้อมูลบริษัทสำเร็จ');
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
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

export { useCompanyDelete, useCompanyUpdate, useCompanyCreate };
