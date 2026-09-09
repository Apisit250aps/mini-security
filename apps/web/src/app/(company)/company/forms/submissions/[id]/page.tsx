'use client';

import React from 'react';
import FormFillerView from '@/modules/form/views/form-filler-view';

export default function FormSubmissionFillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <FormFillerView submissionId={id} />;
}
