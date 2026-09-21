'use client';

import React from 'react';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { Spinner } from '@repo/ui/components/spinner';
import { unauthorized } from 'next/navigation';

export function OrganizationGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลพื้นที่ทำงานองค์กร...
        </p>
      </div>
    );
  }
  if (status === 'unauthenticated') {
    unauthorized();
  }
  return <>{children}</>;
}
export default OrganizationGuard;
