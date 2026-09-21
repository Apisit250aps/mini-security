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
import { useOrganizationListQueries } from '@/modules/organization/hooks/organization-queries';

interface OrganizationFilterProps {
  includeInactive?: boolean;
}

/**
 * React Hook Form Controller SelectField for Organization selection across the entire app.
 */
export function OrganizationSelectField<T extends FieldValues = FieldValues>({
  includeInactive = false,
  placeholder = 'เลือกองค์กร...',
  ...props
}: QuerySelectFieldProps<T> & OrganizationFilterProps) {
  const query = useOrganizationListQueries();

  const options = useMemo(() => {
    return (query.data ?? [])
      .filter((org) => includeInactive || org.isActive)
      .map((org) => ({
        value: org.id,
        label: org.name,
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
 * React Hook Form Controller ComboboxField for searchable Organization selection.
 */
export function OrganizationComboboxField<T extends FieldValues = FieldValues>({
  includeInactive = false,
  placeholder = 'ค้นหาหรือเลือกองค์กร...',
  ...props
}: QueryComboboxFieldProps<T> & OrganizationFilterProps) {
  const query = useOrganizationListQueries();

  const options = useMemo(() => {
    return (query.data ?? [])
      .filter((org) => includeInactive || org.isActive)
      .map((org) => ({
        value: org.id,
        label: org.name,
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
 * Standalone Organization Select for toolbars, headers, and filters outside React Hook Form.
 */
export function OrganizationSelect({
  value,
  onChange,
  label = 'องค์กร',
  placeholder = 'เลือกองค์กร...',
  includeInactive = false,
  disabled,
  className,
}: Omit<OptionsSelectProps, 'options'> & OrganizationFilterProps) {
  const query = useOrganizationListQueries();

  const options = useMemo(() => {
    return (query.data ?? [])
      .filter((org) => includeInactive || org.isActive)
      .map((org) => ({
        value: org.id,
        label: org.name,
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
