import React from 'react';
import ScheduleDetailView from '@/modules/attendance/views/schedule-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScheduleDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ScheduleDetailView scheduleId={id} />;
}
