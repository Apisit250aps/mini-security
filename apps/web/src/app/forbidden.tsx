'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@repo/ui/components/empty';
import { Button } from '@repo/ui/components/button';
import { ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';
import { buildPageUrl } from '@/shared/utils';

export default function Forbidden() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm ring-1 ring-destructive/10 sm:p-8">
        <Empty className="p-0 border-none">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-16 rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20"
            >
              <ShieldAlert className="size-8" />
            </EmptyMedia>
            <EmptyTitle className="text-xl font-bold tracking-tight text-destructive">
              403 - ไม่มีสิทธิ์เข้าถึง (Access Denied)
            </EmptyTitle>
            <EmptyDescription className="text-muted-foreground text-sm">
              บัญชีของคุณไม่มีสิทธิ์ในการเข้าถึงหรือจัดการข้อมูลในส่วนนี้
              หน้านี้สงวนไว้สำหรับผู้ที่มีสิทธิ์เฉพาะเท่านั้น
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="mt-4 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft data-icon="inline-start" className="size-4" />
              ย้อนกลับ
            </Button>
            <Link href={buildPageUrl('companyDashboard')} className="w-full">
              <Button className="w-full gap-2">
                ไปหน้าบริษัท
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
