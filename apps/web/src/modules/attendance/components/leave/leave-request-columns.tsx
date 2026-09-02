import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import type { LeaveRequest } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import LeaveRequestActions from './leave-request-actions';
import { Calendar, CheckCircle2, Clock, FileText, XCircle } from 'lucide-react';

export const leaveRequestColumns = (): ColumnDef<LeaveRequest>[] => [
  {
    accessorKey: 'leaveType',
    header: 'ประเภทการลา',
    cell: ({ getValue }) => {
      const type = getValue<string>();
      switch (type) {
        case 'SICK_LEAVE':
          return (
            <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30">
              ลาป่วย
            </Badge>
          );
        case 'ANNUAL_LEAVE':
          return (
            <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30">
              ลาพักร้อน
            </Badge>
          );
        case 'PERSONAL_LEAVE':
          return (
            <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30">
              ลากิจ
            </Badge>
          );
        case 'MATERNITY_LEAVE':
          return (
            <Badge className="bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/30">
              ลาคลอด
            </Badge>
          );
        case 'ABSENT_NO_REASON':
        default:
          return <Badge variant="outline">ไม่ระบุเหตุผล</Badge>;
      }
    },
  },
  {
    accessorKey: 'startDate',
    header: 'ช่วงวันที่ลา',
    cell: ({ row }) => {
      const req = row.original;
      return (
        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span>
            {formatDate(req.startDate)} - {formatDate(req.endDate)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'totalDays',
    header: 'จำนวนวัน',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold">
        {getValue<number>()} วัน
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'สถานะ',
    cell: ({ getValue }) => {
      const status = getValue<string>();
      switch (status) {
        case 'APPROVED':
          return (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
              <CheckCircle2 className="size-3 mr-1" /> อนุมัติแล้ว
            </Badge>
          );
        case 'REJECTED':
          return (
            <Badge variant="destructive">
              <XCircle className="size-3 mr-1" /> ไม่อนุมัติ
            </Badge>
          );
        case 'CANCELLED':
          return (
            <Badge variant="outline" className="text-muted-foreground">
              ยกเลิกแล้ว
            </Badge>
          );
        case 'PENDING':
        default:
          return (
            <Badge variant="secondary">
              <Clock className="size-3 mr-1" /> รอพิจารณา
            </Badge>
          );
      }
    },
  },
  {
    accessorKey: 'reason',
    header: 'เหตุผล / หมายเหตุ',
    cell: ({ row }) => {
      const req = row.original;
      return (
        <div className="text-xs text-muted-foreground space-y-0.5 max-w-[200px]">
          {req.reason && <p className="line-clamp-1">{req.reason}</p>}
          {req.attachmentUrl && (
            <a
              href={req.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline text-[11px]"
            >
              <FileText className="size-3" /> เอกสารแนบ
            </a>
          )}
          {req.reviewNote && (
            <p className="text-[11px] italic text-foreground">
              ผล: {req.reviewNote}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: LeaveRequestActions,
  },
];
