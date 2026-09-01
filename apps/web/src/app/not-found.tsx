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
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm ring-1 ring-foreground/5 sm:p-8">
        <Empty className="p-0 border-none">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-16 rounded-2xl bg-muted/80 ring-1 ring-foreground/10 text-muted-foreground"
            >
              <FileQuestion className="size-8" />
            </EmptyMedia>
            <EmptyTitle className="text-xl font-bold tracking-tight">
              404 - ไม่พบหน้าที่คุณต้องการ
            </EmptyTitle>
            <EmptyDescription className="text-muted-foreground text-sm">
              ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา หน้าดังกล่าวอาจถูกย้าย ลบ
              หรือที่อยู่ URL ไม่ถูกต้อง
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
            <Link href="/" className="w-full">
              <Button className="w-full gap-2">
                <Home data-icon="inline-start" className="size-4" />
                หน้าหลัก
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
