'use client';

import React from 'react';
import type { Organization } from '@repo/client';
import OrganizationForm, {
  type OrganizationFormValues,
} from './organization-form';
import { useOrganizationUpdate } from '../../hooks/organization-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function OrganizationEditForm({
  organization,
}: {
  organization?: Organization;
}) {
  const targetOrg = organization!;
  const ui = useOverlay();
  const updateMutation = useOrganizationUpdate();

  const handleSubmit = async (data: OrganizationFormValues) => {
    try {
      await updateMutation.mutateAsync({
        organizationId: targetOrg.id,
        data: {
          name: data.name,
          slug: data.slug,
          logo: data.logo || null,
          isActive: data.isActive,
        },
      });
      ui.hideAll();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <OrganizationForm
      defaultValues={{
        name: targetOrg.name,
        slug: targetOrg.slug,
        logo: targetOrg.logo ?? '',
        isActive: targetOrg.isActive,
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
    />
  );
}
