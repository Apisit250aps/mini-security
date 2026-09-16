import React from 'react';
import FormPlanDetailView from '@/modules/form/views/form-plan-detail-view';

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = React.use(params);
  return <FormPlanDetailView planId={planId} />;
}
