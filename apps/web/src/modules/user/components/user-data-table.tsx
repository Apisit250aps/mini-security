'use client';
import React, { useMemo } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useUserListQueries } from '../hooks/user-queries';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@repo/domains/entities';

const userListColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'ชื่อ',
  },
  {
    accessorKey: 'email',
    header: 'อีเมล',
  },
];

export default function UserDataTable() {
  const query = useUserListQueries();
  const table = useMemo(() => {
    const data = query.isLoading ? [] : query.data || [];
    return { data, columns: userListColumns, isLoading: query.isLoading };
  }, [query.isLoading, query.data]);
  //
  console.table(table.data);
  return <DataTable {...table} />;
}
