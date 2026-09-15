'use client';

import React, { useMemo } from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { Sliders, CheckCircle2, DollarSign } from 'lucide-react';
import { useCompanyLeaveTypesQueries } from '../hooks/leave-queries';
import LeaveTypeDataTable from '../components/types/leave-type-data-table';
import LeaveTypeCreateAction from '../components/types/leave-type-create-action';

export default function CompanyLeaveTypeView() {
  const { activeCompanyId, isLoading } = useActiveCompany();
  const typesQuery = useCompanyLeaveTypesQueries(activeCompanyId || '');
  const types = useMemo(() => typesQuery.data || [], [typesQuery.data]);

  const activeCount = useMemo(
    () => types.filter((t) => t.isActive).length,
    [types],
  );
  const paidCount = useMemo(
    () => types.filter((t) => t.isPaid).length,
    [types],
  );

  const isPageLoading = isLoading || !activeCompanyId;

  return (
    <PageLayout
      pageId="companyLeaveType"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <LeaveTypeCreateAction companyId={activeCompanyId} />
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        <DashboardStatsGrid columns={3}>
          <MetricCard
            title="ประเภทการลาทั้งหมด"
            value={`${types.length} ประเภท`}
            icon={Sliders}
            description="นโยบายสิทธิวันลาในบริษัท"
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

        <LeaveTypeDataTable companyId={activeCompanyId} />
      </div>
    </PageLayout>
  );
}
