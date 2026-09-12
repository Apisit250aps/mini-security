'use client';

import React, { useMemo } from 'react';
import type { Permission } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { Switch } from '@repo/ui/components/switch';
import { Spinner } from '@repo/ui/components/spinner';
import { RolePermissionItem } from './role-permission-item';
import { useRolePermissionContext } from '../../context/role-permission-context';

interface RolePermissionModuleGroupProps {
  moduleName: string;
  permissions: Permission[];
}

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  company: 'ข้อมูลองค์กร (Company)',
  company_branch: 'สาขาองค์กร (Branches)',
  company_member: 'สมาชิกและพนักงาน (Members)',
  role: 'บทบาทหน้าที่ (Roles)',
  attendance: 'การลงเวลาเข้างาน (Attendance)',
  attendance_schedule: 'ตารางเวลาและกะงาน (Schedules)',
  leave: 'การลาและโควต้า (Leave)',
  form_template: 'เทมเพลตแบบฟอร์ม (Form Templates)',
  form_submission: 'การส่งแบบฟอร์ม (Form Submissions)',
  user: 'บัญชีผู้ใช้งาน (User Profile)',
};

export function RolePermissionModuleGroup({
  moduleName,
  permissions,
}: RolePermissionModuleGroupProps) {
  const {
    readOnly,
    assignedPermissionIds,
    isModuleAllSelected,
    toggleModuleAll,
    isMutatingModule,
  } = useRolePermissionContext();

  const displayName =
    MODULE_DISPLAY_NAMES[moduleName] ||
    moduleName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const isAllSelected = isModuleAllSelected(moduleName);
  const isModulePending = isMutatingModule === moduleName;

  const assignedCount = useMemo(() => {
    return permissions.filter((p) => assignedPermissionIds.has(p.id)).length;
  }, [permissions, assignedPermissionIds]);

  const handleToggleAll = (checked: boolean) => {
    if (readOnly || isModulePending) return;
    toggleModuleAll(moduleName, checked);
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border bg-card p-3 shadow-xs">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{displayName}</span>
          <Badge
            variant={assignedCount > 0 ? 'default' : 'secondary'}
            className="text-[11px] px-1.5 py-0"
          >
            {assignedCount}/{permissions.length}
          </Badge>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              เลือกทั้งหมด
            </span>
            {isModulePending ? (
              <Spinner className="size-4 text-primary" />
            ) : (
              <Switch
                size="sm"
                isSelected={isAllSelected}
                onChange={handleToggleAll}
                aria-label={`Toggle all permissions for ${moduleName}`}
              />
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 ">
        {permissions.map((permission) => (
          <RolePermissionItem key={permission.id} permission={permission} />
        ))}
      </div>
    </div>
  );
}
