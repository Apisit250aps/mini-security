'use client';

import React from 'react';
import Link from 'next/link';
import { useActiveCompany } from '../hooks/use-active-company';
import CompanyMemberDataTable from '@/modules/company/components/members/company-member-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { UserPlus, Users } from 'lucide-react';
import { buildPageUrl } from '@/shared/utils';

export default function CompanyEmployeeView() {
  const { activeCompany, activeCompanyId, isLoading } = useActiveCompany();

  return (
    <PageLayout
      pageId="companyEmployee"
      isLoading={isLoading}
      actions={
        activeCompany && (
          <Link href={buildPageUrl('companyEmployeeNew')}>
            <Button className="gap-2">
              <UserPlus className="size-4" />
              เพิ่มพนักงานใหม่
            </Button>
          </Link>
        )
      }
    >
      {!activeCompany ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Users className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">ไม่พบบริษัทที่สังกัด</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            กรุณาเลือกหรือสร้างบริษัทก่อนดำเนินการจัดการพนักงาน
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>พนักงานทั้งหมด</CardTitle>
            <CardDescription>
              รายการพนักงานและบทบาทหน้าที่ในบริษัท {activeCompany.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyMemberDataTable companyId={activeCompanyId} />
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
