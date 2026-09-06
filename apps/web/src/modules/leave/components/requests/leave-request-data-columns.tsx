'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  CompanyMember,
  LeaveRequest,
  LeaveType,
} from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import LeaveRequestColumnActions from './leave-request-column-actions';

interface LeaveRequestColumnsOptions {
  companyId: string;
  types?: LeaveType[];
  members?: CompanyMember[];
}

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  pending: { label: 'รอพิจารณา', variant: 'secondary' },
  approved: { label: 'อนุมัติแล้ว', variant: 'default' },
  rejected: { label: 'ไม่อนุมัติ', variant: 'destructive' },
  cancelled: { label: 'ยกเลิกแล้ว', variant: 'outline' },
};

export const leaveRequestDataColumns = ({
  companyId,
  types = [],
  members = [],
}: LeaveRequestColumnsOptions): ColumnDef<LeaveRequest>[] => {
  const typeMap = new Map(types.map((t) => [t.id, t.name]));
  const memberMap = new Map(members.map((m) => [m.id, m.userId || m.id]));

  return [
    {
      accessorKey: 'companyMemberId',
      header: 'พนักงาน',
      cell: ({ getValue }) => {
        const memberId = getValue<string>();
        const label = memberMap.get(memberId) || memberId;
        return <span className="font-semibold">{label}</span>;
      },
    },
    {
      accessorKey: 'leaveTypeId',
      header: 'ประเภทการลา',
      cell: ({ getValue }) => {
        const typeId = getValue<string>();
        const typeName = typeMap.get(typeId) || typeId;
        return <Badge variant="outline">{typeName}</Badge>;
      },
    },
    {
      id: 'dates',
      header: 'ช่วงวันที่ลา',
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {row.original.startDate} ถึง {row.original.endDate}
        </span>
      ),
    },
    {
      accessorKey: 'totalDays',
      header: 'จำนวนวัน',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue<number>()} วัน</span>
      ),
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
      accessorKey: 'reason',
      header: 'เหตุผล',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
          {getValue<string>()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'จัดการ',
      cell: (cell) => {
        const typeName = typeMap.get(cell.row.original.leaveTypeId);
        return (
          <LeaveRequestColumnActions
            cell={cell}
            companyId={companyId}
            leaveTypeName={typeName}
          />
        );
      },
    },
  ];
};

export default leaveRequestDataColumns;
