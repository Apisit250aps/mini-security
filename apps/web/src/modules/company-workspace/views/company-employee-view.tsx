'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useActiveCompany } from '../hooks/use-active-company';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import CompanyMemberDataTable from '@/modules/company/components/members/company-member-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { UserPlus, Users, UserCheck, Shield } from 'lucide-react';
import { buildPageUrl } from '@/shared/utils';

export default function CompanyEmployeeView() {
  const { activeCompany, activeCompanyId, isLoading } = useActiveCompany();
  const membersQuery = useCompanyMembersQueries(activeCompanyId || '');
  const members = useMemo(() => membersQuery.data || [], [membersQuery.data]);

  const activeCount = useMemo(
    () => members.filter((m) => m.isActive).length,
    [members],
  );
  const distinctRoles = useMemo(
    () => new Set(members.map((m) => m.roleId).filter(Boolean)).size,
    [members],
  );

  return (
    <PageLayout
      pageId="companyEmployee"
      isLoading={isLoading}
      actions={
        activeCompany && (
          <Link href={buildPageUrl('companyEmployeeNew')}>
            <Button className="gap-2">
              <UserPlus className="size-4" />
              เพิ่มพนักงานใหม่
            </Button>
          </Link>
        )
      }
    >
      {!activeCompany ? (
        <Empty className="py-16 border rounded-xl bg-card">
          <EmptyMedia variant="icon">
            <Users className="size-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>ไม่พบบริษัทที่สังกัด</EmptyTitle>
            <EmptyDescription>
              กรุณาเลือกหรือสร้างบริษัทก่อนดำเนินการจัดการพนักงาน
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-6">
          <DashboardStatsGrid columns={3}>
            <MetricCard
              title="พนักงานทั้งหมด"
              value={`${members.length} คน`}
              icon={Users}
              description="จำนวนพนักงานทั้งหมดในสังกัด"
            />
            <MetricCard
              title="สถานะปกติ (Active)"
              value={`${activeCount} คน`}
              icon={UserCheck}
              trend={{
                value: `${activeCount}`,
                isPositive: true,
                label: 'พร้อมปฏิบัติงาน',
              }}
              description="พนักงานที่มีสถานะเปิดใช้งาน"
            />
            <MetricCard
              title="บทบาทหน้าที่ (Roles)"
              value={`${distinctRoles} ตำแหน่ง`}
              icon={Shield}
              description="จำนวนตำแหน่งงานที่มีการมอบหมาย"
            />
          </DashboardStatsGrid>

          <Card>
            <CardHeader>
              <CardTitle>พนักงานทั้งหมด</CardTitle>
              <CardDescription>
                รายการพนักงานและบทบาทหน้าที่ในบริษัท {activeCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyMemberDataTable companyId={activeCompanyId} />
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
