'use client';
import React from 'react';
import UserDataTable from '../components/user-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';

export default function UserListView() {
  
  return <PageLayout pageId="user">
    <UserDataTable />
  </PageLayout>;
}
