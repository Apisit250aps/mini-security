'use client';

import React from 'react';
import RoleForm, { RoleFormValues } from './role-form';
import { useRoleCreate } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function RoleCreateForm({
  companyId,
  onSuccess,
}: {
  companyId?: string;
  onSuccess?: () => void;
}) {
  const ui = useOverlay();
  const createMutation = useRoleCreate();

  const handleSubmit = async (data: RoleFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description || null,
        companyId: companyId || data.companyId || null,
        roleType: data.roleType,
        isSystemDefault: companyId ? false : (data.isSystemDefault ?? false),
      });
      ui.hideAll();
      onSuccess?.();
    } catch {
      // Handled by mutation onError toast
    }
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
