'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useCompanyLeaveTypesQueries } from '../../hooks/leave-queries';
import leaveTypeDataColumns from './leave-type-data-columns';

interface LeaveTypeDataTableProps {
  companyId: string;
}

export default function LeaveTypeDataTable({
  companyId,
}: LeaveTypeDataTableProps) {
  const typesQuery = useCompanyLeaveTypesQueries(companyId);

  const columns = useMemo(
    () => leaveTypeDataColumns({ companyId }),
    [companyId],
  );

  return (
    <DataTable
      data={typesQuery.data || []}
      columns={columns}
      isLoading={typesQuery.isLoading}
    />
  );
}
