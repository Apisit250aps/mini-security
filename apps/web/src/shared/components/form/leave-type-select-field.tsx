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
import { useCompanyLeaveTypesQueries } from '@/modules/leave/hooks/leave-queries';

export interface LeaveTypeSelectFieldProps<T extends FieldValues>
  extends QuerySelectFieldProps<T> {
  companyId: string;
  onlyActive?: boolean;
}

export interface LeaveTypeComboboxFieldProps<T extends FieldValues>
  extends QueryComboboxFieldProps<T> {
  companyId: string;
  onlyActive?: boolean;
}

/**
 * Shared React Hook Form Controller SelectField for Leave Types in a company.
 */
export function LeaveTypeSelectField<T extends FieldValues>({
  companyId,
  onlyActive = true,
  placeholder = 'เลือกประเภทการลา...',
  ...props
}: LeaveTypeSelectFieldProps<T>) {
  const query = useCompanyLeaveTypesQueries(companyId, onlyActive);

  const options = useMemo(() => {
    return (query.data ?? []).map((t) => ({
      value: t.id,
      label: `${t.name} (${t.isPaid ? 'ได้รับค่าจ้าง' : 'ไม่ได้รับค่าจ้าง'})`,
    }));
  }, [query.data]);

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
 * Shared React Hook Form Controller ComboboxField for searchable Leave Types.
 */
export function LeaveTypeComboboxField<T extends FieldValues>({
  companyId,
  onlyActive = true,
  placeholder = 'ค้นหาประเภทการลา...',
  ...props
}: LeaveTypeComboboxFieldProps<T>) {
  const query = useCompanyLeaveTypesQueries(companyId, onlyActive);

  const options = useMemo(() => {
    return (query.data ?? []).map((t) => ({
      value: t.id,
      label: `${t.name} (${t.isPaid ? 'ได้รับค่าจ้าง' : 'ไม่ได้รับค่าจ้าง'})`,
    }));
  }, [query.data]);

  return (
    <QueryComboboxField
      placeholder={placeholder}
      {...props}
      query={query}
      options={options}
    />
  );
}
