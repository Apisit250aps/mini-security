'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import { Spinner } from '@repo/ui/components/spinner';
import { ArrowLeft, Lock } from 'lucide-react';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useCompanyAvailableFeaturesQueries } from '@/modules/feature/hooks/feature-queries';
import { buildPageUrl } from '@/shared/utils';

interface CompanyFeatureGuardProps {
  featureCode: string;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function CompanyFeatureGuard({
  featureCode,
  children,
  fallbackTitle = 'ฟีเจอร์นี้ยังไม่เปิดใช้งานสำหรับบริษัทของคุณ',
  fallbackDescription = 'บริษัทของคุณยังไม่ได้รับสิทธิ์เข้าถึงโมดูลนี้ หรือถูกปิดการใช้งานโดยผู้ดูแลระบบ กรุณาติดต่อผู้ดูแลระบบหากต้องการใช้งานฟีเจอร์นี้',
}: CompanyFeatureGuardProps) {
  const {
    activeCompanyId,
    isSuperAdmin,
    isLoading: isCompanyLoading,
  } = useActiveCompany();

  const availableFeaturesQuery =
    useCompanyAvailableFeaturesQueries(activeCompanyId);

  const hasAccess = useMemo(() => {
    if (isSuperAdmin) return true;
    if (!availableFeaturesQuery.data) return false;
    return availableFeaturesQuery.data.some(
      (f) => f.code === featureCode && f.isActive,
    );
  }, [isSuperAdmin, availableFeaturesQuery.data, featureCode]);

  const isLoading = isCompanyLoading || availableFeaturesQuery.isLoading;

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
              <Link href={buildPageUrl('companyDashboard')}>
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

export default CompanyFeatureGuard;
