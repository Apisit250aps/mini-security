'use client';

import React, { useMemo } from 'react';
import RoleDataTable from '../components/table/role-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
import RoleCreateAction from '../components/role-create-action';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { ShieldCheck, Lock, Shield } from 'lucide-react';
import { useRoleListQueries } from '../hooks/role-queries';

export default function RoleListView() {
  const rolesQuery = useRoleListQueries();
  const roles = useMemo(() => rolesQuery.data || [], [rolesQuery.data]);

  const systemCount = useMemo(
    () => roles.filter((r) => r.isSystemDefault).length,
    [roles],
  );
  const customCount = useMemo(
    () => roles.filter((r) => !r.isSystemDefault).length,
    [roles],
  );

  return (
    <PageLayout pageId="role" actions={<RoleCreateAction />}>
      <div className="flex flex-col gap-6">
        <DashboardStatsGrid columns={3}>
          <MetricCard
            title="บทบาททั้งหมด (Total Roles)"
            value={`${roles.length} บทบาท`}
            icon={ShieldCheck}
            description="บทบาทสิทธิ์ทั้งหมดที่กำหนดในระบบ"
          />
          <MetricCard
            title="บทบาทมาตรฐาน (System Default)"
            value={`${systemCount} บทบาท`}
            icon={Lock}
            description="บทบาทพื้นฐานของระบบส่วนกลาง"
          />
          <MetricCard
            title="บทบาทกำหนดเอง (Custom Roles)"
            value={`${customCount} บทบาท`}
            icon={Shield}
            trend={{
              value: `${customCount}`,
              isPositive: true,
              label: 'ปรับแต่งแล้ว',
            }}
            description="บทบาทที่ถูกสร้างเพิ่มเติมตามองค์กร"
          />
        </DashboardStatsGrid>

        <RoleDataTable />
      </div>
    </PageLayout>
  );
}

