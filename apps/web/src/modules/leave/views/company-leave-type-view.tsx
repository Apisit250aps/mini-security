'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import LeaveTypeDataTable from '../components/types/leave-type-data-table';
import LeaveTypeCreateAction from '../components/types/leave-type-create-action';

export default function CompanyLeaveTypeView() {
  const { activeCompanyId, isLoading } = useActiveCompany();

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
      <LeaveTypeDataTable companyId={activeCompanyId} />
    </PageLayout>
  );
}
