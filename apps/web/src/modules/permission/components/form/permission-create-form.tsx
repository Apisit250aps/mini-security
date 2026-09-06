'use client';

import React from 'react';
import PermissionForm, { PermissionFormValues } from './permission-form';
import { usePermissionCreate } from '../../hooks/permission-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function PermissionCreateForm() {
  const ui = useOverlay();
  const createMutation = usePermissionCreate();

  const handleSubmit = async (data: PermissionFormValues) => {
    try {
      await createMutation.mutateAsync({
        module: data.module,
        action: data.action,
        description: data.description || null,
      });
      ui.hideAll();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <PermissionForm
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending}
    />
  );
}
