'use client';

import React from 'react';
import OrganizationDetailView from '@/modules/organization/views/organization-detail-view';

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <OrganizationDetailView organizationId={id} />;
}
