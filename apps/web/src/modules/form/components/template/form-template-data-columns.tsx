'use client';

import React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { FormTemplate } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils/date';
import FormTemplateColumnActions from './form-template-column-actions';

interface FormTemplateColumnsOptions {
  companyId: string;
}

export const formTemplateDataColumns = ({
  companyId,
}: FormTemplateColumnsOptions): ColumnDef<FormTemplate>[] => [
  {
    accessorKey: 'name',
    header: 'ชื่อแบบฟอร์ม',
    cell: ({ row }) => (
      <Link
        href={`/company/forms/templates/${row.original.id}/builder`}
        className="flex flex-col group hover:underline cursor-pointer"
      >
        <span className="font-semibold text-sm group-hover:text-primary transition-colors">
          {row.original.name}
        </span>
        {row.original.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.description}
          </span>
        )}
      </Link>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'สถานะ',
    cell: ({ getValue }) => {
      const isActive = getValue<boolean>();
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'วันที่สร้าง',
    cell: ({ getValue }) => {
      const date = getValue<string | Date>();
      return (
        <span className="text-xs text-muted-foreground">
          {formatDate(date)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: (cell) => (
      <FormTemplateColumnActions cell={cell} companyId={companyId} />
    ),
  },
];

export default formTemplateDataColumns;
