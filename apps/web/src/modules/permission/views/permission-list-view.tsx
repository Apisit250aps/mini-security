'use client';

import React from 'react';
import PermissionDataTable from '../components/table/permission-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
import PermissionCreateAction from '../components/permission-create-action';

export default function PermissionListView() {
  return (
    <PageLayout pageId="permission" actions={<PermissionCreateAction />}>
      <PermissionDataTable />
    </PageLayout>
  );
}
