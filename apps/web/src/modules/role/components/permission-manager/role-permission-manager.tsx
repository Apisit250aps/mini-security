'use client';

import React, { useMemo, useState } from 'react';
import type { Role } from '@repo/domains/entities';
import {
  RolePermissionProvider,
  useRolePermissionContext,
} from '../../context/role-permission-context';
import { RolePermissionModuleGroup } from './role-permission-module-group';
import { Badge } from '@repo/ui/components/badge';
import { Spinner } from '@repo/ui/components/spinner';
import { Input } from '@repo/ui/components/input';
import { SearchIcon, ShieldCheckIcon } from 'lucide-react';

function RolePermissionManagerContent() {
  const {
    role,
    allPermissions,
    assignedPermissions,
    groupedPermissions,
    isLoading,
  } = useRolePermissionContext();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroupedPermissions = useMemo(() => {
    if (!searchTerm.trim()) return groupedPermissions;

    const term = searchTerm.toLowerCase();
    const result: typeof groupedPermissions = {};

    for (const [moduleName, perms] of Object.entries(groupedPermissions)) {
      const filtered = perms.filter(
        (p) =>
          p.action.toLowerCase().includes(term) ||
          p.module.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)),
      );
      if (filtered.length > 0) {
        result[moduleName] = filtered;
      }
    }

    return result;
  }, [groupedPermissions, searchTerm]);

  const totalFilteredCount = useMemo(() => {
    return Object.values(filteredGroupedPermissions).reduce(
      (acc, list) => acc + list.length,
      0,
    );
  }, [filteredGroupedPermissions]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลสิทธิ์...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Header Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 p-3">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="size-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{role.name}</span>
            {role.description && (
              <span className="text-xs text-muted-foreground">
                {role.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            ได้รับสิทธิ์ {assignedPermissions.length} / {allPermissions.length}{' '}
            รายการ
          </Badge>
          {role.isSystemDefault && (
            <Badge variant="secondary">System Default</Badge>
          )}
        </div>
      </div>

      {/* Search Filter Input */}
      <div className="relative">
        <Input
          placeholder="ค้นหาสิทธิ์ (เช่น user:read, create)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Module Groups */}
      {totalFilteredCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">ไม่พบรายการสิทธิ์ที่ตรงกับคำค้นหา</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(filteredGroupedPermissions).map(
            ([moduleName, perms]) => (
              <RolePermissionModuleGroup
                key={moduleName}
                moduleName={moduleName}
                permissions={perms}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function RolePermissionManager({ role }: { role: Role }) {
  return (
    <RolePermissionProvider role={role}>
      <RolePermissionManagerContent />
    </RolePermissionProvider>
  );
}

export default RolePermissionManager;
