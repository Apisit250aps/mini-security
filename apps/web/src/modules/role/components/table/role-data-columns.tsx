import React from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import type { Role } from '@repo/client';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import RoleColumnActions from './role-column-actions';

const roleListColumns = (organizationId?: string): ColumnDef<Role>[] => {
  const orgId = organizationId;
  return [
    {
      accessorKey: 'name',
      header: 'ชื่อบทบาท',
      cell: ({ row, getValue }) => {
        const basePath = orgId
          ? '/organization/role'
          : row.original.organizationId
            ? '/organization/role'
            : '/admin/role';
        return (
          <Link
            href={`${basePath}/${row.original.id}`}
            className="font-semibold text-primary hover:underline flex flex-col group cursor-pointer"
          >
            <span>{getValue<string>()}</span>
            <span className="text-[11px] text-muted-foreground font-normal group-hover:text-primary/80 transition-colors">
              จัดการสิทธิ์และฟีเจอร์ →
            </span>
          </Link>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'คำอธิบาย',
      cell: ({ getValue }) => {
        const val = getValue<string | null>();
        return val || <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: 'roleType',
      header: 'ประเภทบทบาท',
      cell: ({ getValue }) => {
        const type = getValue<string>();
        switch (type) {
          case 'SUPER_ADMIN':
            return <Badge variant="destructive">Super Admin</Badge>;
          case 'OWNER':
            return (
              <Badge className="bg-amber-500 hover:bg-amber-600">Owner</Badge>
            );
          case 'ADMIN':
            return <Badge variant="default">Admin</Badge>;
          case 'VIEWER':
            return <Badge variant="outline">Viewer</Badge>;
          case 'MEMBER':
          default:
            return <Badge variant="secondary">Member</Badge>;
        }
      },
    },
    {
      accessorKey: 'isSystemDefault',
      header: 'ขอบเขต',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">ค่าเริ่มต้นระบบ</Badge>
        ) : (
          <Badge variant="secondary">กำหนดเอง</Badge>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: 'วันที่สร้าง',
      cell: ({ getValue }) => formatDate(getValue<Date>()),
    },
    {
      id: 'actions',
      header: 'จัดการ',
      cell: (cell) => <RoleColumnActions cell={cell} organizationId={orgId} />,
    },
  ];
};

export default roleListColumns;
