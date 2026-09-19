'use client';

import React from 'react';
import { formatDateRange } from '@/shared/utils/date';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  CompanyMember,
  LeaveRequest,
  LeaveType,
  User,
} from '@repo/domains/entities';
import { calculateLeaveDays } from '@repo/domains';
import { Badge } from '@repo/ui/components/badge';
import { useOverlay } from '@repo/ui/hooks';
import LeaveRequestDetailSheet from './leave-request-detail-sheet';
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

function LeaveRequestEmployeeCell({
  request,
  companyId,
  displayName,
  subText,
  leaveTypeName,
  memberName,
}: {
  request: LeaveRequest;
  companyId: string;
  displayName: string;
  subText?: string;
  leaveTypeName?: string;
  memberName?: string;
}) {
  const ui = useOverlay();

  const handleOpen = () => {
    ui.sheet.open({
      title: 'รายละเอียดคำขอลาหยุดงาน',
      description: 'ตรวจสอบข้อมูลการขอลา เอกสารแนบ และผลการพิจารณา',
      size: 'lg',
      children: (
        <LeaveRequestDetailSheet
          request={request}
          companyId={companyId}
          leaveTypeName={leaveTypeName}
          memberName={memberName}
          onClose={() => ui.sheet.close()}
        />
      ),
    });
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="flex flex-col text-left group cursor-pointer"
    >
      <span className="font-semibold text-sm text-primary hover:underline transition-colors">
        {displayName}
      </span>
      {subText && (
        <span className="text-xs text-muted-foreground">{subText}</span>
      )}
    </button>
  );
}

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
      cell: ({ row, getValue }) => {
        const memberId = getValue<string>();
        const member = memberObjMap.get(memberId);
        const user = member ? usersMap?.get(member.userId) : undefined;
        const displayName =
          user?.name ||
          (member
            ? `พนักงาน #${member.id.slice(0, 6)}`
            : `พนักงาน #${memberId.slice(0, 6)}`);
        const subText = user?.email || (!user ? 'ข้อมูลพนักงาน' : undefined);
        const typeName = typeMap.get(row.original.leaveTypeId) || 'การลา';
        const memberName = user
          ? `${user.name} (${user.email})`
          : member
            ? `พนักงาน #${member.id.slice(0, 6)}`
            : `พนักงาน #${memberId.slice(0, 6)}`;

        return (
          <LeaveRequestEmployeeCell
            request={row.original}
            companyId={companyId}
            displayName={displayName}
            subText={subText}
            leaveTypeName={typeName}
            memberName={memberName}
          />
        );
      },
    },
    {
      accessorKey: 'leaveTypeId',
      header: 'ประเภทการลา',
      cell: ({ getValue }) => {
        const typeId = getValue<string>();
        const typeName = typeMap.get(typeId) || 'ประเภทการลาทั่วไป';
        return <Badge variant="outline">{typeName}</Badge>;
      },
    },
    {
      id: 'dates',
      header: 'ช่วงวันที่ลา',
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDateRange(row.original.startDate, row.original.endDate)}
        </span>
      ),
    },
    {
      id: 'totalDays',
      header: 'จำนวนวัน',
      cell: ({ row }) => (
        <span className="font-medium">
          {calculateLeaveDays(row.original)} วัน
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
        const typeName = typeMap.get(cell.row.original.leaveTypeId) || 'การลา';
        const member = memberObjMap.get(cell.row.original.companyMemberId);
        const user = member ? usersMap?.get(member.userId) : undefined;
        const memberName = user
          ? `${user.name} (${user.email})`
          : member
            ? `พนักงาน #${member.id.slice(0, 6)}`
            : `พนักงาน #${cell.row.original.companyMemberId.slice(0, 6)}`;
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
