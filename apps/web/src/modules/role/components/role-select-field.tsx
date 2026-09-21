'use client';

import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from '@/shared/components/form/query-select-field';
import { useGetOrganizationRoles } from '../hooks/role-queries';

export function RoleSelectField<T extends FieldValues = FieldValues>({
  organizationId,
  ...props
}: QuerySelectFieldProps<T> & {
  organizationId?: string;
}) {
  const orgId = organizationId || '';
  const query = useGetOrganizationRoles(orgId);
  return (
    <QuerySelectField
      {...props}
      query={query}
      options={(query.data ?? [])
        .filter(
          (role) =>
            role.roleType !== 'SUPER_ADMIN' &&
            (!role.organizationId || role.organizationId === orgId),
        )
        .map((role) => ({ value: role.id, label: role.name }))}
    />
  );
}
