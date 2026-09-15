'use client';

import React, { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from './query-select-field';
import {
  QueryComboboxField,
  type QueryComboboxFieldProps,
} from './query-combobox-field';
import { OptionsSelect, type OptionsSelectProps } from './options-select';
import { useCompanyListQueries } from '@/modules/company/hooks/company-queries';

interface CompanyFilterProps {
  includeInactive?: boolean;
}

/**
 * React Hook Form Controller SelectField for Company selection across the entire app.
 */
export function CompanySelectField<T extends FieldValues>({
  includeInactive = false,
  placeholder = 'เลือกองค์กร...',
  ...props
}: QuerySelectFieldProps<T> & CompanyFilterProps) {
  const query = useCompanyListQueries();

  const options = useMemo(() => {
    return (query.data ?? [])
      .filter((company) => includeInactive || company.isActive)
      .map((company) => ({
        value: company.id,
        label: company.name,
      }));
  }, [query.data, includeInactive]);

  return (
    <QuerySelectField
      placeholder={placeholder}
      {...props}
      query={query}
      options={options}
    />
  );
}

/**
 * React Hook Form Controller ComboboxField for searchable Company selection.
 */
export function CompanyComboboxField<T extends FieldValues>({
  includeInactive = false,
  placeholder = 'ค้นหาหรือเลือกองค์กร...',
  ...props
}: QueryComboboxFieldProps<T> & CompanyFilterProps) {
  const query = useCompanyListQueries();

  const options = useMemo(() => {
    return (query.data ?? [])
      .filter((company) => includeInactive || company.isActive)
      .map((company) => ({
        value: company.id,
        label: company.name,
      }));
  }, [query.data, includeInactive]);

  return (
    <QueryComboboxField
      placeholder={placeholder}
      {...props}
      query={query}
      options={options}
    />
  );
}

/**
 * Standalone Company Select for toolbars, headers, and filters outside React Hook Form.
 */
export function CompanySelect({
  value,
  onChange,
  label = 'องค์กร',
  placeholder = 'เลือกองค์กร...',
  includeInactive = false,
  disabled,
  className,
}: Omit<OptionsSelectProps, 'options'> & CompanyFilterProps) {
  const query = useCompanyListQueries();

  const options = useMemo(() => {
    return (query.data ?? [])
      .filter((company) => includeInactive || company.isActive)
      .map((company) => ({
        value: company.id,
        label: company.name,
      }));
  }, [query.data, includeInactive]);

  return (
    <OptionsSelect
      value={value}
      onChange={onChange}
      options={options}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      isLoading={query.isLoading}
      loadError={query.isError}
      className={className}
    />
  );
}
