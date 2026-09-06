'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { LeaveType } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import LeaveTypeColumnActions from './leave-type-column-actions';

interface LeaveTypeColumnsOptions {
  companyId: string;
}

const UNIT_LABELS: Record<string, string> = {
  day: 'วัน',
  half_day: 'ครึ่งวัน',
  hour: 'ชั่วโมง',
};

export const leaveTypeDataColumns = ({
  companyId,
}: LeaveTypeColumnsOptions): ColumnDef<LeaveType>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'ประเภทการลา',
      cell: ({ row, getValue }) => (
        <div>
          <span className="font-semibold text-foreground">
            {getValue<string>()}
          </span>
          {row.original.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'unit',
      header: 'หน่วยนับ',
      cell: ({ getValue }) => {
        const val = getValue<string>();
        return <Badge variant="outline">{UNIT_LABELS[val] || val}</Badge>;
      },
    },
    {
      accessorKey: 'maxDaysPerYear',
      header: 'โควต้าสูงสุด/ปี',
      cell: ({ getValue }) => {
        const val = getValue<number | null>();
        return (
          <span className="font-mono text-sm">
            {val !== null && val !== undefined ? `${val} วัน` : 'ไม่จำกัด'}
          </span>
        );
      },
    },
    {
      accessorKey: 'isPaid',
      header: 'การจ่ายค่าจ้าง',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">ได้รับค่าจ้าง</Badge>
        ) : (
          <Badge variant="secondary">ไม่ได้รับค่าจ้าง</Badge>
        ),
    },
    {
      accessorKey: 'requiresProof',
      header: 'หลักฐาน',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="outline">ต้องแนบหลักฐาน</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
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
      id: 'actions',
      header: 'จัดการ',
      cell: (cell) => (
        <LeaveTypeColumnActions cell={cell} companyId={companyId} />
      ),
    },
  ];
};

export default leaveTypeDataColumns;
