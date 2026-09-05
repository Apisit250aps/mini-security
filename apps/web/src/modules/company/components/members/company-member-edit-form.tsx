'use client';

import { RoleSelectField } from '@/modules/role/components/role-select-field';
import { CompanyBranchSelectField } from '@/modules/company/components/branches/company-branch-select-field';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateCompanyMemberSchema } from '@repo/domains/schema/company';
import type { CompanyMember } from '@repo/domains/entities';
import { z } from 'zod';
import { SwitchField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyMemberUpdate } from '../../hooks/company-mutations';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useOverlay } from '@repo/ui/hooks';

export type CompanyMemberEditFormValues = z.infer<
  typeof updateCompanyMemberSchema
>;

export default function CompanyMemberEditForm({
  companyId,
  member,
}: {
  companyId: string;
  member: CompanyMember;
}) {
  const ui = useOverlay();
  const updateMutation = useCompanyMemberUpdate(companyId);
  const rolesQuery = useCompanyRolesQueries(companyId);

  const currentRole = useMemo(
    () => (rolesQuery.data || []).find((r) => r.id === member.roleId),
    [rolesQuery.data, member.roleId],
  );

  const isOwner = useMemo(
    () => currentRole?.name.toLowerCase() === 'owner',
    [currentRole],
  );

  const methods = useForm<CompanyMemberEditFormValues>({
    resolver: zodResolver(updateCompanyMemberSchema as never),
    defaultValues: {
      roleId: member.roleId,
      companyBranchId: member.companyBranchId,
      isActive: member.isActive,
    },
  });

  const handleSubmit = async (data: CompanyMemberEditFormValues) => {
    await updateMutation.mutateAsync({
      id: member.id,
      data: {
        roleId: isOwner ? member.roleId : data.roleId,
        companyBranchId: data.companyBranchId || member.companyBranchId,
        isActive: isOwner ? true : data.isActive,
      },
    });
    ui.hideAll();
  };

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        {isOwner ? (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">
              ผู้ใช้งานนี้เป็น Owner (เจ้าขององค์กร):
            </span>{' '}
            ไม่สามารถเปลี่ยนบทบาทหน้าที่หรือปิดการใช้งานได้
            แต่สามารถเปลี่ยนสาขาสังกัดได้
          </div>
        ) : (
          <RoleSelectField
            name="roleId"
            companyId={companyId}
            label="ปรับเปลี่ยนบทบาท (Role)"
            placeholder="เลือกบทบาท..."
            control={methods.control}
            required
          />
        )}

        <CompanyBranchSelectField
          name="companyBranchId"
          companyId={companyId}
          label="สาขาสังกัด (Branch)"
          placeholder="เลือกสาขา..."
          control={methods.control}
          required
        />

        {!isOwner && (
          <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
            <SwitchField
              name="isActive"
              label="สถานะการทำงาน (Active)"
              description="อนุญาตให้ผู้ใช้นี้เข้าปฏิบัติงานในนามบริษัทได้"
              control={methods.control}
            />
          </FieldGroup>
        )}
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={updateMutation.isPending}>
          บันทึก
        </ButtonLoading>
      </div>
    </form>
  );
}
