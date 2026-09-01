'use client';

import React from 'react';
import { useActiveCompany } from '../hooks/use-active-company';
import RoleDataTable from '@/modules/role/components/table/role-data-table';
import RoleCreateAction from '@/modules/role/components/role-create-action';
import PageLayout from '@/shared/components/layouts/page-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { ShieldCheck } from 'lucide-react';

export default function CompanyRoleView() {
  const { activeCompany, activeCompanyId, isLoading } = useActiveCompany();

  return (
    <PageLayout
      pageId="companyRole"
      isLoading={isLoading}
      actions={
        activeCompany && <RoleCreateAction companyId={activeCompanyId} />
      }
    >
      {!activeCompany ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <ShieldCheck className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">ไม่พบบริษัทที่สังกัด</h2>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>บทบาททั้งหมด (Roles)</CardTitle>
            <CardDescription>
              รายการบทบาทและตำแหน่งพนักงานเฉพาะสำหรับองค์กร {activeCompany.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoleDataTable companyId={activeCompanyId} />
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
