import {
  featureServicesAssignOrganizationFeature,
  featureServicesAssignRoleFeature,
  featureServicesCreateFeature,
  featureServicesRemoveOrganizationFeature,
  featureServicesRevokeRoleFeature,
  featureServicesToggleOrganizationFeature,
  featureServicesToggleFeature,
  featureServicesToggleRoleFeature,
  featureServicesUpdateFeature,
} from '@repo/client';
import type {
  CreateOrganizationFeature,
  CreateFeature,
  CreateRoleFeature,
  UpdateFeature,
} from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { featureKeys, getErrorMessage } from '@/shared/utils';

/**
 * 1. Organization Feature Mutations (Super Admin)
 */

export function useOrganizationFeatureToggle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      organizationId,
      featureId,
      isEnabled,
    }: {
      organizationId?: string;
      featureId: string;
      isEnabled: boolean;
    }) => {
      const orgId = organizationId || '';
      const res = await featureServicesToggleOrganizationFeature({
        path: { organizationId: orgId },
        body: { featureId, isEnabled },
      });
      return res;
    },
    onSuccess: async (_, variables) => {
      const orgId = variables.organizationId || '';
      toast.success(
        variables.isEnabled
          ? 'เปิดใช้งานฟีเจอร์สำหรับองค์กรเรียบร้อยแล้ว'
          : 'ปิดการใช้งานฟีเจอร์สำหรับองค์กรเรียบร้อยแล้ว',
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: featureKeys.organization(orgId),
        }),
        queryClient.invalidateQueries({
          queryKey: featureKeys.organizationAvailable(orgId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FEATURE', 'ORGANIZATION_ROLES'],
        }),
        queryClient.invalidateQueries({ queryKey: ['FEATURE', 'ROLE'] }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          'เกิดข้อผิดพลาดในการเปลี่ยนสถานะฟีเจอร์ขององค์กร',
        ),
      );
    },
  });
}

export function useOrganizationFeatureAssign(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrganizationFeature) => {
      const res = await featureServicesAssignOrganizationFeature({
        path: { organizationId },
        body: data,
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('มอบหมายฟีเจอร์ให้องค์กรสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: featureKeys.organization(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: featureKeys.organizationAvailable(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FEATURE', 'ORGANIZATION_ROLES'],
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการมอบหมายฟีเจอร์ให้องค์กร'),
      );
    },
  });
}

export function useOrganizationFeatureRemove(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (featureId: string) => {
      const res = await featureServicesRemoveOrganizationFeature({
        path: { organizationId, featureId },
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('ลบฟีเจอร์ออกจากองค์กรสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: featureKeys.organization(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: featureKeys.organizationAvailable(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FEATURE', 'ORGANIZATION_ROLES'],
        }),
        queryClient.invalidateQueries({ queryKey: ['FEATURE', 'ROLE'] }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบฟีเจอร์ออกจากองค์กร'),
      );
    },
  });
}

/**
 * 2. Role Feature Mutations (Organization Admin)
 */

export function useRoleFeatureAssign(roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRoleFeature) => {
      const res = await featureServicesAssignRoleFeature({
        path: { roleId },
        body: data,
      });
      return res;
    },
    onSuccess: async (_, variables) => {
      toast.success('มอบหมายฟีเจอร์ให้บทบาทสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: featureKeys.role(roleId) }),
        queryClient.invalidateQueries({
          queryKey: featureKeys.organizationRoles(variables.organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FEATURE', 'ORGANIZATION'],
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการมอบหมายฟีเจอร์ให้บทบาท'),
      );
    },
  });
}

export function useRoleFeatureToggle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId,
      organizationId,
      featureId,
      isEnabled,
    }: {
      roleId: string;
      organizationId?: string;
      featureId: string;
      isEnabled: boolean;
    }) => {
      const orgId = organizationId || '';
      const res = await featureServicesToggleRoleFeature({
        path: { roleId },
        body: { organizationId: orgId, featureId, isEnabled },
      });
      return res;
    },
    onSuccess: async (_, variables) => {
      const orgId = variables.organizationId || '';
      toast.success(
        variables.isEnabled
          ? 'เปิดสิทธิ์ฟีเจอร์ให้บทบาทเรียบร้อยแล้ว'
          : 'ปิดสิทธิ์ฟีเจอร์สำหรับบทบาทเรียบร้อยแล้ว',
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: featureKeys.role(variables.roleId),
        }),
        queryClient.invalidateQueries({
          queryKey: featureKeys.organizationRoles(orgId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FEATURE', 'ORGANIZATION'],
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          'เกิดข้อผิดพลาดในการเปลี่ยนสถานะฟีเจอร์ของบทบาท',
        ),
      );
    },
  });
}

export function useRoleFeatureRevoke(
  roleId: string,
  organizationId: string = '',
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (featureId: string) => {
      const res = await featureServicesRevokeRoleFeature({
        path: { roleId, featureId },
        query: { organizationId: organizationId },
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('เพิกถอนสิทธิ์ฟีเจอร์จากบทบาทสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: featureKeys.role(roleId) }),
        queryClient.invalidateQueries({
          queryKey: featureKeys.organizationRoles(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FEATURE', 'ORGANIZATION'],
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          'เกิดข้อผิดพลาดในการเพิกถอนสิทธิ์ฟีเจอร์จากบทบาท',
        ),
      );
    },
  });
}

/**
 * 3. Master Feature Catalog Mutations
 */

export function useFeatureCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFeature) => {
      const res = await featureServicesCreateFeature({ body: data });
      return res;
    },
    onSuccess: async () => {
      toast.success('สร้างฟีเจอร์ใหม่ในระบบสำเร็จ');
      await queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างฟีเจอร์ใหม่'),
      );
    },
  });
}

export function useFeatureUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFeature }) => {
      const res = await featureServicesUpdateFeature({
        path: { id },
        body: data,
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('อัปเดตข้อมูลฟีเจอร์สำเร็จ');
      await queryClient.invalidateQueries({ queryKey: featureKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลฟีเจอร์'),
      );
    },
  });
}

export function useFeatureToggle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await featureServicesToggleFeature({
        path: { id },
        body: { isActive },
      });
      return res;
    },
    onSuccess: async () => {
      toast.success('เปลี่ยนสถานะฟีเจอร์ในระบบสำเร็จ');
      await queryClient.invalidateQueries({ queryKey: featureKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะฟีเจอร์'),
      );
    },
  });
}
