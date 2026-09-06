'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import ScheduleDataTable from '../components/schedules/schedule-data-table';
import ScheduleCreateAction from '../components/schedules/schedule-create-action';

export default function CompanyAttendanceScheduleView() {
  const { activeCompanyId, isLoading } = useActiveCompany();

  if (isLoading || !activeCompanyId) {
    return (
      <PageLayout pageId="companyAttendanceSchedule">
        <div className="p-8 text-center text-muted-foreground">
          กำลังโหลดข้อมูลองค์กร...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      pageId="companyAttendanceSchedule"
      actions={<ScheduleCreateAction companyId={activeCompanyId} />}
    >
      <ScheduleDataTable companyId={activeCompanyId} />
    </PageLayout>
  );
}
