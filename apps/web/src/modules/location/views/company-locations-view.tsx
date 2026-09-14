'use client';

import Link from 'next/link';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useHasPermission } from '@/modules/auth/hooks/permission-provider';
import { useCompanyBranchesQueries } from '@/modules/company/hooks/company-queries';
import { Alert, AlertTitle, AlertDescription } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import { useCompanyLocations } from '../hooks/location-queries';
import LocationTable from '../components/location-table';

function CompanyLocations({ companyId }: { companyId: string }) {
  const locations = useCompanyLocations(companyId);
  const branches = useCompanyBranchesQueries(companyId);
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
        <div className="flex flex-col gap-4">
          <Alert>
            <AlertTitle>ตั้งค่าตำแหน่งการเข้างานใน Slots</AlertTitle>
            <AlertDescription>
              <Link href="/company/attendance/schedules" className="underline">
                ไปที่ตารางเวลาเช็คชื่อ → ตั้งค่า Slots → ตำแหน่งการเข้างาน
              </Link>
            </AlertDescription>
          </Alert>
          <LocationTable
            locations={locations.data ?? []}
            branches={branches.data ?? []}
          />
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
        <p>ไม่พบองค์กรหรือไม่มีสิทธิ์ดูสถานที่</p>
      </PageLayout>
    );
  return <CompanyLocations key={activeCompanyId} companyId={activeCompanyId} />;
}
