import React from 'react';
import RoleDetailView from '@/modules/role/views/role-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <RoleDetailView roleId={id} />;
}
