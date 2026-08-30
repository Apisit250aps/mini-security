'use client';

import React from 'react';
import RoleForm, { RoleFormValues } from './role-form';
import { useRoleCreate } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function RoleCreateForm() {
  const ui = useOverlay();
  const createMutation = useRoleCreate();

  const handleSubmit = async (data: RoleFormValues) => {
    await createMutation.mutateAsync({
      name: data.name,
      description: data.description || null,
      companyId: data.companyId || null,
      isSystemDefault: data.isSystemDefault ?? false,
    });
    ui.hideAll();
  };

  return (
    <RoleForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
  );
}
