'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { SelectField } from '@repo/ui/form';
import { useOrganizationMemberUpdate } from '../../hooks/organization-mutations';
import type { Site, OrganizationMember } from '@repo/client';

type SiteFormValues = {
  siteId: string;
};

export default function OrganizationMemberSiteSelect({
  member,
  organizationId,
  sites,
}: {
  member: OrganizationMember;
  organizationId?: string;
  sites?: Site[];
}) {
  const orgId = organizationId || member.organizationId;
  const siteList = sites || [];
  const updateMutation = useOrganizationMemberUpdate(orgId);

  const activeSites = useMemo(() => {
    return siteList.filter((s) => s.isActive || s.id === member.siteId);
  }, [siteList, member.siteId]);

  const methods = useForm<SiteFormValues>({
    mode: 'onChange',
    defaultValues: {
      siteId: member.siteId || '',
    },
    values: {
      siteId: member.siteId || '',
    },
  });

  const onSubmit = React.useCallback(
    async (data: SiteFormValues) => {
      if (
        !data.siteId ||
        data.siteId === member.siteId ||
        updateMutation.isPending
      ) {
        return;
      }
      try {
        await updateMutation.mutateAsync({
          id: member.id,
          data: {
            siteId: data.siteId,
          },
        });
      } catch {
        methods.reset({ siteId: member.siteId || '' });
      }
    },
    [member.id, member.siteId, updateMutation, methods],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void methods.handleSubmit(onSubmit)(e);
      }}
      onChange={() => {
        void methods.handleSubmit(onSubmit)();
      }}
      className="w-44"
    >
      <SelectField
        control={methods.control}
        name="siteId"
        label="ไซต์"
        placeholder="เลือกไซต์..."
        disabled={updateMutation.isPending}
        options={activeSites.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        onValueChange={() => {
          void methods.handleSubmit(onSubmit)();
        }}
      />
    </form>
  );
}
