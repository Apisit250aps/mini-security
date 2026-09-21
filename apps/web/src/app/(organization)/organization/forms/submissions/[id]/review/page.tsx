'use client';

import React from 'react';
import FormReviewView from '@/modules/form/views/form-review-view';

export default function FormReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <FormReviewView submissionId={id} />;
}
