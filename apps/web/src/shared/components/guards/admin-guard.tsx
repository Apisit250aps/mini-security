'use client';

import React from 'react';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { Spinner } from '@repo/ui/components/spinner';
import { unauthorized, forbidden } from 'next/navigation';

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
    unauthorized();
  }

  if (!isSuperAdmin) {
    forbidden();
  }

  return <>{children}</>;
}
