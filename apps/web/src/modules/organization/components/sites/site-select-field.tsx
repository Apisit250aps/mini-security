'use client';

import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from '@/shared/components/form/query-select-field';
import { useWatch } from 'react-hook-form';
import { useSitesQueries } from '../../hooks/organization-queries';

export function SiteSelectField<T extends FieldValues>({
  organizationId,
  ...props
}: QuerySelectFieldProps<T> & { organizationId?: string }) {
  const orgId = organizationId || '';
  const query = useSitesQueries(orgId);
  const selectedId = useWatch({ control: props.control, name: props.name });
  return (
    <QuerySelectField
      {...props}
      query={query}
      options={(query.data ?? [])
        .filter((site) => site.isActive || site.id === selectedId)
        .map((site) => ({ value: site.id, label: site.name }))}
    />
  );
}
