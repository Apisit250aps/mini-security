'use client';

import { UserSelectField } from '@/modules/user/components/user-select-field';
import { RoleSelectField } from '@/modules/role/components/role-select-field';
import { CompanyBranchSelectField } from '@/modules/company/components/branches/company-branch-select-field';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCompanyMemberSchema } from '@repo/domains/schema/company';
import { z } from 'zod';
import { SwitchField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyMemberAdd } from '../../hooks/company-mutations';
import { useCompanyBranchesQueries } from '../../hooks/company-queries';
import { useOverlay } from '@repo/ui/hooks';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@repo/ui/components/tabs';
import UserCreateForm from '@/modules/user/components/form/user-create-form';

export type CompanyMemberAddFormValues = z.infer<
  typeof createCompanyMemberSchema
>;

export default function CompanyMemberAddForm({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();
  const addMutation = useCompanyMemberAdd(companyId);

  const branchesQuery = useCompanyBranchesQueries(companyId);

  const defaultBranchId = useMemo(() => {
    return branchesQuery.data?.find((branch) => branch.isActive)?.id || '';
  }, [branchesQuery.data]);

  const methods = useForm<CompanyMemberAddFormValues>({
    resolver: zodResolver(createCompanyMemberSchema as never),
    resetOptions: { keepDirtyValues: true, keepErrors: true },
    values: {
      companyId,
      companyBranchId: defaultBranchId,
      userId: '',
      roleId: '',
      isActive: true,
    },
  });

  const handleSubmit = async (data: CompanyMemberAddFormValues) => {
    await addMutation.mutateAsync({
      companyId,
      companyBranchId: data.companyBranchId || defaultBranchId || undefined,
      userId: data.userId,
      roleId: data.roleId,
      isActive: data.isActive ?? true,
    });
    ui.hideAll();
  };

  return (
    <Tabs defaultSelectedKey="new" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger id="new">สร้างบัญชีพนักงานใหม่</TabsTrigger>
        <TabsTrigger id="existing">เลือกจากผู้ใช้เดิม</TabsTrigger>
      </TabsList>

      <TabsContent id="new">
        <UserCreateForm companyId={companyId} />
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

            <CompanyBranchSelectField
              name="companyBranchId"
              companyId={companyId}
              label="สังกัดสาขา (Branch)"
              placeholder="เลือกสาขา (ค่าเริ่มต้น: สำนักงานใหญ่)..."
              control={methods.control}
            />

            <RoleSelectField
              name="roleId"
              companyId={companyId}
              label="มอบหมายบทบาท (Role)"
              placeholder="เลือกบทบาท..."
              control={methods.control}
              required
            />

            <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
              <SwitchField
                name="isActive"
                label="เปิดใช้งานในองค์กร (Active)"
                description="อนุญาตให้ผู้ใช้นี้เข้าปฏิบัติงานในนามบริษัทได้"
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
