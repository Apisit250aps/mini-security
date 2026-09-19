'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useHasPermission } from '@/modules/auth/hooks/permission-provider';
import { useCompanyBranchesQueries } from '@/modules/company/hooks/company-queries';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@repo/ui/components/empty';
import { Alert, AlertTitle, AlertDescription } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import { MapPin, Building2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useCompanyLocations } from '../hooks/location-queries';
import LocationTable from '../components/location-table';

function CompanyLocations({ companyId }: { companyId: string }) {
  const locations = useCompanyLocations(companyId);
  const branches = useCompanyBranchesQueries(companyId);

  const locationList = locations.data ?? [];
  const branchList = branches.data ?? [];

  const activeCount = useMemo(
    () => locationList.filter((l) => l.isActive).length,
    [locationList],
  );

  return (
    <PageLayout
      pageId="companyLocations"
      isLoading={locations.isLoading || branches.isLoading}
    >
      {locations.isError || branches.isError ? (
        <Alert variant="destructive">
          <AlertTitle>โหลดข้อมูลสถานที่ไม่สำเร็จ</AlertTitle>
          <AlertDescription>
            <Button
              variant="outline"
              onPress={() => {
                void locations.refetch();
                void branches.refetch();
              }}
            >
              ลองอีกครั้ง
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          <DashboardStatsGrid columns={3}>
            <MetricCard
              title="สถานที่ลงเวลาทั้งหมด"
              value={`${locationList.length} จุด`}
              icon={MapPin}
              description="จุดพิกัดเช็คชื่อที่กำหนดในระบบ"
            />
            <MetricCard
              title="เปิดใช้งาน (Active)"
              value={`${activeCount} จุด`}
              icon={CheckCircle2}
              trend={{
                value: `${activeCount}`,
                isPositive: true,
                label: 'พร้อมใช้งาน',
              }}
              description="จุดลงเวลาที่สามารถสแกนหรือเช็คอินได้"
            />
            <MetricCard
              title="สาขาที่รองรับ (Branches)"
              value={`${branchList.length} สาขา`}
              icon={Building2}
              description="จำนวนสาขาองค์กรที่ผูกสถานที่"
            />
          </DashboardStatsGrid>

          <Alert>
            <AlertTitle>ตั้งค่าตำแหน่งการเข้างานใน Slots</AlertTitle>
            <AlertDescription>
              <Link href="/company/attendance/schedules" className="underline">
                ไปที่ตารางเวลาเช็คชื่อ → ตั้งค่า Slots → ตำแหน่งการเข้างาน
              </Link>
            </AlertDescription>
          </Alert>

          <LocationTable locations={locationList} branches={branchList} />
        </div>
      )}
    </PageLayout>
  );
}

export default function CompanyLocationsView() {
  const { activeCompanyId, isLoading } = useActiveCompany();
  const canRead = useHasPermission('location:read');
  if (isLoading) return <PageLayout pageId="companyLocations" isLoading />;
  if (!canRead || !activeCompanyId)
    return (
      <PageLayout pageId="companyLocations">
        <Empty className="py-16 border rounded-xl bg-card">
          <EmptyMedia variant="icon">
            <ShieldAlert className="size-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>ไม่พบองค์กรหรือไม่มีสิทธิ์ดูสถานที่</EmptyTitle>
            <EmptyDescription>
              คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลสถานที่
              หรือยังไม่ได้เลือกองค์กรที่สังกัด
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageLayout>
    );
  return <CompanyLocations key={activeCompanyId} companyId={activeCompanyId} />;
}
