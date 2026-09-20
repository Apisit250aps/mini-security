'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { SelectField } from '@repo/ui/form';
import { Badge } from '@repo/ui/components/badge';
import { useCompanyMemberUpdate } from '../../hooks/company-mutations';
import type { CompanyMember, Role } from '@repo/client';
import { usePermission } from '@/modules/auth/hooks/permission-provider';

type RoleFormValues = {
  roleId: string;
};

export default function CompanyMemberRoleSelect({
  member,
  companyId,
  roles,
}: {
  member: CompanyMember;
  companyId: string;
  roles: Role[];
}) {
  const updateMutation = useCompanyMemberUpdate(companyId);
  const { isSuperAdmin } = usePermission();
  const currentRole = useMemo(
    () => roles.find((r) => r.id === member.roleId),
    [roles, member.roleId],
  );

  const isOwner = useMemo(
    () => currentRole?.name.toLowerCase() === 'owner',
    [currentRole],
  );

  // Filter out Super Admin - allow company-scoped and valid system default roles
  const companyRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        r.roleType !== 'SUPER_ADMIN' &&
        (!r.companyId || r.companyId === companyId) &&
        !r.name.toLowerCase().includes('super admin'),
    );
  }, [roles, companyId]);

  const methods = useForm<RoleFormValues>({
    mode: 'onChange',
    defaultValues: {
      roleId: member.roleId || '',
    },
    values: {
      roleId: member.roleId || '',
    },
  });

  const onSubmit = React.useCallback(
    async (data: RoleFormValues) => {
      if (
        !data.roleId ||
        data.roleId === member.roleId ||
        isOwner ||
        updateMutation.isPending
      ) {
        return;
      }
      try {
        await updateMutation.mutateAsync({
          id: member.id,
          data: {
            roleId: data.roleId,
          },
        });
      } catch {
        methods.reset({ roleId: member.roleId || '' });
      }
    },
    [member.id, member.roleId, isOwner, updateMutation, methods],
  );

  // If member is Owner, do not allow changing roles
  if (isOwner && !isSuperAdmin) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs font-semibold py-1 px-2.5"
      >
        Owner (เจ้าของ)
      </Badge>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void methods.handleSubmit(onSubmit)(e);
      }}
      onChange={() => {
        void methods.handleSubmit(onSubmit)();
      }}
      className="w-44"
    >
      <SelectField
        control={methods.control}
        name="roleId"
        label="บทบาท"
        placeholder="เลือกบทบาท..."
        disabled={updateMutation.isPending}
        options={companyRoles.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        onValueChange={() => {
          void methods.handleSubmit(onSubmit)();
        }}
      />
    </form>
  );
}
