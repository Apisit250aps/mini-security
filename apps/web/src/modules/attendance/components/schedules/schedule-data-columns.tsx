import React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { CheckInSchedule, Role } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';

interface ScheduleColumnsOptions {
  companyId: string;
  roles?: Role[];
}

export const scheduleDataColumns = ({
  roles = [],
}: ScheduleColumnsOptions): ColumnDef<CheckInSchedule>[] => {
  const roleMap = new Map(roles.map((r) => [r.id, r.name]));

  return [
    {
      accessorKey: 'name',
      header: 'ชื่อตารางเวลา',
      cell: ({ row, getValue }) => (
        <Link
          href={`/company/attendance/schedules/${row.original.id}`}
          className="font-semibold text-primary hover:underline flex flex-col group cursor-pointer"
        >
          <span>{getValue<string>()}</span>
          <span className="text-[11px] text-muted-foreground font-normal group-hover:text-primary/80 transition-colors">
            จัดการรอบเวลาและพิกัด →
          </span>
        </Link>
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
                {roleMap.get(roleId) ?? `บทบาท #${roleId.slice(0, 6)}`}
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
  ];
};

export default scheduleDataColumns;
