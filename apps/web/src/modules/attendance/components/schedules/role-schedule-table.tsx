'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import {
  useRoleWorkSchedulesByCompanyQueries,
  useCompanyWorkShiftsQueries,
  useWorkSchedulesQueries,
} from '../../hooks/attendance-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { roleScheduleColumns } from './role-schedule-columns';
import type { Role, WorkSchedule, WorkShift } from '@repo/domains/entities';

export default function RoleScheduleTable({
  companyId,
}: {
  companyId: string;
}) {
  const { data: roleSchedules = [], isLoading: isRoleSchedulesLoading } =
    useRoleWorkSchedulesByCompanyQueries(companyId);
  const { data: roles = [], isLoading: isRolesLoading } =
    useCompanyRolesQueries(companyId);
  const { data: shifts = [], isLoading: isShiftsLoading } =
    useCompanyWorkShiftsQueries(companyId);
  const { data: schedules = [], isLoading: isSchedulesLoading } =
    useWorkSchedulesQueries(companyId);

  const rolesMap = useMemo(() => {
    const map = new Map<string, Role>();
    for (const r of roles) {
      map.set(r.id, r);
    }
    return map;
  }, [roles]);

  const shiftsMap = useMemo(() => {
    const map = new Map<string, WorkShift>();
    for (const s of shifts) {
      map.set(s.id, s);
    }
    return map;
  }, [shifts]);

  const schedulesMap = useMemo(() => {
    const map = new Map<string, WorkSchedule>();
    for (const s of schedules) {
      map.set(s.id, s);
    }
    return map;
  }, [schedules]);

  const columns = useMemo(
    () => roleScheduleColumns({ rolesMap, shiftsMap, schedulesMap }),
    [rolesMap, shiftsMap, schedulesMap],
  );

  const isLoading =
    isRoleSchedulesLoading ||
    isRolesLoading ||
    isShiftsLoading ||
    isSchedulesLoading;

  const table = useMemo(
    () => ({
      data: roleSchedules,
      columns,
      isLoading,
    }),
    [roleSchedules, columns, isLoading],
  );

  return <DataTable {...table} />;
}
