'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import FormSubmissionDataTable from '../components/submission/form-submission-data-table';
import FormSubmissionStartAction from '../components/submission/form-submission-start-action';

export default function FormSubmissionsView() {
  const { activeCompanyId, isLoading } = useActiveCompany();

  const isPageLoading = isLoading || !activeCompanyId;

  return (
    <PageLayout
      pageId="companyFormSubmissions"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <FormSubmissionStartAction companyId={activeCompanyId} />
        ) : null
      }
    >
      <FormSubmissionDataTable companyId={activeCompanyId} />
    </PageLayout>
  );
}
