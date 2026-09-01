'use client';

import React from 'react';
import CompanyForm, { CompanyFormValues } from './company-form';
import { useCompanyCreate } from '../../hooks/company-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function CompanyCreateForm() {
  const ui = useOverlay();
  const createMutation = useCompanyCreate();

  const handleSubmit = async (data: CompanyFormValues) => {
    await createMutation.mutateAsync({
      name: data.name,
      slug: data.slug,
      logo: data.logo || null,
      isActive: data.isActive ?? true,
    });
    ui.hideAll();
  };

  return (
    <CompanyForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
  );
}
