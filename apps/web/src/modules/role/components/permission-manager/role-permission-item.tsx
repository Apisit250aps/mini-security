'use client';

import React from 'react';
import type { Permission } from '@repo/domains/entities';
import { Switch } from '@repo/ui/components/switch';
import { Spinner } from '@repo/ui/components/spinner';
import { useRolePermissionContext } from '../../context/role-permission-context';

export function RolePermissionItem({ permission }: { permission: Permission }) {
  const {
    readOnly,
    isAssigned,
    togglePermission,
    mutatingPermissionId,
    isMutatingModule,
  } = useRolePermissionContext();

  const assigned = isAssigned(permission.id);
  const isPending =
    mutatingPermissionId === permission.id ||
    isMutatingModule === permission.module;

  const handleToggle = () => {
    if (readOnly || isPending) return;
    togglePermission(permission.id);
  };

  return (
    <div
      onClick={handleToggle}
      className={`flex items-center justify-between rounded-md border p-2.5 transition-colors select-none ${
        readOnly ? 'cursor-default' : 'cursor-pointer'
      } ${
        assigned
          ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
          : 'border-border/60 hover:bg-muted/40'
      }`}
    >
      <div className="flex flex-col gap-1 pr-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold">
            {permission.action}
          </span>
        </div>
        {permission.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {permission.description}
          </span>
        )}
      </div>

      <div
        className="flex items-center gap-2 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {isPending ? (
          <Spinner className="size-4 text-primary" />
        ) : (
          <Switch
            size="sm"
            isSelected={assigned}
            isDisabled={readOnly}
            onChange={() => togglePermission(permission.id)}
            aria-label={`Toggle permission ${permission.action}`}
          />
        )}
      </div>
    </div>
  );
}
