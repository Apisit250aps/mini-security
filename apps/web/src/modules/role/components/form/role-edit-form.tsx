'use client';

import React from 'react';
import type { Role } from '@repo/domains/entities';
import RoleForm, { RoleFormValues } from './role-form';
import { useRoleUpdate } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function RoleEditForm({ role }: { role: Role }) {
  const ui = useOverlay();
  const updateMutation = useRoleUpdate();

  const handleSubmit = async (data: RoleFormValues) => {
    await updateMutation.mutateAsync({
      roleId: role.id,
      data: {
        name: data.name,
        description: data.description || null,
        isSystemDefault: data.isSystemDefault,
      },
    });
    ui.hideAll();
  };

  return (
    <RoleForm
      defaultValues={{
        name: role.name,
        description: role.description ?? '',
        companyId: role.companyId ?? null,
        isSystemDefault: role.isSystemDefault,
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
    />
  );
}
