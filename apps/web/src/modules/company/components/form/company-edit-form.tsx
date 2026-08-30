'use client';

import React from 'react';
import type { Company } from '@repo/domains/entities';
import CompanyForm, { CompanyFormValues } from './company-form';
import { useCompanyUpdate } from '../../hooks/company-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function CompanyEditForm({ company }: { company: Company }) {
  const ui = useOverlay();
  const updateMutation = useCompanyUpdate();

  const handleSubmit = async (data: CompanyFormValues) => {
    await updateMutation.mutateAsync({
      companyId: company.id,
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo || null,
        isActive: data.isActive,
      },
    });
    ui.hideAll();
  };

  return (
    <CompanyForm
      defaultValues={{
        name: company.name,
        slug: company.slug,
        logo: company.logo ?? '',
        isActive: company.isActive,
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
    />
  );
}
