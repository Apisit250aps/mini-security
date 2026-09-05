'use client';

import { RoleSelectField } from '@/modules/role/components/role-select-field';
import { AttendancePolicySelectField } from '@/modules/attendance/components/policies/attendance-policy-select-field';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleAttendancePolicySchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import { useRoleAttendancePolicyAssign } from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';

type FormValues = z.infer<typeof createRoleAttendancePolicySchema>;

export default function RolePolicyForm({
  companyId,
  policyId,
}: {
  companyId: string;
  policyId?: string;
}) {
  const ui = useOverlay();
  const methods = useForm<FormValues>({
    resolver: zodResolver(createRoleAttendancePolicySchema as never),
    defaultValues: {
      companyId,
      roleId: '',
      policyId: policyId || '',
    },
  });

  const selectedRoleId = useWatch({ control: methods.control, name: 'roleId' });
  const assignMutation = useRoleAttendancePolicyAssign(selectedRoleId || '');

  const handleSubmit = async (data: FormValues) => {
    await assignMutation.mutateAsync({
      companyId,
      roleId: data.roleId,
      policyId: data.policyId,
    });
    ui.hideAll();
  };

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <RoleSelectField
          name="roleId"
          companyId={companyId}
          label="เลือกบทบาท / ตำแหน่ง (Role)"
          placeholder="เลือกบทบาทที่ต้องการบังคับใช้นโยบาย..."
          control={methods.control}
          required
        />

        <AttendancePolicySelectField
          name="policyId"
          companyId={companyId}
          label="นโยบายการลงเวลา (Attendance Policy)"
          placeholder="เลือกนโยบาย..."
          control={methods.control}
          required
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={assignMutation.isPending}>
          ผูกนโยบายกับ Role
        </ButtonLoading>
      </div>
    </form>
  );
}
