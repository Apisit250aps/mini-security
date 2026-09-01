import React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { Company } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate, buildPageUrl } from '@/shared/utils';
import CompanyColumnActions from './company-column-actions';

const companyListColumns = (): ColumnDef<Company>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'ชื่อบริษัท',
      cell: ({ row, getValue }) => (
        <Link
          href={buildPageUrl('company', [row.original.id])}
          className="font-medium hover:underline hover:text-primary transition-colors"
        >
          {getValue<string>()}
        </Link>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'รหัสบริษัท (Slug)',
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
    {
      id: 'actions',
      header: 'จัดการ',
      cell: CompanyColumnActions,
    },
  ];
};

export default companyListColumns;
