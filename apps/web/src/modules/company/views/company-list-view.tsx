'use client';

import React from 'react';
import CompanyDataTable from '../components/table/company-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
import CompanyCreateAction from '../components/company-create-action';

export default function CompanyListView() {
  return (
    <PageLayout pageId="company" actions={<CompanyCreateAction />}>
      <CompanyDataTable />
    </PageLayout>
  );
}
