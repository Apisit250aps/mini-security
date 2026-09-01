'use client';

import React from 'react';
import type { Permission } from '@repo/domains/entities';
import PermissionForm, { PermissionFormValues } from './permission-form';
import { usePermissionUpdate } from '../../hooks/permission-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function PermissionEditForm({
  permission,
}: {
  permission: Permission;
}) {
  const ui = useOverlay();
  const updateMutation = usePermissionUpdate();

  const handleSubmit = async (data: PermissionFormValues) => {
    await updateMutation.mutateAsync({
      permissionId: permission.id,
      data: {
        module: data.module,
        action: data.action,
        description: data.description || null,
      },
    });
    ui.hideAll();
  };

  return (
    <PermissionForm
      defaultValues={{
        module: permission.module,
        action: permission.action,
        description: permission.description ?? '',
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
    />
  );
}
