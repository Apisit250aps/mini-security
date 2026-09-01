'use client';

import React from 'react';
import Link from 'next/link';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@repo/ui/components/empty';
import { Button } from '@repo/ui/components/button';
import { LogIn, Home } from 'lucide-react';
import { buildPageUrl } from '@/shared/utils';

export default function Unauthorized() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm ring-1 ring-foreground/5 sm:p-8">
        <Empty className="p-0 border-none">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20"
            >
              <LogIn className="size-8" />
            </EmptyMedia>
            <EmptyTitle className="text-xl font-bold tracking-tight">
              401 - กรุณาเข้าสู่ระบบ
            </EmptyTitle>
            <EmptyDescription className="text-muted-foreground text-sm">
              คุณจำเป็นต้องเข้าสู่ระบบก่อน เพื่อเข้าใช้งานหน้าดังกล่าว
              กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="mt-4 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Home data-icon="inline-start" className="size-4" />
                หน้าหลัก
              </Button>
            </Link>
            <Link href={buildPageUrl('signIn')} className="w-full">
              <Button className="w-full gap-2">
                <LogIn data-icon="inline-start" className="size-4" />
                เข้าสู่ระบบ
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
