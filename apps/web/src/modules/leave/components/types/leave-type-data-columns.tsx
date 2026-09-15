import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { LeaveType } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { useOverlay } from '@repo/ui/hooks';
import { useLeaveTypeUpdate } from '../../hooks/leave-mutations';
import LeaveTypeForm, { LeaveTypeFormValues } from './leave-type-form';
import LeaveTypeColumnActions from './leave-type-column-actions';

interface LeaveTypeColumnsOptions {
  companyId: string;
}

const UNIT_LABELS: Record<string, string> = {
  day: 'วัน',
  half_day: 'ครึ่งวัน',
  hour: 'ชั่วโมง',
};

function LeaveTypeNameCell({
  leaveType,
  companyId,
}: {
  leaveType: LeaveType;
  companyId: string;
}) {
  const ui = useOverlay();
  const updateMutation = useLeaveTypeUpdate(companyId);

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขประเภทการลา',
      description: 'ปรับปรุงเงื่อนไข โควต้า และสถานะของประเภทการลา',
      size: 'lg',
      children: (
        <LeaveTypeForm
          isLoading={updateMutation.isPending}
          defaultValues={{
            name: leaveType.name,
            description: leaveType.description || '',
            unit: leaveType.unit,
            requiresProof: leaveType.requiresProof,
            maxDaysPerYear: leaveType.maxDaysPerYear,
            isPaid: leaveType.isPaid,
            isActive: leaveType.isActive,
          }}
          onSubmit={(data: LeaveTypeFormValues) => {
            updateMutation.mutate(
              {
                id: leaveType.id,
                data: {
                  name: data.name,
                  description: data.description || null,
                  unit: data.unit,
                  requiresProof: data.requiresProof,
                  maxDaysPerYear: data.maxDaysPerYear ?? null,
                  isPaid: data.isPaid,
                  isActive: data.isActive,
                },
              },
              {
                onSuccess: () => {
                  ui.dialog.close();
                },
              },
            );
          }}
        />
      ),
    });
  };

  return (
    <button
      type="button"
      onClick={handleEdit}
      className="flex flex-col text-left group cursor-pointer"
    >
      <span className="font-semibold text-primary hover:underline transition-colors">
        {leaveType.name}
      </span>
      {leaveType.description && (
        <p className="text-xs text-muted-foreground line-clamp-1">
          {leaveType.description}
        </p>
      )}
    </button>
  );
}

export const leaveTypeDataColumns = ({
  companyId,
}: LeaveTypeColumnsOptions): ColumnDef<LeaveType>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'ประเภทการลา',
      cell: ({ row }) => (
        <LeaveTypeNameCell leaveType={row.original} companyId={companyId} />
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
