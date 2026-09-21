'use client';

import React, { useMemo } from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { Sliders, CheckCircle2, DollarSign } from 'lucide-react';
import { useOrganizationLeaveTypesQueries } from '../hooks/leave-queries';
import LeaveTypeDataTable from '../components/types/leave-type-data-table';
import LeaveTypeCreateAction from '../components/types/leave-type-create-action';

export default function OrganizationLeaveTypeView() {
  const { activeOrganizationId, isLoading } = useActiveOrganization();
  const typesQuery = useOrganizationLeaveTypesQueries(
    activeOrganizationId || '',
  );
  const types = useMemo(() => typesQuery.data || [], [typesQuery.data]);

  const activeCount = useMemo(
    () => types.filter((t) => t.isActive).length,
    [types],
  );
  const paidCount = useMemo(
    () => types.filter((t) => t.isPaid).length,
    [types],
  );

  const isPageLoading = isLoading || !activeOrganizationId;

  return (
    <PageLayout
      pageId="organizationLeaveType"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <LeaveTypeCreateAction organizationId={activeOrganizationId} />
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        <DashboardStatsGrid columns={3}>
          <MetricCard
            title="ประเภทการลาทั้งหมด"
            value={`${types.length} ประเภท`}
            icon={Sliders}
            description="นโยบายสิทธิวันลาในองค์กร"
          />
          <MetricCard
            title="เปิดใช้งาน (Active)"
            value={`${activeCount} ประเภท`}
            icon={CheckCircle2}
            trend={{
              value: `${activeCount}`,
              isPositive: true,
              label: 'พร้อมให้พนักงานยื่นลา',
            }}
            description="นโยบายที่พนักงานสามารถเลือกใช้ได้"
          />
          <MetricCard
            title="ได้รับค่าจ้าง (Paid Leave)"
            value={`${paidCount} ประเภท`}
            icon={DollarSign}
            description="วันลาที่คำนวณจ่ายค่าจ้างตามกฎหมาย"
          />
        </DashboardStatsGrid>

        <LeaveTypeDataTable organizationId={activeOrganizationId} />
      </div>
    </PageLayout>
  );
}
