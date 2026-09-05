import {
  featureServicesAssignCompanyFeature,
  featureServicesAssignRoleFeature,
  featureServicesCreateFeature,
  featureServicesRemoveCompanyFeature,
  featureServicesRevokeRoleFeature,
  featureServicesToggleCompanyFeature,
  featureServicesToggleFeature,
  featureServicesToggleRoleFeature,
  featureServicesUpdateFeature,
} from '@repo/client';
import type {
  CreateCompanyFeature,
  CreateFeature,
  CreateRoleFeature,
  UpdateFeature,
} from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { featureKeys, getErrorMessage } from '@/shared/utils';

// ==========================================
// 1. Company Feature Mutations (Super Admin)
// ==========================================

export function useCompanyFeatureToggle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      companyId,
      featureId,
      isEnabled,
    }: {
      companyId: string;
      featureId: string;
      isEnabled: boolean;
    }) => {
      const res = await featureServicesToggleCompanyFeature({
        path: { companyId },
        body: { featureId, isEnabled },
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isEnabled
          ? 'เปิดใช้งานฟีเจอร์สำหรับบริษัทเรียบร้อยแล้ว'
          : 'ปิดการใช้งานฟีเจอร์สำหรับบริษัทเรียบร้อยแล้ว',
      );
      queryClient.invalidateQueries({
        queryKey: featureKeys.company(variables.companyId),
      });
      queryClient.invalidateQueries({
        queryKey: featureKeys.companyAvailable(variables.companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          'เกิดข้อผิดพลาดในการเปลี่ยนสถานะฟีเจอร์ของบริษัท',
        ),
      );
    },
  });
}

export function useCompanyFeatureAssign(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCompanyFeature) => {
      const res = await featureServicesAssignCompanyFeature({
        path: { companyId },
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('มอบหมายฟีเจอร์ให้บริษัทสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: featureKeys.company(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: featureKeys.companyAvailable(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการมอบหมายฟีเจอร์ให้บริษัท'),
      );
    },
  });
}

export function useCompanyFeatureRemove(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (featureId: string) => {
      const res = await featureServicesRemoveCompanyFeature({
        path: { companyId, featureId },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('ลบฟีเจอร์ออกจากบริษัทสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: featureKeys.company(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: featureKeys.companyAvailable(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการลบฟีเจอร์ออกจากบริษัท'),
      );
    },
  });
}

// ==========================================
// 2. Role Feature Mutations (Company Admin)
// ==========================================

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
    onSuccess: (_, variables) => {
      toast.success('มอบหมายฟีเจอร์ให้บทบาทสำเร็จ');
      queryClient.invalidateQueries({ queryKey: featureKeys.role(roleId) });
      queryClient.invalidateQueries({
        queryKey: featureKeys.companyRoles(variables.companyId),
      });
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
      companyId,
      featureId,
      isEnabled,
    }: {
      roleId: string;
      companyId: string;
      featureId: string;
      isEnabled: boolean;
    }) => {
      const res = await featureServicesToggleRoleFeature({
        path: { roleId },
        body: { companyId, featureId, isEnabled },
      });
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isEnabled
          ? 'เปิดสิทธิ์ฟีเจอร์ให้บทบาทเรียบร้อยแล้ว'
          : 'ปิดสิทธิ์ฟีเจอร์สำหรับบทบาทเรียบร้อยแล้ว',
      );
      queryClient.invalidateQueries({
        queryKey: featureKeys.role(variables.roleId),
      });
      queryClient.invalidateQueries({
        queryKey: featureKeys.companyRoles(variables.companyId),
      });
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

export function useRoleFeatureRevoke(roleId: string, companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (featureId: string) => {
      const res = await featureServicesRevokeRoleFeature({
        path: { roleId, featureId },
        query: { companyId },
      });
      return res;
    },
    onSuccess: () => {
      toast.success('เพิกถอนสิทธิ์ฟีเจอร์จากบทบาทสำเร็จ');
      queryClient.invalidateQueries({ queryKey: featureKeys.role(roleId) });
      queryClient.invalidateQueries({
        queryKey: featureKeys.companyRoles(companyId),
      });
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

// ==========================================
// 3. Master Feature Catalog Mutations
// ==========================================

export function useFeatureCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFeature) => {
      const res = await featureServicesCreateFeature({ body: data });
      return res;
    },
    onSuccess: () => {
      toast.success('สร้างฟีเจอร์ใหม่ในระบบสำเร็จ');
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
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
    onSuccess: (_, variables) => {
      toast.success('อัปเดตข้อมูลฟีเจอร์สำเร็จ');
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: featureKeys.detail(variables.id),
      });
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
    onSuccess: () => {
      toast.success('เปลี่ยนสถานะฟีเจอร์ในระบบสำเร็จ');
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะฟีเจอร์'),
      );
    },
  });
}
