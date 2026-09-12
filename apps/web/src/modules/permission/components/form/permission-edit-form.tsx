'use client';

import React from 'react';
import type { Permission } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
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
    try {
      await updateMutation.mutateAsync({
        permissionId: permission.id,
        data: {
          description: data.description || null,
        },
      });
      ui.hideAll();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">สิทธิ์:</span>
          <Badge variant="secondary" className="font-mono text-xs">
            {permission.action}
          </Badge>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {permission.module}
        </Badge>
      </div>

      <PermissionForm
        defaultValues={{
          module: permission.module,
          action: permission.action,
          description: permission.description ?? '',
        }}
        hideModuleAndAction
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
