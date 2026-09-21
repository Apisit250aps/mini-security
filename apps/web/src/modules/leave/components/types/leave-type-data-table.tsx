'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useOrganizationLeaveTypesQueries } from '../../hooks/leave-queries';
import leaveTypeDataColumns from './leave-type-data-columns';

interface LeaveTypeDataTableProps {
  organizationId: string;
}

export default function LeaveTypeDataTable({
  organizationId,
}: LeaveTypeDataTableProps) {
  const typesQuery = useOrganizationLeaveTypesQueries(organizationId);

  const columns = useMemo(
    () => leaveTypeDataColumns({ organizationId }),
    [organizationId],
  );

  return (
    <DataTable
      data={typesQuery.data || []}
      columns={columns}
      isLoading={typesQuery.isLoading}
    />
  );
}
