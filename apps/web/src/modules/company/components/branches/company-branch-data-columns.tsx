import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CompanyBranch } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import CompanyBranchColumnActions from './company-branch-column-actions';
import { MapPin } from 'lucide-react';

interface CompanyBranchColumnsOptions {
  companyId: string;
}

export const companyBranchListColumns = ({
  companyId,
}: CompanyBranchColumnsOptions): ColumnDef<CompanyBranch>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'ชื่อสาขา',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.original.name}</span>
          {row.original.address && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="size-3 shrink-0" />
              {row.original.address}
            </span>
          )}
        </div>
      ),
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
      cell: (cell) => (
        <CompanyBranchColumnActions cell={cell} companyId={companyId} />
      ),
    },
  ];
};

export default companyBranchListColumns;
