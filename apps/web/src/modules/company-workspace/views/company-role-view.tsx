'use client';

import React from 'react';
import { useActiveCompany } from '../hooks/use-active-company';
import RoleDataTable from '@/modules/role/components/table/role-data-table';
import RoleCreateAction from '@/modules/role/components/role-create-action';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Spinner } from '@repo/ui/components/spinner';
import { ShieldCheck } from 'lucide-react';

export default function CompanyRoleView() {
  const { activeCompany, activeCompanyId, isLoading } = useActiveCompany();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลบทบาท...
        </span>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <ShieldCheck className="size-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">ไม่พบบริษัทที่สังกัด</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            จัดการ Role และตำแหน่งพนักงาน
          </h1>
          <p className="text-sm text-muted-foreground">
            กำหนดบทบาท ตำแหน่งงาน และสิทธิ์การเข้าถึงเมนูต่างๆ สำหรับพนักงานใน{' '}
            {activeCompany.name}
          </p>
        </div>
        <RoleCreateAction companyId={activeCompanyId} />
      </div>

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
    </div>
  );
}
