'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useGetCheckInSchedulesByOrganization } from '../../hooks/attendance-queries';
import { useGetOrganizationRoles } from '@/modules/role/hooks/role-queries';
import scheduleDataColumns from './schedule-data-columns';

interface ScheduleDataTableProps {
  organizationId?: string;
}

export default function ScheduleDataTable({
  organizationId,
}: ScheduleDataTableProps) {
  const targetOrgId = organizationId || '';
  const schedulesQuery = useGetCheckInSchedulesByOrganization(targetOrgId);
  const rolesQuery = useGetOrganizationRoles(targetOrgId);

  const columns = useMemo(
    () =>
      scheduleDataColumns({
        organizationId: targetOrgId,
        roles: rolesQuery.data || [],
      }),
    [targetOrgId, rolesQuery.data],
  );

  const isLoading = schedulesQuery.isLoading || rolesQuery.isLoading;
  const data = schedulesQuery.data || [];

  return <DataTable data={data} columns={columns} isLoading={isLoading} />;
}
