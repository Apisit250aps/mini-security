'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import {
  useWorkSchedulesQueries,
  useCompanyWorkShiftsQueries,
} from '../../hooks/attendance-queries';
import { workScheduleColumns } from './work-schedule-columns';

export default function WorkScheduleTable({
  companyId,
}: {
  companyId: string;
}) {
  const { data: schedules = [], isLoading: isSchedulesLoading } =
    useWorkSchedulesQueries(companyId);
  const { data: shifts = [], isLoading: isShiftsLoading } =
    useCompanyWorkShiftsQueries(companyId);

  const shiftCountsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const shift of shifts) {
      const current = map.get(shift.workScheduleId) || 0;
      map.set(shift.workScheduleId, current + 1);
    }
    return map;
  }, [shifts]);

  const columns = useMemo(
    () => workScheduleColumns({ shiftCountsMap }),
    [shiftCountsMap],
  );

  const isLoading = isSchedulesLoading || isShiftsLoading;

  const table = useMemo(
    () => ({
      data: schedules,
      columns,
      isLoading,
    }),
    [schedules, columns, isLoading],
  );

  return <DataTable {...table} />;
}
