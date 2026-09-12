'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CheckInSchedule, Role } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import ScheduleColumnActions from './schedule-column-actions';

interface ScheduleColumnsOptions {
  companyId: string;
  roles?: Role[];
}

export const scheduleDataColumns = ({
  companyId,
  roles = [],
}: ScheduleColumnsOptions): ColumnDef<CheckInSchedule>[] => {
  const roleMap = new Map(roles.map((r) => [r.id, r.name]));

  return [
    {
      accessorKey: 'name',
      header: 'ชื่อตารางเวลา',
      cell: ({ getValue }) => (
        <span className="font-semibold text-foreground">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'roleIds',
      header: 'บทบาทที่ได้รับมอบหมาย',
      cell: ({ row }) =>
        row.original.roleIds.length ? (
          <div className="flex flex-wrap gap-1">
            {row.original.roleIds.map((roleId) => (
              <Badge key={roleId} variant="secondary">
                {roleMap.get(roleId) ?? roleId}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">ยังไม่มอบหมาย</span>
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
      header: 'สร้างเมื่อ',
      cell: ({ getValue }) => formatDate(getValue<Date>()),
    },
    {
      id: 'actions',
      header: 'จัดการ',
      cell: (cell) => (
        <ScheduleColumnActions cell={cell} companyId={companyId} />
      ),
    },
  ];
};

export default scheduleDataColumns;
