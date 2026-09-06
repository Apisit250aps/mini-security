'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import LeaveTypeDataTable from '../components/types/leave-type-data-table';
import LeaveTypeCreateAction from '../components/types/leave-type-create-action';

export default function CompanyLeaveTypeView() {
  const { activeCompanyId, isLoading } = useActiveCompany();

  if (isLoading || !activeCompanyId) {
    return (
      <PageLayout pageId="companyLeaveType">
        <div className="p-8 text-center text-muted-foreground">
          กำลังโหลดข้อมูลองค์กร...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      pageId="companyLeaveType"
      actions={<LeaveTypeCreateAction companyId={activeCompanyId} />}
    >
      <LeaveTypeDataTable companyId={activeCompanyId} />
    </PageLayout>
  );
}
