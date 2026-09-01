'use client';

import React from 'react';
import { useActiveCompany } from '../hooks/use-active-company';
import CompanyEditForm from '@/modules/company/components/form/company-edit-form';
import PageLayout from '@/shared/components/layouts/page-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Building2 } from 'lucide-react';

export default function CompanySettingsView() {
  const { activeCompany, isLoading } = useActiveCompany();

  return (
    <PageLayout pageId="companySettings" isLoading={isLoading}>
      {!activeCompany ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Building2 className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">ไม่พบข้อมูลบริษัท</h2>
        </div>
      ) : (
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลทั่วไป (Company Profile)</CardTitle>
              <CardDescription>
                ข้อมูลนี้จะถูกนำไปใช้ในระบบเอกสารและพื้นที่ทำงานของพนักงานทุกคน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyEditForm company={activeCompany} />
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
