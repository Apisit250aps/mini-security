'use client';

import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from '@/shared/components/form/query-select-field';
import { useUserListQueries } from '../hooks/user-queries';

export function UserSelectField<T extends FieldValues>(
  props: QuerySelectFieldProps<T>,
) {
  const query = useUserListQueries();
  return (
    <QuerySelectField
      {...props}
      query={query}
      options={(query.data ?? []).map((user) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
      }))}
    />
  );
}
