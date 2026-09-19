'use client';

import React, { useMemo } from 'react';
import { useActiveCompany } from '../hooks/use-active-company';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import RoleDataTable from '@/modules/role/components/table/role-data-table';
import RoleCreateAction from '@/modules/role/components/role-create-action';
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
import { ShieldCheck, Shield, Lock } from 'lucide-react';

export default function CompanyRoleView() {
  const { activeCompany, activeCompanyId, isLoading } = useActiveCompany();
  const rolesQuery = useCompanyRolesQueries(activeCompanyId || '');
  const roles = useMemo(() => rolesQuery.data || [], [rolesQuery.data]);

  const systemDefaultCount = useMemo(
    () => roles.filter((r) => r.isSystemDefault).length,
    [roles],
  );
  const customRoleCount = useMemo(
    () => roles.filter((r) => !r.isSystemDefault).length,
    [roles],
  );

  return (
    <PageLayout
      pageId="companyRole"
      isLoading={isLoading}
      actions={
        activeCompany && <RoleCreateAction companyId={activeCompanyId} />
      }
    >
      {!activeCompany ? (
        <Empty className="py-16 border rounded-xl bg-card">
          <EmptyMedia variant="icon">
            <ShieldCheck className="size-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>ไม่พบบริษัทที่สังกัด</EmptyTitle>
            <EmptyDescription>
              กรุณาเลือกหรือสร้างบริษัทก่อนดำเนินการจัดการบทบาท
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-6">
          <DashboardStatsGrid columns={3}>
            <MetricCard
              title="บทบาททั้งหมด (Total Roles)"
              value={`${roles.length} บทบาท`}
              icon={ShieldCheck}
              description="บทบาทและสิทธิ์ที่ใช้งานในองค์กร"
            />
            <MetricCard
              title="บทบาทเฉพาะองค์กร (Custom)"
              value={`${customRoleCount} บทบาท`}
              icon={Shield}
              trend={{
                value: `${customRoleCount}`,
                isPositive: true,
                label: 'กำหนดเอง',
              }}
              description="บทบาทที่สร้างขึ้นสำหรับองค์กรนี้"
            />
            <MetricCard
              title="บทบาทมาตรฐาน (System)"
              value={`${systemDefaultCount} บทบาท`}
              icon={Lock}
              description="บทบาทพื้นฐานที่ระบบกำหนดให้"
            />
          </DashboardStatsGrid>

          <Card>
            <CardHeader>
              <CardTitle>บทบาททั้งหมด (Roles)</CardTitle>
              <CardDescription>
                รายการบทบาทและตำแหน่งพนักงานเฉพาะสำหรับองค์กร{' '}
                {activeCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleDataTable companyId={activeCompanyId} />
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
