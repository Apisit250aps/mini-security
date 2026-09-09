'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import FormTemplateDataTable from '../components/template/form-template-data-table';
import FormTemplateCreateAction from '../components/template/form-template-create-action';

export default function FormTemplatesView() {
  const { activeCompanyId, isLoading } = useActiveCompany();

  const isPageLoading = isLoading || !activeCompanyId;

  return (
    <PageLayout
      pageId="companyFormTemplates"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <FormTemplateCreateAction companyId={activeCompanyId} />
        ) : null
      }
    >
      <FormTemplateDataTable companyId={activeCompanyId} />
    </PageLayout>
  );
}
