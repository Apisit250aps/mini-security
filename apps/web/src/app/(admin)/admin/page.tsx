'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import AdminDashboardView from '@/modules/admin/views/admin-dashboard-view';

export default function AdminPage() {
  return (
    <PageLayout pageId="adminDashboard">
      <AdminDashboardView />
    </PageLayout>
  );
}
