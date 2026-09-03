'use client';

import React, { useState } from 'react';
import UserForm, { type UserFormValues } from './user-form';
import { useOverlay } from '@repo/ui/hooks';
import { toast } from '@repo/ui/components/sonner';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMemberAdd } from '@/modules/company/hooks/company-mutations';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { getErrorMessage } from '@/shared/utils';

export default function UserCreateForm({
  companyId,
  roleId,
  onSuccess,
}: {
  companyId?: string;
  roleId?: string;
  onSuccess?: () => void;
} = {}) {
  const ui = useOverlay();
  const session = useSession();
  const addMemberMutation = useCompanyMemberAdd(companyId || '');
  const rolesQuery = useCompanyRolesQueries(companyId || '');

  const [isLoading, setIsLoading] = useState(false);

  const processSignUp = async (data: UserFormValues) => {
    const res = await session.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password!,
    });

    if (res?.data?.user) {
      const newUser = res.data.user;

      // If companyId is present, automatically add user into company members
      if (companyId) {
        const availableRoles = rolesQuery.data || [];
        const targetRoleId =
          roleId ||
          availableRoles.find(
            (r) =>
              r.roleType !== 'SUPER_ADMIN' &&
              r.name.toLowerCase() !== 'owner' &&
              (!r.companyId || r.companyId === companyId),
          )?.id ||
          availableRoles.find(
            (r) =>
              r.roleType !== 'SUPER_ADMIN' && r.name.toLowerCase() !== 'owner',
          )?.id ||
          availableRoles[0]?.id;

        if (targetRoleId) {
          await addMemberMutation.mutateAsync({
            companyId,
            userId: newUser.id,
            roleId: targetRoleId,
            isActive: true,
          });
          toast.success(`เพิ่มพนักงาน ${newUser.name} เข้าสู่บริษัทเรียบร้อย`);
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
