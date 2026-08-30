'use client';

import React, { useMemo } from 'react';
import roleListColumns from './role-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useRoleListQueries } from '../../hooks/role-queries';

export default function RoleDataTable() {
  const query = useRoleListQueries();
  const columns = roleListColumns();
  const table = useMemo(() => {
    const data = query.isLoading ? [] : query.data || [];
    return { data, columns, isLoading: query.isLoading };
  }, [columns, query.data, query.isLoading]);

  return <DataTable {...table} />;
}
