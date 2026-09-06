import {
  attendanceKeys,
  featureKeys,
  leaveKeys,
  permissionKeys,
  roleKeys,
  sessionKeys,
} from '@/shared/utils/query';
import {
  companyServicesAddCompanyMember,
  companyServicesCreateCompany,
  companyServicesCreateCompanyBranch,
  companyServicesDeleteCompany,
  companyServicesDeleteCompanyBranch,
  companyServicesRemoveCompanyMember,
  companyServicesUpdateCompany,
  companyServicesUpdateCompanyBranch,
  companyServicesUpdateCompanyMember,
} from '@repo/client';
import type {
  CreateCompany,
  CreateCompanyBranch,
  CreateCompanyMember,
  UpdateCompany,
  UpdateCompanyBranch,
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
    onSuccess: async () => {
      toast.success('ลบข้อมูลบริษัทสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: companyKeys.details() }),
        queryClient.invalidateQueries({ queryKey: roleKeys.all }),
        queryClient.invalidateQueries({ queryKey: featureKeys.all }),
        queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
        queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
      ]);
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
    onSuccess: async (_, variables) => {
      toast.success('บันทึกข้อมูลบริษัทสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: companyKeys.detail(variables.companyId),
        }),
      ]);
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
    onSuccess: async () => {
      toast.success('สร้างบริษัทใหม่สำเร็จ');
      await queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
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
    onSuccess: async () => {
      toast.success('เพิ่มสมาชิกในบริษัทสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: companyKeys.members(companyId),
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
    onSuccess: async () => {
      toast.success('อัปเดตข้อมูลสมาชิกสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: companyKeys.members(companyId),
        }),
        queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
        queryClient.invalidateQueries({ queryKey: featureKeys.all }),
        queryClient.invalidateQueries({ queryKey: permissionKeys.all }),
        queryClient.invalidateQueries({ queryKey: sessionKeys.all }),
      ]);
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
    onSuccess: async () => {
      toast.success('ลบสมาชิกออกจากบริษัทสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: companyKeys.members(companyId),
        }),
        queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
        queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
        queryClient.invalidateQueries({ queryKey: featureKeys.all }),
        queryClient.invalidateQueries({ queryKey: permissionKeys.all }),
        queryClient.invalidateQueries({ queryKey: sessionKeys.all }),
      ]);
    },

    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบสมาชิก'));
    },
  });
  return mutation;
}

function useCompanyBranchCreate(companyId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateCompanyBranch) => {
      const res = await companyServicesCreateCompanyBranch({ body: data });
      return res;
    },
    onSuccess: async () => {
      toast.success('เพิ่มสาขาใหม่สำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: companyKeys.branches(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเพิ่มสาขา'));
    },
  });
  return mutation;
}

function useCompanyBranchUpdate(companyId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCompanyBranch;
    }) => {
      const res = await companyServicesUpdateCompanyBranch({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('อัปเดตข้อมูลสาขาสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: companyKeys.branches(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขสาขา'));
    },
  });
  return mutation;
}

function useCompanyBranchDelete(companyId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (branchId: string) => {
      const res = await companyServicesDeleteCompanyBranch({
        path: { id: branchId },
        query: { companyId },
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('ลบข้อมูลสาขาสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: companyKeys.branches(companyId),
        }),
        queryClient.invalidateQueries({
          queryKey: companyKeys.members(companyId),
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบสาขา'));
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
  useCompanyBranchCreate,
  useCompanyBranchUpdate,
  useCompanyBranchDelete,
};
