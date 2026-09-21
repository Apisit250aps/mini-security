'use client';

import React from 'react';
import type { Site } from '@repo/client';
import SiteForm, { type SiteFormValues } from './site-form';
import { useSiteUpdate } from '../../hooks/organization-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function SiteEditForm({
  organizationId,
  site,
}: {
  organizationId?: string;
  site?: Site;
}) {
  const targetSite = site!;
  const orgId = organizationId || targetSite.organizationId;
  const ui = useOverlay();
  const updateMutation = useSiteUpdate(orgId);

  const handleSubmit = async (data: SiteFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: targetSite.id,
        data: {
          name: data.name,
          address: data.address || null,
          isActive: data.isActive,
        },
      });
      ui.hideAll();
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <SiteForm
      defaultValues={{
        organizationId: targetSite.organizationId,
        name: targetSite.name,
        address: targetSite.address ?? '',
        isActive: targetSite.isActive,
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
    />
  );
}
