'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  CompanyMember,
  LeaveRequest,
  LeaveType,
  User,
} from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import LeaveRequestColumnActions from './leave-request-column-actions';

interface LeaveRequestColumnsOptions {
  companyId: string;
  types?: LeaveType[];
  members?: CompanyMember[];
  usersMap?: Map<string, User>;
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
  usersMap,
}: LeaveRequestColumnsOptions): ColumnDef<LeaveRequest>[] => {
  const typeMap = new Map(types.map((t) => [t.id, t.name]));
  const memberObjMap = new Map(members.map((m) => [m.id, m]));

  return [
    {
      accessorKey: 'companyMemberId',
      header: 'พนักงาน',
      cell: ({ getValue }) => {
        const memberId = getValue<string>();
        const member = memberObjMap.get(memberId);
        const user = member ? usersMap?.get(member.userId) : undefined;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {user ? user.name : member?.userId || memberId}
            </span>
            {user?.email && (
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            )}
          </div>
        );
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
        <span className="text-sm">
          {row.original.startDate} ถึง {row.original.endDate}
        </span>
      ),
    },
    {
      accessorKey: 'totalDays',
      header: 'จำนวนวัน',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.totalDays} {row.original.unit}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'สถานะ',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const info = STATUS_MAP[status] || {
          label: status,
          variant: 'outline',
        };
        return <Badge variant={info.variant}>{info.label}</Badge>;
      },
    },
    {
      accessorKey: 'reason',
      header: 'เหตุผล',
      cell: ({ getValue }) => {
        const reason = getValue<string>();
        return (
          <span
            className="max-w-[200px] truncate block text-xs text-muted-foreground"
            title={reason}
          >
            {reason}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'จัดการ',
      cell: (cell) => {
        const typeName = typeMap.get(cell.row.original.leaveTypeId);
        const member = memberObjMap.get(cell.row.original.companyMemberId);
        const user = member ? usersMap?.get(member.userId) : undefined;
        const memberName = user
          ? `${user.name} (${user.email})`
          : member?.userId || cell.row.original.companyMemberId;
        return (
          <LeaveRequestColumnActions
            cell={cell}
            companyId={companyId}
            leaveTypeName={typeName}
            memberName={memberName}
          />
        );
      },
    },
  ];
};

export default leaveRequestDataColumns;
