'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import LeaveRequestDataTable from '../components/requests/leave-request-data-table';
import LeaveRequestSubmitAction from '../components/requests/leave-request-submit-action';

export default function CompanyLeaveRequestView() {
  const { activeCompanyId, isLoading } = useActiveCompany();

  const isPageLoading = isLoading || !activeCompanyId;

  return (
    <PageLayout
      pageId="companyLeaveRequest"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <LeaveRequestSubmitAction companyId={activeCompanyId} />
        ) : null
      }
    >
      <LeaveRequestDataTable companyId={activeCompanyId} />
    </PageLayout>
  );
}
