'use client';

import React, { useMemo } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useAttendancePoliciesQueries } from '../../hooks/attendance-queries';
import { policyColumns } from './policy-columns';

export default function PolicyTable({ companyId }: { companyId: string }) {
  const { data = [], isLoading } = useAttendancePoliciesQueries(companyId);
  const columns = useMemo(() => policyColumns(), []);

  const table = useMemo(
    () => ({
      data,
      columns,
      isLoading,
    }),
    [data, columns, isLoading],
  );

  return <DataTable {...table} />;
}
