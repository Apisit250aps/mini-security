'use client';

import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from '@/shared/components/form/query-select-field';
import { useWorkShiftsQueries } from '../../hooks/attendance-queries';

export function WorkShiftSelectField<T extends FieldValues>({
  workScheduleId,
  ...props
}: QuerySelectFieldProps<T> & { workScheduleId: string }) {
  const query = useWorkShiftsQueries(workScheduleId);
  return (
    <QuerySelectField
      {...props}
      placeholder={workScheduleId ? props.placeholder : 'เลือกตารางเวลาก่อน'}
      query={query}
      options={(query.data ?? []).map((shift) => ({
        value: shift.id,
        label: `${shift.name} (${shift.startTime} - ${shift.endTime})`,
      }))}
    />
  );
}
