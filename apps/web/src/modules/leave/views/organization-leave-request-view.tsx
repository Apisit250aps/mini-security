'use client';

import React, { useMemo } from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { CalendarRange, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useOrganizationLeaveRequestsQueries } from '../hooks/leave-queries';
import LeaveRequestDataTable from '../components/requests/leave-request-data-table';
import LeaveRequestSubmitAction from '../components/requests/leave-request-submit-action';

export default function OrganizationLeaveRequestView() {
  const { activeOrganizationId, isLoading } = useActiveOrganization();
  const requestsQuery = useOrganizationLeaveRequestsQueries(
    activeOrganizationId || '',
  );
  const requests = requestsQuery.data || [];

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests],
  );
  const approvedCount = useMemo(
    () => requests.filter((r) => r.status === 'approved').length,
    [requests],
  );
  const rejectedCount = useMemo(
    () => requests.filter((r) => r.status === 'rejected').length,
    [requests],
  );

  const isPageLoading = isLoading || !activeOrganizationId;

  return (
    <PageLayout
      pageId="organizationLeaveRequest"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <LeaveRequestSubmitAction organizationId={activeOrganizationId} />
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        <DashboardStatsGrid columns={4}>
          <MetricCard
            title="คำขอลาทั้งหมด"
            value={`${requests.length} รายการ`}
            icon={CalendarRange}
            description="คำขอลาทั้งหมดในองค์กร"
          />
          <MetricCard
            title="รอพิจารณา (Pending)"
            value={`${pendingCount} รายการ`}
            icon={Clock}
            trend={{
              value: `${pendingCount}`,
              isPositive: pendingCount === 0,
              label: 'รออนุมัติ',
            }}
            description="คำขอลาที่ต้องพิจารณา"
          />
          <MetricCard
            title="อนุมัติแล้ว (Approved)"
            value={`${approvedCount} รายการ`}
            icon={CheckCircle2}
            trend={{
              value: `${approvedCount}`,
              isPositive: true,
              label: 'ผ่านการอนุมัติ',
            }}
            description="คำขอลาที่ได้รับอนุมัติ"
          />
          <MetricCard
            title="ไม่อนุมัติ (Rejected)"
            value={`${rejectedCount} รายการ`}
            icon={XCircle}
            trend={{
              value: `${rejectedCount}`,
              isPositive: false,
              label: 'ถูกปฏิเสธ',
            }}
            description="คำขอลาที่ไม่ผ่านเกณฑ์"
          />
        </DashboardStatsGrid>

        <LeaveRequestDataTable organizationId={activeOrganizationId} />
      </div>
    </PageLayout>
  );
}
