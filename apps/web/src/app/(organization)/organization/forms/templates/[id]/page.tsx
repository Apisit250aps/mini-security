import React from 'react';
import FormDetailView from '@/modules/form/views/form-detail-view';

export default function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <FormDetailView templateId={id} />;
}
