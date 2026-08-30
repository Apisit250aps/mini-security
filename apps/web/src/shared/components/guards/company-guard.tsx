'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { Spinner } from '@repo/ui/components/spinner';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { LogIn } from 'lucide-react';

export function CompanyGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลพื้นที่ทำงานบริษัท...
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
              คุณจำเป็นต้องเข้าสู่ระบบก่อนเข้าใช้งานพื้นที่ทำงานบริษัท
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/signin">
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

  return <>{children}</>;
}
