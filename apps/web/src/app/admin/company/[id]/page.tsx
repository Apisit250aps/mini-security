'use client';

import React from 'react';
import CompanyDetailView from '@/modules/company/views/company-detail-view';

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <CompanyDetailView companyId={id} />;
}
