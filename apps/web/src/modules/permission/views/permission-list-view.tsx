'use client';

import React, { useMemo } from 'react';
import PermissionDataTable from '../components/table/permission-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
import PermissionCreateAction from '../components/permission-create-action';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { KeyRound, Boxes, ShieldCheck } from 'lucide-react';
import { usePermissionListQueries } from '../hooks/permission-queries';

export default function PermissionListView() {
  const permissionsQuery = usePermissionListQueries();
  const permissions = useMemo(
    () => permissionsQuery.data || [],
    [permissionsQuery.data],
  );

  const uniqueModules = useMemo(
    () => new Set(permissions.map((p) => p.module).filter(Boolean)).size,
    [permissions],
  );

  return (
    <PageLayout pageId="permission" actions={<PermissionCreateAction />}>
      <div className="flex flex-col gap-6">
        <DashboardStatsGrid columns={3}>
          <MetricCard
            title="สิทธิ์ทั้งหมด (Permissions)"
            value={`${permissions.length} รายการ`}
            icon={KeyRound}
            description="สิทธิ์การดำเนินการทั้งหมดในระบบ"
          />
          <MetricCard
            title="โมดูลในระบบ (Modules)"
            value={`${uniqueModules} โมดูล`}
            icon={Boxes}
            trend={{
              value: `${uniqueModules}`,
              isPositive: true,
              label: 'ครอบคลุมทุกส่วน',
            }}
            description="กลุ่มการทำงานที่ควบคุมการเข้าถึง"
          />
          <MetricCard
            title="การควบคุมสิทธิ์ (Access Control)"
            value="Active"
            icon={ShieldCheck}
            description="ระบบ RBAC บังคับใช้สิทธิ์ตามโมดูล"
          />
        </DashboardStatsGrid>

        <PermissionDataTable />
      </div>
    </PageLayout>
  );
}

