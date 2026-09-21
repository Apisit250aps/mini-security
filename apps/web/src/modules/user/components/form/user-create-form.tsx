'use client';

import React, { useState } from 'react';
import UserForm, { type UserFormValues } from './user-form';
import { useOverlay } from '@repo/ui/hooks';
import { toast } from '@repo/ui/components/sonner';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useOrganizationMemberAdd } from '@/modules/organization/hooks/organization-mutations';
import { useGetOrganizationRoles } from '@/modules/role/hooks/role-queries';
import { getErrorMessage } from '@/shared/utils';

export default function UserCreateForm({
  organizationId,
  roleId,
  onSuccess,
}: {
  organizationId?: string;
  roleId?: string;
  onSuccess?: () => void;
} = {}) {
  const orgId = organizationId || '';
  const ui = useOverlay();
  const session = useSession();
  const addMemberMutation = useOrganizationMemberAdd(orgId);
  const rolesQuery = useGetOrganizationRoles(orgId);

  const [isLoading, setIsLoading] = useState(false);

  const processSignUp = async (data: UserFormValues) => {
    const res = await session.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password!,
    });

    if (res?.data?.user) {
      const newUser = res.data.user;

      // If orgId is present, automatically add user into organization members
      if (orgId) {
        const availableRoles = rolesQuery.data || [];
        const targetRoleId =
          roleId ||
          availableRoles.find(
            (r) =>
              r.roleType !== 'SUPER_ADMIN' &&
              r.name.toLowerCase() !== 'owner' &&
              (!r.organizationId || r.organizationId === orgId),
          )?.id ||
          availableRoles.find(
            (r) =>
              r.roleType !== 'SUPER_ADMIN' && r.name.toLowerCase() !== 'owner',
          )?.id ||
          availableRoles[0]?.id;

        if (targetRoleId) {
          await addMemberMutation.mutateAsync({
            organizationId: orgId,
            userId: newUser.id,
            roleId: targetRoleId,
            isActive: true,
          });
          toast.success(`เพิ่มพนักงาน ${newUser.name} เข้าสู่องค์กรเรียบร้อย`);
        } else {
          toast.success('สร้างบัญชีผู้ใช้สำเร็จ');
        }
      } else {
        toast.success('สร้างบัญชีผู้ใช้สำเร็จ');
      }

      ui.hideAll();
      onSuccess?.();
      return;
    }

    if (res?.error) {
      toast.error(res.error.message || 'ไม่สามารถสร้างบัญชีผู้ใช้ได้');
    }
  };

  const handleSubmit = (data: UserFormValues) => {
    setIsLoading(true);
    processSignUp(data)
      .catch((err: unknown) => {
        toast.error(getErrorMessage(err, 'เกิดข้อผิดพลาดในการสร้างพนักงาน'));
      })
      .then(() => {
        setIsLoading(false);
      });
  };

  return <UserForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
