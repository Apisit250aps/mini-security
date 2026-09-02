'use client';

import React from 'react';
import CompanyBranchForm, {
  type CompanyBranchFormValues,
} from './company-branch-form';
import { useCompanyBranchCreate } from '../../hooks/company-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function CompanyBranchAddForm({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();
  const createMutation = useCompanyBranchCreate(companyId);

  const handleSubmit = async (data: CompanyBranchFormValues) => {
    await createMutation.mutateAsync({
      companyId,
      name: data.name,
      address: data.address || null,
      isActive: data.isActive ?? true,
    });
    ui.hideAll();
  };

  return (
    <CompanyBranchForm
      defaultValues={{
        companyId,
        name: '',
        address: '',
        isActive: true,
      }}
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending}
    />
  );
}
