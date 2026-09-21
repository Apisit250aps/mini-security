import React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { Organization } from '@repo/client';
import { Badge } from '@repo/ui/components/badge';
import { formatDate, buildPageUrl } from '@/shared/utils';

export const organizationListColumns = (): ColumnDef<Organization>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'ชื่อองค์กร',
      cell: ({ row, getValue }) => (
        <Link
          href={buildPageUrl('organization', [row.original.id])}
          className="font-semibold text-primary hover:underline flex flex-col group cursor-pointer"
        >
          <span>{getValue<string>()}</span>
          <span className="text-[11px] text-muted-foreground font-normal group-hover:text-primary/80 transition-colors">
            จัดการสมาชิก ไซต์ และฟีเจอร์ →
          </span>
        </Link>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'รหัสองค์กร (Slug)',
    },
    {
      accessorKey: 'isActive',
      header: 'สถานะ',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">เปิดใช้งาน</Badge>
        ) : (
          <Badge variant="destructive">ปิดใช้งาน</Badge>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: 'วันที่สร้าง',
      cell: ({ getValue }) => formatDate(getValue<Date>()),
    },
  ];
};
export default organizationListColumns;
