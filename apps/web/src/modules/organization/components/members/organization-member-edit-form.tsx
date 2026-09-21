'use client';

import { RoleSelectField } from '@/shared/components/form';
import { SiteSelectField } from '../sites/site-select-field';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateOrganizationMemberSchema } from '@repo/domains/schema/organization';
import type { OrganizationMember } from '@repo/client';
import { z } from 'zod';
import { SwitchField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useOrganizationMemberUpdate } from '../../hooks/organization-mutations';
import { useGetOrganizationRoles } from '@/modules/role/hooks/role-queries';
import { useOverlay } from '@repo/ui/hooks';

export type OrganizationMemberEditFormValues = z.infer<
  typeof updateOrganizationMemberSchema
>;

export default function OrganizationMemberEditForm({
  organizationId,
  member,
  onSuccess,
}: {
  organizationId?: string;
  member: OrganizationMember;
  onSuccess?: () => void;
}) {
  const orgId = organizationId || member.organizationId;
  const ui = useOverlay();
  const updateMutation = useOrganizationMemberUpdate(orgId);
  const rolesQuery = useGetOrganizationRoles(orgId);

  const currentRole = useMemo(
    () => (rolesQuery.data || []).find((r) => r.id === member.roleId),
    [rolesQuery.data, member.roleId],
  );

  const isOwner = useMemo(
    () => currentRole?.name.toLowerCase() === 'owner',
    [currentRole],
  );

  const methods = useForm<OrganizationMemberEditFormValues>({
    resolver: zodResolver(updateOrganizationMemberSchema as never),
    defaultValues: {
      roleId: member.roleId || '',
      siteId: member.siteId || '',
      isActive: member.isActive ?? true,
    },
  });

  const handleSubmit = async (data: OrganizationMemberEditFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: member.id,
        data: {
          roleId: isOwner ? member.roleId : data.roleId,
          siteId: data.siteId || member.siteId,
          isActive: isOwner ? true : data.isActive,
        },
      });
      ui.hideAll();
      onSuccess?.();
    } catch {
      // Handled by mutation onError toast
    }
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
            แต่สามารถเปลี่ยนไซต์สังกัดได้
          </div>
        ) : (
          <RoleSelectField
            name="roleId"
            organizationId={orgId}
            label="ปรับเปลี่ยนบทบาท (Role)"
            placeholder="เลือกบทบาท..."
            control={methods.control}
            required
          />
        )}

        <SiteSelectField
          name="siteId"
          organizationId={orgId}
          label="ไซต์สังกัด (Site)"
          placeholder="เลือกไซต์..."
          control={methods.control}
          required
        />

        {!isOwner && (
          <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
            <SwitchField
              name="isActive"
              label="สถานะการทำงาน (Active)"
              description="อนุญาตให้ผู้ใช้นี้เข้าปฏิบัติงานในนามองค์กรได้"
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
