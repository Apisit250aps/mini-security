'use client';

import React from 'react';
import OrganizationDataTable from '../components/table/organization-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
import OrganizationCreateAction from '../components/organization-create-action';

export default function OrganizationListView() {
  return (
    <PageLayout pageId="organization" actions={<OrganizationCreateAction />}>
      <OrganizationDataTable />
    </PageLayout>
  );
}
