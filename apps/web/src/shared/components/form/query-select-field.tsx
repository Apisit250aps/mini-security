'use client';

import type { FieldValues } from 'react-hook-form';
import { SelectField } from '@repo/ui/form';

export type QuerySelectFieldProps<T extends FieldValues> = Omit<
  Parameters<typeof SelectField<T>>[0],
  'options' | 'isLoading' | 'loadError'
>;

export function QuerySelectField<T extends FieldValues>({
  query,
  ...props
}: Parameters<typeof SelectField<T>>[0] & {
  query: { isLoading: boolean; isError: boolean };
}) {
  return (
    <SelectField
      {...props}
      isLoading={query.isLoading}
      loadError={query.isError}
    />
  );
}
