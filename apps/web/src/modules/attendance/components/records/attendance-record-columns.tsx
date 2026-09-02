import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import type {
  AttendanceRecord,
  CompanyMember,
  User,
} from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import AttendanceRecordActions from './attendance-record-actions';
import { CheckCircle2, Clock, User as UserIcon, XCircle } from 'lucide-react';

export const attendanceRecordColumns = ({
  membersMap,
  usersMap,
}: {
  membersMap?: Map<string, CompanyMember>;
  usersMap?: Map<string, User>;
} = {}): ColumnDef<AttendanceRecord>[] => [
  {
    accessorKey: 'companyMemberId',
    header: 'พนักงาน',
    cell: ({ getValue }) => {
      const memberId = getValue<string>();
      const member = membersMap?.get(memberId);
      const user = member ? usersMap?.get(member.userId) : undefined;
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <UserIcon className="size-3.5 text-muted-foreground shrink-0" />
          <span className="font-semibold text-foreground">
            {user?.name || memberId.slice(0, 8)}
          </span>
          {user?.email && (
            <span className="text-muted-foreground text-[11px]">
              ({user.email})
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'workDate',
    header: 'วันที่ทำงาน',
    cell: ({ getValue }) => {
      const date = getValue<Date>();
      return (
        <span className="font-medium text-foreground">{formatDate(date)}</span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'สถานะ',
    cell: ({ getValue }) => {
      const status = getValue<string>();
      switch (status) {
        case 'APPROVED':
          return (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30">
              <CheckCircle2 className="size-3 mr-1" /> อนุมัติแล้ว
            </Badge>
          );
        case 'LATE':
          return (
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border-amber-500/30">
              <Clock className="size-3 mr-1" /> มาสาย
            </Badge>
          );
        case 'ABSENT':
          return (
            <Badge variant="destructive">
              <XCircle className="size-3 mr-1" /> ขาดงาน
            </Badge>
          );
        case 'REJECTED':
          return (
            <Badge
              variant="outline"
              className="text-destructive border-destructive/40"
            >
              ปฏิเสธ
            </Badge>
          );
        case 'PENDING':
        default:
          return <Badge variant="secondary">รอตรวจสอบ</Badge>;
      }
    },
  },
  {
    accessorKey: 'totalWorkMinutes',
    header: 'ชั่วโมงงาน',
    cell: ({ getValue }) => {
      const minutes = getValue<number | null>();
      if (!minutes) return <span className="text-muted-foreground">-</span>;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return (
        <span className="font-mono text-xs">
          {hours} ชม. {mins > 0 ? `${mins} นาที` : ''}
        </span>
      );
    },
  },
  {
    accessorKey: 'lateMinutes',
    header: 'สาย (นาที)',
    cell: ({ getValue }) => {
      const late = getValue<number | null>();
      if (!late || late <= 0)
        return <span className="text-muted-foreground">-</span>;
      return (
        <span className="text-amber-600 dark:text-amber-400 font-medium font-mono text-xs">
          +{late} นาที
        </span>
      );
    },
  },
  {
    accessorKey: 'overtimeMinutes',
    header: 'OT (นาที)',
    cell: ({ getValue }) => {
      const ot = getValue<number | null>();
      if (!ot || ot <= 0)
        return <span className="text-muted-foreground">-</span>;
      return (
        <span className="text-primary font-medium font-mono text-xs">
          +{ot} นาที
        </span>
      );
    },
  },
  {
    accessorKey: 'note',
    header: 'หมายเหตุ',
    cell: ({ getValue }) => {
      const note = getValue<string | null>();
      return note ? (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]">
          {note}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: AttendanceRecordActions,
  },
];
