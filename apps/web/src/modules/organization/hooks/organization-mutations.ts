import {
  attendanceKeys,
  featureKeys,
  leaveKeys,
  permissionKeys,
  roleKeys,
  sessionKeys,
} from '@/shared/utils/query';
import {
  organizationServicesAddOrganizationMember,
  organizationServicesCreateOrganization,
  organizationServicesCreateSite,
  organizationServicesDeleteOrganization,
  organizationServicesDeleteSite,
  organizationServicesRemoveOrganizationMember,
  organizationServicesSwitchActiveOrganization,
  organizationServicesUpdateOrganization,
  organizationServicesUpdateOrganizationMember,
  organizationServicesUpdateSite,
} from '@repo/client';
import type {
  CreateOrganization,
  CreateOrganizationMember,
  CreateSite,
  UpdateOrganization,
  UpdateOrganizationMember,
  UpdateSite,
} from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { organizationKeys, getErrorMessage } from '@/shared/utils';

export function useOrganizationDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const res = await organizationServicesDeleteOrganization({
        path: { id: organizationId },
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('ลบข้อมูลองค์กรสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.details() }),
        queryClient.invalidateQueries({ queryKey: roleKeys.all }),
        queryClient.invalidateQueries({ queryKey: featureKeys.all }),
        queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
        queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบองค์กร'));
    },
  });
}

export function useOrganizationUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: UpdateOrganization;
    }) => {
      const res = await organizationServicesUpdateOrganization({
        path: { id: organizationId },
        body: data,
      });
      return res;
    },
    onSuccess: async (_, variables) => {
      toast.success('บันทึกข้อมูลองค์กรสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: organizationKeys.detail(variables.organizationId),
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลองค์กร'),
      );
    },
  });
}

export function useOrganizationCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrganization) => {
      const res = await organizationServicesCreateOrganization({ body: data });
      return res;
    },
    onSuccess: async () => {
      toast.success('สร้างองค์กรใหม่สำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างองค์กร'));
    },
  });
}

export function useOrganizationMemberAdd(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrganizationMember) => {
      const res = await organizationServicesAddOrganizationMember({
        body: data,
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('เพิ่มสมาชิกในองค์กรสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.members(organizationId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเพิ่มสมาชิก'));
    },
  });
}

export function useOrganizationMemberUpdate(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrganizationMember;
    }) => {
      const res = await organizationServicesUpdateOrganizationMember({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('อัปเดตข้อมูลสมาชิกสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationKeys.members(organizationId),
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
}

export function useOrganizationMemberRemove(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await organizationServicesRemoveOrganizationMember({
        path: { id: memberId },
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('ลบสมาชิกออกจากองค์กรสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationKeys.members(organizationId),
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
}

export function useSiteCreate(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSite) => {
      const res = await organizationServicesCreateSite({ body: data });
      return res;
    },
    onSuccess: async () => {
      toast.success('เพิ่มไซต์ใหม่สำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.sites(organizationId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเพิ่มไซต์'));
    },
  });
}

export function useSiteUpdate(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSite }) => {
      const res = await organizationServicesUpdateSite({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('อัปเดตข้อมูลไซต์สำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.sites(organizationId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขไซต์'));
    },
  });
}

export function useSiteDelete(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (siteId: string) => {
      const res = await organizationServicesDeleteSite({
        path: { id: siteId },
        query: { organizationId },
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('ลบข้อมูลไซต์สำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationKeys.sites(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: organizationKeys.members(organizationId),
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบไซต์'));
    },
  });
}

export function useSwitchActiveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const res = await organizationServicesSwitchActiveOrganization({
        path: { id: organizationId },
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('เปลี่ยนองค์กรที่ใช้งานสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sessionKeys.all }),
        queryClient.invalidateQueries({ queryKey: permissionKeys.all }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.all }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเปลี่ยนองค์กร'));
    },
  });
}
export const useOrganizationSiteCreate = useSiteCreate;
export const useOrganizationSiteUpdate = useSiteUpdate;
export const useOrganizationSiteDelete = useSiteDelete;
