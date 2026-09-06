'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  AttendanceLog,
  CompanyMember,
  ScheduleSlot,
} from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';

interface AttendanceLogColumnsOptions {
  members?: CompanyMember[];
  slots?: ScheduleSlot[];
}

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  present: { label: 'มาตรงเวลา', variant: 'default' },
  late: { label: 'มาสาย', variant: 'secondary' },
  absent: { label: 'ขาดงาน', variant: 'destructive' },
  excused: { label: 'ลา (ได้รับอนุญาต)', variant: 'outline' },
};

export const attendanceLogDataColumns = ({
  members = [],
  slots = [],
}: AttendanceLogColumnsOptions = {}): ColumnDef<AttendanceLog>[] => {
  const memberMap = new Map(members.map((m) => [m.id, m.userId || m.id]));
  const slotMap = new Map(slots.map((s) => [s.id, s.label]));

  return [
    {
      accessorKey: 'workDate',
      header: 'วันที่',
      cell: ({ getValue }) => (
        <span className="font-semibold">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'companyMemberId',
      header: 'พนักงาน',
      cell: ({ getValue }) => {
        const memberId = getValue<string>();
        const memberLabel = memberMap.get(memberId) || memberId;
        return <span className="font-medium">{memberLabel}</span>;
      },
    },
    {
      accessorKey: 'scheduleSlotId',
      header: 'รอบเวลา (Slot)',
      cell: ({ getValue }) => {
        const slotId = getValue<string>();
        const slotLabel = slotMap.get(slotId) || 'รอบเวลาเช็คชื่อ';
        return <Badge variant="outline">{slotLabel}</Badge>;
      },
    },
    {
      accessorKey: 'checkedInAt',
      header: 'เวลาบันทึก',
      cell: ({ getValue }) => {
        const val = getValue<Date | null>();
        return val ? formatDate(val) : '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'สถานะ',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const info = STATUS_MAP[status] || {
          label: status,
          variant: 'outline' as const,
        };
        return <Badge variant={info.variant}>{info.label}</Badge>;
      },
    },
    {
      accessorKey: 'note',
      header: 'หมายเหตุ',
      cell: ({ getValue }) => {
        const val = getValue<string | null>();
        return val ? (
          <span className="text-xs text-muted-foreground">{val}</span>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'recordedBy',
      header: 'วิธีบันทึก',
      cell: ({ getValue }) =>
        getValue<string | null>() ? (
          <Badge variant="secondary">โดยผู้จัดการ</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">บันทึกเอง</span>
        ),
    },
  ];
};

export default attendanceLogDataColumns;
