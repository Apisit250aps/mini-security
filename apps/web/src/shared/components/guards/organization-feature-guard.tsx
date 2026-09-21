'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import { Spinner } from '@repo/ui/components/spinner';
import { ArrowLeft, Lock } from 'lucide-react';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import { useOrganizationAvailableFeaturesQueries } from '@/modules/feature/hooks/feature-queries';
import { buildPageUrl } from '@/shared/utils';

interface OrganizationFeatureGuardProps {
  featureCode: string;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function OrganizationFeatureGuard({
  featureCode,
  children,
  fallbackTitle = 'ฟีเจอร์นี้ยังไม่เปิดใช้งานสำหรับองค์กรของคุณ',
  fallbackDescription = 'องค์กรของคุณยังไม่ได้รับสิทธิ์เข้าถึงโมดูลนี้ หรือถูกปิดการใช้งานโดยผู้ดูแลระบบ กรุณาติดต่อผู้ดูแลระบบหากต้องการใช้งานฟีเจอร์นี้',
}: OrganizationFeatureGuardProps) {
  const {
    activeOrganizationId,
    isSuperAdmin,
    isLoading: isOrganizationLoading,
  } = useActiveOrganization();

  const availableFeaturesQuery =
    useOrganizationAvailableFeaturesQueries(activeOrganizationId);

  const hasAccess = useMemo(() => {
    if (isSuperAdmin) return true;
    if (!availableFeaturesQuery.data) return false;
    return availableFeaturesQuery.data.some(
      (f) => f.code === featureCode && f.isActive,
    );
  }, [isSuperAdmin, availableFeaturesQuery.data, featureCode]);

  const isLoading = isOrganizationLoading || availableFeaturesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          กำลังตรวจสอบสิทธิ์การเข้าถึงฟีเจอร์...
        </p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/80 shadow-xs">
          <CardContent className="flex flex-col items-center text-center p-8 gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
              <Lock className="size-6" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold tracking-tight">
                {fallbackTitle}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fallbackDescription}
              </p>
            </div>

            <div className="pt-2">
              <Link href={buildPageUrl('organizationDashboard')}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="size-4" />
                  กลับสู่หน้าแดชบอร์ด
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
export default OrganizationFeatureGuard;
