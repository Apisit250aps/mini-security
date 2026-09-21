'use client';

import React, { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from '@/shared/components/form/query-select-field';
import { useOrganizationMembersQueries } from '../../hooks/organization-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';

export function OrganizationMemberSelectField<T extends FieldValues>({
  organizationId,
  ...props
}: QuerySelectFieldProps<T> & {
  organizationId?: string;
}) {
  const orgId = organizationId || '';
  const members = useOrganizationMembersQueries(orgId);
  const users = useUserListQueries();

  const options = useMemo(() => {
    const usersById = new Map(
      (users.data ?? []).map((user) => [user.id, user]),
    );
    return (members.data ?? []).map((member) => {
      const user = usersById.get(member.userId);
      return {
        value: member.id,
        label: user
          ? `${user.name} (${user.email})`
          : `พนักงาน #${member.id.slice(0, 6)}`,
      };
    });
  }, [members.data, users.data]);

  return (
    <QuerySelectField
      {...props}
      options={options}
      query={{
        isLoading: members.isLoading || users.isLoading,
        isError: members.isError || users.isError,
      }}
    />
  );
}
