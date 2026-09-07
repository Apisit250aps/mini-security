'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import ScheduleDataTable from '../components/schedules/schedule-data-table';
import ScheduleCreateAction from '../components/schedules/schedule-create-action';

export default function CompanyAttendanceScheduleView() {
  const { activeCompanyId, isLoading } = useActiveCompany();

  const isPageLoading = isLoading || !activeCompanyId;

  return (
    <PageLayout
      pageId="companyAttendanceSchedule"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <ScheduleCreateAction companyId={activeCompanyId} />
        ) : null
      }
    >
      <ScheduleDataTable companyId={activeCompanyId} />
    </PageLayout>
  );
}
