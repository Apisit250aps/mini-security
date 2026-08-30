'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { Spinner } from '@repo/ui/components/spinner';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { ShieldAlert, ArrowRight, LogIn } from 'lucide-react';
import { buildPageUrl } from '@/shared/utils';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { status, isSuperAdmin } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          กำลังตรวจสอบสิทธิ์การเข้าถึง...
        </p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center items-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-2">
              <LogIn className="size-6 text-muted-foreground" />
            </div>
            <CardTitle>กรุณาเข้าสู่ระบบ</CardTitle>
            <CardDescription>
              คุณจำเป็นต้องเข้าสู่ระบบก่อนเข้าใช้งานส่วนผู้ดูแลระบบ
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href={buildPageUrl('signIn')}>
              <Button className="gap-2">
                <LogIn className="size-4" />
                เข้าสู่ระบบ
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/30">
          <CardHeader className="text-center items-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <ShieldAlert className="size-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">
              ไม่มีสิทธิ์เข้าถึงส่วนนี้ (Access Denied)
            </CardTitle>
            <CardDescription>
              หน้านี้สงวนไว้สำหรับผู้ดูแลระบบสูงสุด (Super Admin / isAdmin
              เท่านั้น)
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            บัญชีของคุณไม่มีสิทธิ์ในการจัดการระบบส่วนกลาง
            คุณสามารถเข้าใช้งานในส่วนของบริษัทได้
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href={buildPageUrl('companyDashboard')}>
              <Button variant="outline" className="gap-2">
                ไปยังหน้าบริษัท
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
