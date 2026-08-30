'use client';
import React, { useMemo } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useUserListQueries } from '../hooks/user-queries';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';

const userListColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'ชื่อ',
  },
  {
    accessorKey: 'email',
    header: 'อีเมล',
  },
  {
    accessorKey: 'emailVerified',
    header: 'ยืนยันอีเมล',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge variant="default">ยืนยันแล้ว</Badge>
      ) : (
        <Badge variant="destructive">ยังไม่ยืนยัน</Badge>
      ),
  },
  {
    accessorKey: 'isAdmin',
    header: 'บทบาท',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge variant="default">Admin</Badge>
      ) : (
        <Badge variant="secondary">User</Badge>
      ),
  },
  {
    accessorKey: 'isActive',
    header: 'สถานะ',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge variant="default">ใช้งาน</Badge>
      ) : (
        <Badge variant="destructive">ปิดใช้งาน</Badge>
      ),
  },
  {
    accessorKey: 'lastLogin',
    header: 'เข้าใช้ล่าสุด',
    cell: ({ getValue }) => {
      const val = getValue<Date | null>();
      if (!val) return <span className="text-muted-foreground">-</span>;
      return new Date(val).toLocaleString('th-TH');
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'วันที่สร้าง',
    cell: ({ getValue }) => new Date(getValue<Date>()).toLocaleDateString('th-TH'),
  },
];

export default function UserDataTable() {
  const query = useUserListQueries();
  const table = useMemo(() => {
    const data = query.isLoading ? [] : query.data || [];
    return { data, columns: userListColumns, isLoading: query.isLoading };
  }, [query]);
  //
  console.table(table.data);
  return <DataTable {...table} />;
}
