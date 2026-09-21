'use client';

import React from 'react';
import SiteForm, { type SiteFormValues } from './site-form';
import { useSiteCreate } from '../../hooks/organization-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function SiteAddForm({
  organizationId,
}: {
  organizationId?: string;
}) {
  const orgId = organizationId || '';
  const ui = useOverlay();
  const createMutation = useSiteCreate(orgId);

  const handleSubmit = async (data: SiteFormValues) => {
    try {
      await createMutation.mutateAsync({
        organizationId: orgId,
        name: data.name,
        address: data.address || null,
        isActive: data.isActive ?? true,
      });
      ui.hideAll();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <SiteForm
      defaultValues={{
        organizationId: orgId,
        name: '',
        address: '',
        isActive: true,
      }}
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending}
    />
  );
}
