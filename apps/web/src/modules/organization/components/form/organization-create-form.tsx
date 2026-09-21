'use client';

import React from 'react';
import OrganizationForm, {
  type OrganizationFormValues,
} from './organization-form';
import { useOrganizationCreate } from '../../hooks/organization-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function OrganizationCreateForm() {
  const ui = useOverlay();
  const createMutation = useOrganizationCreate();

  const handleSubmit = async (data: OrganizationFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        slug: data.slug,
        logo: data.logo || null,
        isActive: data.isActive ?? true,
      });
      ui.hideAll();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <OrganizationForm
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending}
    />
  );
}
