'use client';

import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from '@/shared/components/form/query-select-field';
import { useWatch } from 'react-hook-form';
import { useCompanyBranchesQueries } from '../../hooks/company-queries';

export function CompanyBranchSelectField<T extends FieldValues>({
  companyId,
  ...props
}: QuerySelectFieldProps<T> & { companyId: string }) {
  const query = useCompanyBranchesQueries(companyId);
  const selectedId = useWatch({ control: props.control, name: props.name });
  return (
    <QuerySelectField
      {...props}
      query={query}
      options={(query.data ?? [])
        .filter((branch) => branch.isActive || branch.id === selectedId)
        .map((branch) => ({ value: branch.id, label: branch.name }))}
    />
  );
}
