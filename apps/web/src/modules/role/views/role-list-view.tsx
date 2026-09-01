'use client';

import React from 'react';
import RoleDataTable from '../components/table/role-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
import RoleCreateAction from '../components/role-create-action';

export default function RoleListView() {
  return (
    <PageLayout pageId="role" actions={<RoleCreateAction />}>
      <RoleDataTable />
    </PageLayout>
  );
}
