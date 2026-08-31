'use client';

import React from 'react';
import RoleForm, { RoleFormValues } from './role-form';
import { useRoleCreate } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function RoleCreateForm({ companyId }: { companyId?: string }) {
  const ui = useOverlay();
  const createMutation = useRoleCreate();

  const handleSubmit = async (data: RoleFormValues) => {
    await createMutation.mutateAsync({
      name: data.name,
      description: data.description || null,
      companyId: companyId || data.companyId || null,
      roleType: data.roleType,
      isSystemDefault: companyId ? false : (data.isSystemDefault ?? false),
    });
    ui.hideAll();
  };

  return (
    <RoleForm
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending}
      hideSystemDefault={Boolean(companyId)}
      defaultValues={{
        name: '',
        description: '',
        companyId: companyId || null,
        roleType: 'MEMBER',
        isSystemDefault: false,
      }}
    />
  );
}
