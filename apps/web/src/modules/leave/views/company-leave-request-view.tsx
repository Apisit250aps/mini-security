'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import LeaveRequestDataTable from '../components/requests/leave-request-data-table';
import LeaveRequestSubmitAction from '../components/requests/leave-request-submit-action';

export default function CompanyLeaveRequestView() {
  const { activeCompanyId, isLoading } = useActiveCompany();

  if (isLoading || !activeCompanyId) {
    return (
      <PageLayout pageId="companyLeaveRequest">
        <div className="p-8 text-center text-muted-foreground">
          กำลังโหลดข้อมูลองค์กร...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      pageId="companyLeaveRequest"
      actions={<LeaveRequestSubmitAction companyId={activeCompanyId} />}
    >
      <LeaveRequestDataTable companyId={activeCompanyId} />
    </PageLayout>
  );
}
