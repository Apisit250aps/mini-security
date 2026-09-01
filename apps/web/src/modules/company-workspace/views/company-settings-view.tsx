'use client';

import React from 'react';
import { useActiveCompany } from '../hooks/use-active-company';
import CompanyEditForm from '@/modules/company/components/form/company-edit-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Spinner } from '@repo/ui/components/spinner';
import { Building2 } from 'lucide-react';

export default function CompanySettingsView() {
  const { activeCompany, isLoading } = useActiveCompany();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลการตั้งค่า...
        </span>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <Building2 className="size-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">ไม่พบข้อมูลบริษัท</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          ตั้งค่าข้อมูลองค์กร
        </h1>
        <p className="text-sm text-muted-foreground">
          แก้ไขรายละเอียดพื้นฐาน เช่น ชื่อบริษัท, Slug, Logo URL
          และสถานะเปิด/ปิดใช้งาน
        </p>
      </div>

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
  );
}
