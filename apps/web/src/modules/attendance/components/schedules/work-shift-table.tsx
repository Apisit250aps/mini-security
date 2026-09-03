'use client';

import React, { useMemo, useState } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import {
  useCompanyWorkShiftsQueries,
  useWorkSchedulesQueries,
} from '../../hooks/attendance-queries';
import { workShiftColumns } from './work-shift-columns';
import type { WorkSchedule } from '@repo/domains/entities';
import { Button } from '@repo/ui/components/button';

export default function WorkShiftTable({ companyId }: { companyId: string }) {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('ALL');

  const { data: shifts = [], isLoading: isShiftsLoading } =
    useCompanyWorkShiftsQueries(companyId);
  const { data: schedules = [], isLoading: isSchedulesLoading } =
    useWorkSchedulesQueries(companyId);

  const schedulesMap = useMemo(() => {
    const map = new Map<string, WorkSchedule>();
    for (const s of schedules) {
      map.set(s.id, s);
    }
    return map;
  }, [schedules]);

  const filteredShifts = useMemo(() => {
    if (selectedScheduleId === 'ALL') return shifts;
    return shifts.filter((s) => s.workScheduleId === selectedScheduleId);
  }, [shifts, selectedScheduleId]);

  const columns = useMemo(
    () => workShiftColumns({ schedulesMap }),
    [schedulesMap],
  );

  const isLoading = isShiftsLoading || isSchedulesLoading;

  const table = useMemo(
    () => ({
      data: filteredShifts,
      columns,
      isLoading,
    }),
    [filteredShifts, columns, isLoading],
  );

  return (
    <div className="flex flex-col gap-4">
      {schedules.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground mr-1">
            กรองตามตารางเวลา:
          </span>
          <Button
            variant={selectedScheduleId === 'ALL' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onPress={() => setSelectedScheduleId('ALL')}
          >
            ทั้งหมด
          </Button>
          {schedules.map((schedule) => (
            <Button
              key={schedule.id}
              variant={
                selectedScheduleId === schedule.id ? 'default' : 'outline'
              }
              size="sm"
              className="h-7 text-xs px-2.5"
              onPress={() => setSelectedScheduleId(schedule.id)}
            >
              {schedule.name}
            </Button>
          ))}
        </div>
      )}

      <DataTable {...table} />
    </div>
  );
}
