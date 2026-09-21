'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import AttendanceLogDataTable from '../components/logs/attendance-log-data-table';
import CheckInAction from '../components/logs/check-in-action';
import ManualCheckInAction from '../components/logs/manual-check-in-action';

export default function OrganizationAttendanceLogView() {
  const { activeOrganizationId, isLoading } = useActiveOrganization();

  const isPageLoading = isLoading || !activeOrganizationId;

  return (
    <PageLayout
      pageId="organizationAttendanceLog"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <div className="flex items-center gap-2">
            <CheckInAction organizationId={activeOrganizationId} />
            <ManualCheckInAction organizationId={activeOrganizationId} />
          </div>
        ) : null
      }
    >
      <AttendanceLogDataTable organizationId={activeOrganizationId} />
    </PageLayout>
  );
}
