'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCompanyMemberSchema } from '@repo/domains/schema/company';
import { z } from 'zod';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { SwitchField } from '@repo/ui/components/shared/form/boolean-fields';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyMemberAdd } from '../../hooks/company-mutations';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
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

  const usersQuery = useUserListQueries();
  const rolesQuery = useCompanyRolesQueries(companyId);
  const branchesQuery = useCompanyBranchesQueries(companyId);

  const userOptions = useMemo(() => {
    return (usersQuery.data || []).map((u) => ({
      value: u.id,
      label: `${u.name} (${u.email})`,
    }));
  }, [usersQuery.data]);

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
      .filter((b) => b.isActive)
      .map((b) => ({
        value: b.id,
        label: b.name,
      }));
  }, [branchesQuery.data]);

  const defaultBranchId = useMemo(() => {
    return branchesQuery.data?.[0]?.id || '';
  }, [branchesQuery.data]);

  const methods = useForm<CompanyMemberAddFormValues>({
    resolver: zodResolver(createCompanyMemberSchema as never),
    defaultValues: {
      companyId,
      companyBranchId: defaultBranchId,
      userId: '',
      roleId: '',
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (defaultBranchId && !methods.getValues('companyBranchId')) {
      methods.setValue('companyBranchId', defaultBranchId);
    }
  }, [defaultBranchId, methods]);

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
            <SelectField
              name="userId"
              label="เลือกผู้ใช้งานในระบบ"
              placeholder="เลือกผู้ใช้งาน..."
              options={userOptions}
              control={methods.control}
              required
            />

            <SelectField
              name="companyBranchId"
              label="สังกัดสาขา (Branch)"
              placeholder="เลือกสาขา (ค่าเริ่มต้น: สำนักงานใหญ่)..."
              options={branchOptions}
              control={methods.control}
            />

            <SelectField
              name="roleId"
              label="มอบหมายบทบาท (Role)"
              placeholder="เลือกบทบาท..."
              options={roleOptions}
              control={methods.control}
              required
            />

            <div className="flex flex-col gap-3 rounded-lg border p-3">
              <SwitchField
                name="isActive"
                label="เปิดใช้งานในองค์กร (Active)"
                description="อนุญาตให้ผู้ใช้นี้เข้าปฏิบัติงานในนามบริษัทได้"
                control={methods.control}
              />
            </div>
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
