'use client';

import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from '@/shared/components/form/query-select-field';
import { useAttendancePoliciesQueries } from '../../hooks/attendance-queries';

export function AttendancePolicySelectField<T extends FieldValues>({
  companyId,
  ...props
}: QuerySelectFieldProps<T> & { companyId: string }) {
  const query = useAttendancePoliciesQueries(companyId);
  return (
    <QuerySelectField
      {...props}
      query={query}
      options={(query.data ?? []).map((policy) => ({
        value: policy.id,
        label: policy.name,
      }))}
    />
  );
}
