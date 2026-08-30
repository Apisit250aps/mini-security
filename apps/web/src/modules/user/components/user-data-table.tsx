'use client';
import React, { useMemo } from 'react';
import userListColumns from './user-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useUserListQueries } from '../hooks/user-queries';

export default function UserDataTable() {
  const query = useUserListQueries();
  const columns = userListColumns();
  const table = useMemo(() => {
    const data = query.isLoading ? [] : query.data || [];
    return { data, columns, isLoading: query.isLoading };
  }, [columns, query.data, query.isLoading]);

  return <DataTable {...table} />;
}
