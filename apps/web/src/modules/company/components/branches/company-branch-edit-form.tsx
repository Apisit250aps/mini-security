'use client';

import React from 'react';
import type { CompanyBranch } from '@repo/domains/entities';
import CompanyBranchForm, {
  type CompanyBranchFormValues,
} from './company-branch-form';
import { useCompanyBranchUpdate } from '../../hooks/company-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function CompanyBranchEditForm({
  companyId,
  branch,
}: {
  companyId: string;
  branch: CompanyBranch;
}) {
  const ui = useOverlay();
  const updateMutation = useCompanyBranchUpdate(companyId);

  const handleSubmit = async (data: CompanyBranchFormValues) => {
    await updateMutation.mutateAsync({
      id: branch.id,
      data: {
        name: data.name,
        address: data.address || null,
        isActive: data.isActive,
      },
    });
    ui.hideAll();
  };

  return (
    <CompanyBranchForm
      defaultValues={{
        companyId: branch.companyId,
        name: branch.name,
        address: branch.address ?? '',
        isActive: branch.isActive,
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
    />
  );
}
