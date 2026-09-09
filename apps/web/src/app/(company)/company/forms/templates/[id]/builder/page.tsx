'use client';

import React from 'react';
import FormBuilderView from '@/modules/form/views/form-builder-view';

export default function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <FormBuilderView templateId={id} />;
}
