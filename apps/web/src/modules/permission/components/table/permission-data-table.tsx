'use client';

import React, { useMemo } from 'react';
import permissionListColumns from './permission-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { usePermissionListQueries } from '../../hooks/permission-queries';

export default function PermissionDataTable() {
  const query = usePermissionListQueries();
  const columns = permissionListColumns();
  const table = useMemo(() => {
    const data = query.isLoading ? [] : query.data || [];
    return { data, columns, isLoading: query.isLoading };
  }, [columns, query.data, query.isLoading]);

  return <DataTable {...table} />;
}
