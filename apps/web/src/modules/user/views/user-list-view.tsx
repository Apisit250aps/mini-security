'use client';
import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useUserListQueries } from '../hooks/user-queries';
export default function UserListView() {
  const query = useUserListQueries();
  return <PageLayout pageId="user">UserListView</PageLayout>;
}
