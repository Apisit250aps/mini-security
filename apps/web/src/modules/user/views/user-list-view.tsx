'use client';
import React from 'react';
import UserDataTable from '../components/table/user-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
import UserCreateAction from '../components/user-create-action';

export default function UserListView() {
  return (
    <PageLayout pageId="user" actions={<UserCreateAction />}>
      <UserDataTable />
    </PageLayout>
  );
}
