'use client';

import { UserSelectField, RoleSelectField } from '@/shared/components/form';
import { SiteSelectField } from '../sites/site-select-field';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationMemberSchema } from '@repo/domains/schema/organization';
import { z } from 'zod';
import { SwitchField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useOrganizationMemberAdd } from '../../hooks/organization-mutations';
import { useSitesQueries } from '../../hooks/organization-queries';
import { useOverlay } from '@repo/ui/hooks';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@repo/ui/components/tabs';
import UserCreateForm from '@/modules/user/components/form/user-create-form';

export type OrganizationMemberAddFormValues = z.infer<
  typeof createOrganizationMemberSchema
>;

export default function OrganizationMemberAddForm({
  organizationId,
}: {
  organizationId?: string;
}) {
  const orgId = organizationId || '';
  const ui = useOverlay();
  const addMutation = useOrganizationMemberAdd(orgId);

  const sitesQuery = useSitesQueries(orgId);

  const defaultSiteId = useMemo(() => {
    return sitesQuery.data?.find((site) => site.isActive)?.id || '';
  }, [sitesQuery.data]);

  const methods = useForm<OrganizationMemberAddFormValues>({
    resolver: zodResolver(createOrganizationMemberSchema as never),
    resetOptions: { keepDirtyValues: true, keepErrors: true },
    values: {
      organizationId: orgId,
      siteId: defaultSiteId,
      userId: '',
      roleId: '',
      isActive: true,
    },
  });

  const handleSubmit = async (data: OrganizationMemberAddFormValues) => {
    try {
      await addMutation.mutateAsync({
        organizationId: orgId,
        siteId: data.siteId || defaultSiteId || undefined,
        userId: data.userId,
        roleId: data.roleId,
        isActive: data.isActive ?? true,
      });
      ui.hideAll();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <Tabs defaultSelectedKey="new" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger id="new">สร้างบัญชีพนักงานใหม่</TabsTrigger>
        <TabsTrigger id="existing">เลือกจากผู้ใช้เดิม</TabsTrigger>
      </TabsList>

      <TabsContent id="new">
        <UserCreateForm organizationId={orgId} />
      </TabsContent>

      <TabsContent id="existing">
        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup className="flex flex-col gap-3">
            <UserSelectField
              name="userId"
              label="เลือกผู้ใช้งานในระบบ"
              placeholder="เลือกผู้ใช้งาน..."
              control={methods.control}
              required
            />

            <SiteSelectField
              name="siteId"
              organizationId={orgId}
              label="สังกัดไซต์ (Site)"
              placeholder="เลือกไซต์ (ค่าเริ่มต้น: สำนักงานใหญ่)..."
              control={methods.control}
            />

            <RoleSelectField
              name="roleId"
              organizationId={orgId}
              label="มอบหมายบทบาท (Role)"
              placeholder="เลือกบทบาท..."
              control={methods.control}
              required
            />

            <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
              <SwitchField
                name="isActive"
                label="เปิดใช้งานในองค์กร (Active)"
                description="อนุญาตให้ผู้ใช้นี้เข้าปฏิบัติงานในนามองค์กรได้"
                control={methods.control}
              />
            </FieldGroup>
          </FieldGroup>

          <div className="flex justify-end">
            <ButtonLoading type="submit" isLoading={addMutation.isPending}>
              เพิ่มเป็นสมาชิก
            </ButtonLoading>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}
