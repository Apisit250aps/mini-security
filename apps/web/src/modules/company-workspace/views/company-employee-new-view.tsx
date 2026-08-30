'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActiveCompany } from '../hooks/use-active-company';
import UserCreateForm from '@/modules/user/components/form/user-create-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function CompanyEmployeeNewView() {
  const router = useRouter();
  const { activeCompany, isLoading } = useActiveCompany();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลบริษัท...
        </span>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <p className="text-muted-foreground">ไม่พบข้อมูลบริษัท</p>
        <Link href="/company">
          <Button variant="outline">กลับหน้าหลัก</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link href="/company/employee">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft />
            กลับหน้ารายชื่อพนักงาน
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <CardTitle>
                สร้างบัญชีพนักงานใหม่ ({activeCompany.name})
              </CardTitle>
              <CardDescription>
                กรอกข้อมูลบัญชีผู้ใช้สำหรับพนักงาน
                โดยสามารถกำหนดบทบาทและสิทธิ์เพิ่มเติมได้ในภายหลัง
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserCreateForm onSuccess={() => router.push('/company/employee')} />
        </CardContent>
      </Card>
    </div>
  );
}
