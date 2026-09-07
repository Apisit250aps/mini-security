'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import AttendanceLogDataTable from '../components/logs/attendance-log-data-table';
import CheckInAction from '../components/logs/check-in-action';
import ManualCheckInAction from '../components/logs/manual-check-in-action';

export default function CompanyAttendanceLogView() {
  const { activeCompanyId, isLoading } = useActiveCompany();

  const isPageLoading = isLoading || !activeCompanyId;

  return (
    <PageLayout
      pageId="companyAttendanceLog"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <div className="flex items-center gap-2">
            <CheckInAction companyId={activeCompanyId} />
            <ManualCheckInAction companyId={activeCompanyId} />
          </div>
        ) : null
      }
    >
      <AttendanceLogDataTable companyId={activeCompanyId} />
    </PageLayout>
  );
}
