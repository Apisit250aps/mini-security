'use client';

import type { FieldValues } from 'react-hook-form';
import { ComboboxField } from '@repo/ui/form';

export type QueryComboboxFieldProps<T extends FieldValues> = Omit<
  Parameters<typeof ComboboxField<T>>[0],
  'options' | 'isLoading' | 'loadError'
>;

export function QueryComboboxField<T extends FieldValues>({
  query,
  ...props
}: Parameters<typeof ComboboxField<T>>[0] & {
  query: { isLoading: boolean; isError: boolean };
}) {
  return (
    <ComboboxField
      {...props}
      isLoading={query.isLoading}
      loadError={query.isError}
    />
  );
}
