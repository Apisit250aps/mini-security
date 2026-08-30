'use client';

import React from 'react';
import Link from 'next/link';
import { useActiveCompany } from '../hooks/use-active-company';
import CompanyMemberDataTable from '@/modules/company/components/members/company-member-data-table';
import CompanyMemberAddAction from '@/modules/company/components/members/company-member-add-action';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import { UserPlus, Users } from 'lucide-react';

export default function CompanyEmployeeView() {
  const { activeCompany, activeCompanyId, isLoading } = useActiveCompany();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลพนักงาน...
        </span>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <Users className="size-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">ไม่พบบริษัทที่สังกัด</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          กรุณาเลือกหรือสร้างบริษัทก่อนดำเนินการจัดการพนักงาน
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">รายชื่อพนักงาน</h1>
          <p className="text-sm text-muted-foreground">
            จัดการสมาชิก มอบหมายบทบาท และควบคุมสถานะการทำงานของพนักงานใน{' '}
            {activeCompany.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CompanyMemberAddAction companyId={activeCompanyId} />
          <Link href="/company/employee/new">
            <Button variant="outline" className="gap-2">
              <UserPlus className="size-4" />
              หน้าฟอร์มเพิ่มพนักงาน
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>พนักงานทั้งหมด</CardTitle>
            <CardDescription>
              รายการพนักงานและบทบาทหน้าที่ในบริษัทปัจจุบัน
            </CardDescription>
          </div>
          <CardAction>
            <CompanyMemberAddAction companyId={activeCompanyId} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <CompanyMemberDataTable companyId={activeCompanyId} />
        </CardContent>
      </Card>
    </div>
  );
}
