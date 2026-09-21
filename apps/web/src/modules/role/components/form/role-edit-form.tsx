'use client';

import React from 'react';
import type { Role } from '@repo/domains/entities';
import RoleForm, { RoleFormValues } from './role-form';
import { useRoleUpdate } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function RoleEditForm({
  role,
  readOnly = false,
  onSuccess,
}: {
  role: Role;
  readOnly?: boolean;
  onSuccess?: () => void;
}) {
  const ui = useOverlay();
  const updateMutation = useRoleUpdate();

  const handleSubmit = async (data: RoleFormValues) => {
    if (readOnly) return;
    try {
      await updateMutation.mutateAsync({
        roleId: role.id,
        data: {
          name: data.name,
          description: data.description || null,
          roleType: data.roleType,
          isSystemDefault: data.isSystemDefault,
        },
      });
      ui.hideAll();
      onSuccess?.();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <RoleForm
      defaultValues={{
        name: role.name,
        description: role.description ?? '',
        organizationId: role.organizationId ?? null,
        roleType: role.roleType,
        isSystemDefault: role.isSystemDefault,
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
      readOnly={readOnly}
    />
  );
}
