'use client';

import React from 'react';
import RoleForm, { RoleFormValues } from './role-form';
import { useRoleCreate } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function RoleCreateForm({
  organizationId,
  onSuccess,
}: {
  organizationId?: string;
  onSuccess?: () => void;
}) {
  const ui = useOverlay();
  const createMutation = useRoleCreate();
  const effectiveOrgId = organizationId;

  const handleSubmit = async (data: RoleFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description || null,
        organizationId: effectiveOrgId || data.organizationId || null,
        roleType: data.roleType,
        isSystemDefault: effectiveOrgId
          ? false
          : (data.isSystemDefault ?? false),
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
      hideSystemDefault={Boolean(effectiveOrgId)}
      defaultValues={{
        name: '',
        description: '',
        organizationId: effectiveOrgId || null,
        roleType: 'MEMBER',
        isSystemDefault: false,
      }}
    />
  );
}
