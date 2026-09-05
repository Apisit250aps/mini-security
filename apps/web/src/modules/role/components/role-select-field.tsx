'use client';

import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from '@/shared/components/form/query-select-field';
import { useCompanyRolesQueries } from '../hooks/role-queries';

export function RoleSelectField<T extends FieldValues>({
  companyId,
  ...props
}: QuerySelectFieldProps<T> & { companyId: string }) {
  const query = useCompanyRolesQueries(companyId);
  return (
    <QuerySelectField
      {...props}
      query={query}
      options={(query.data ?? [])
        .filter(
          (role) =>
            role.roleType !== 'SUPER_ADMIN' &&
            (!role.companyId || role.companyId === companyId),
        )
        .map((role) => ({ value: role.id, label: role.name }))}
    />
  );
}
