'use client';

import React, { useState, useCallback } from 'react';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useFormRolesAssign } from '../../hooks/form-mutations';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
import type { FormTemplateRole } from '@repo/domains/entities';

interface FormTemplateRolesDialogProps {
  companyId: string;
  templateId: string;
  currentRoles: FormTemplateRole[];
  onClose: () => void;
}

export default function FormTemplateRolesDialog({
  companyId,
  templateId,
  currentRoles,
  onClose,
}: FormTemplateRolesDialogProps) {
  const rolesQuery = useCompanyRolesQueries(companyId);
  const assignRolesMutation = useFormRolesAssign(companyId, templateId);

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(() =>
    currentRoles.filter((r) => r.isEnabled).map((r) => r.roleId),
  );

  const toggleRole = useCallback((roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  }, []);

  const handleSave = useCallback(() => {
    assignRolesMutation.mutate(
      { roleIds: selectedRoleIds },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }, [assignRolesMutation, selectedRoleIds, onClose]);

  const roles = rolesQuery.data || [];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        เลือกตำแหน่ง (Role) ที่มีสิทธิ์เข้าถึงและเริ่มกรอกแบบฟอร์มนี้ในองค์กร
      </p>

      {rolesQuery.isLoading ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          กำลังโหลดตำแหน่งงาน...
        </div>
      ) : roles.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          ไม่พบตำแหน่งงานในองค์กรนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 border rounded-md p-3 max-h-60 overflow-y-auto">
          {roles.map((role) => {
            const isChecked = selectedRoleIds.includes(role.id);
            return (
              <label
                key={role.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer text-sm"
              >
                <Checkbox
                  isSelected={isChecked}
                  onChange={() => toggleRole(role.id)}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{role.name}</span>
                  {role.description && (
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onPress={onClose}>
          ยกเลิก
        </Button>
        <ButtonLoading
          onPress={handleSave}
          isLoading={assignRolesMutation.isPending}
        >
          บันทึกสิทธิ์ตำแหน่ง
        </ButtonLoading>
      </div>
    </div>
  );
}
