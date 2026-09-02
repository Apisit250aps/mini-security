'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateCompanyMemberSchema } from '@repo/domains/schema/company';
import type { CompanyMember } from '@repo/domains/entities';
import { z } from 'zod';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { SwitchField } from '@repo/ui/components/shared/form/boolean-fields';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyMemberUpdate } from '../../hooks/company-mutations';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useCompanyBranchesQueries } from '../../hooks/company-queries';
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
  const branchesQuery = useCompanyBranchesQueries(companyId);

  const currentRole = useMemo(
    () => (rolesQuery.data || []).find((r) => r.id === member.roleId),
    [rolesQuery.data, member.roleId],
  );

  const isOwner = useMemo(
    () => currentRole?.name.toLowerCase() === 'owner',
    [currentRole],
  );

  const roleOptions = useMemo(() => {
    return (rolesQuery.data || [])
      .filter(
        (r) =>
          r.roleType !== 'SUPER_ADMIN' &&
          (!r.companyId || r.companyId === companyId),
      )
      .map((r) => ({
        value: r.id,
        label: r.name,
      }));
  }, [rolesQuery.data, companyId]);

  const branchOptions = useMemo(() => {
    return (branchesQuery.data || [])
      .filter((b) => b.isActive || b.id === member.companyBranchId)
      .map((b) => ({
        value: b.id,
        label: b.name,
      }));
  }, [branchesQuery.data, member.companyBranchId]);

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
          <SelectField
            name="roleId"
            label="ปรับเปลี่ยนบทบาท (Role)"
            placeholder="เลือกบทบาท..."
            options={roleOptions}
            control={methods.control}
            required
          />
        )}

        <SelectField
          name="companyBranchId"
          label="สาขาสังกัด (Branch)"
          placeholder="เลือกสาขา..."
          options={branchOptions}
          control={methods.control}
          required
        />

        {!isOwner && (
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <SwitchField
              name="isActive"
              label="สถานะการทำงาน (Active)"
              description="อนุญาตให้ผู้ใช้นี้เข้าปฏิบัติงานในนามบริษัทได้"
              control={methods.control}
            />
          </div>
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
