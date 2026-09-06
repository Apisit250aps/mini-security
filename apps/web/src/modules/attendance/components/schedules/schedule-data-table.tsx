'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useCompanySchedulesQueries } from '../../hooks/attendance-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import scheduleDataColumns from './schedule-data-columns';

interface ScheduleDataTableProps {
  companyId: string;
}

export default function ScheduleDataTable({
  companyId,
}: ScheduleDataTableProps) {
  const schedulesQuery = useCompanySchedulesQueries(companyId);
  const rolesQuery = useCompanyRolesQueries(companyId);

  const columns = useMemo(
    () =>
      scheduleDataColumns({
        companyId,
        roles: rolesQuery.data || [],
      }),
    [companyId, rolesQuery.data],
  );

  const isLoading = schedulesQuery.isLoading || rolesQuery.isLoading;
  const data = schedulesQuery.data || [];

  return <DataTable data={data} columns={columns} isLoading={isLoading} />;
}
