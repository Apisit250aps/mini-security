'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleAttendancePolicySchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import { useRoleAttendancePolicyAssign } from '../../hooks/attendance-mutations';
import { useAttendancePoliciesQueries } from '../../hooks/attendance-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useOverlay } from '@repo/ui/hooks';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
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
  const { data: roles = [] } = useCompanyRolesQueries(companyId);
  const { data: policies = [] } = useAttendancePoliciesQueries(companyId);

  const roleOptions = useMemo(
    () =>
      roles
        .filter((r) => r.roleType !== 'SUPER_ADMIN')
        .map((r) => ({
          value: r.id,
          label: r.name,
        })),
    [roles],
  );

  const policyOptions = useMemo(
    () =>
      policies.map((p) => ({
        value: p.id,
        label: p.name,
      })),
    [policies],
  );

  const methods = useForm<FormValues>({
    resolver: zodResolver(createRoleAttendancePolicySchema as never),
    defaultValues: {
      companyId,
      roleId: roles[0]?.id || '',
      policyId: policyId || policies[0]?.id || '',
    },
  });

  const selectedRoleId = methods.watch('roleId');
  const assignMutation = useRoleAttendancePolicyAssign(
    selectedRoleId || roles[0]?.id || '',
  );

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
        <SelectField
          name="roleId"
          label="เลือกบทบาท / ตำแหน่ง (Role)"
          placeholder="เลือกบทบาทที่ต้องการบังคับใช้นโยบาย..."
          options={roleOptions}
          control={methods.control}
          required
        />

        <SelectField
          name="policyId"
          label="นโยบายการลงเวลา (Attendance Policy)"
          placeholder="เลือกนโยบาย..."
          options={policyOptions}
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
