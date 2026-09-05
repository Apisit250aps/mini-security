'use client';

import React from 'react';
import type { CellContext, ColumnDef } from '@tanstack/react-table';
import type { AttendancePolicy } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useAttendancePolicyDelete } from '../../hooks/attendance-mutations';
import PolicyForm from './policy-form';
import CheckpointTable from './checkpoint-table';
import RolePolicyForm from './role-policy-form';

function PolicyColumnActions<T extends AttendancePolicy>({
  row,
}: CellContext<T, unknown>) {
  const ui = useOverlay();
  const policy = row.original;
  const deleteMutation = useAttendancePolicyDelete(policy.companyId);

  const handleManageCheckpoints = () => {
    ui.dialog.open({
      title: `จุดเช็คชื่อ: ${policy.name}`,
      description: 'จัดการจุดเช็คชื่อและเงื่อนไขของนโยบายนี้',
      size: 'xl',
      children: (
        <CheckpointTable companyId={policy.companyId} policy={policy} />
      ),
    });
  };

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขนโยบายการลงเวลา',
      description: 'ปรับปรุงชื่อและสถานะของนโยบาย',
      size: 'lg',
      children: <PolicyForm companyId={policy.companyId} policy={policy} />,
    });
  };

  const handleAssignRole = () => {
    ui.dialog.open({
      title: `กำหนด Role: ${policy.name}`,
      description: 'เลือก Role ที่ต้องบังคับใช้นโยบายการลงเวลานี้',
      size: 'lg',
      children: (
        <RolePolicyForm companyId={policy.companyId} policyId={policy.id} />
      ),
    });
  };

  const handleDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบนโยบาย',
      description: `คุณต้องการลบนโยบาย "${policy.name}" หรือไม่? (จุดเช็คชื่อทั้งหมดในนโยบายนี้จะถูกลบด้วย)`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(policy.id);
        ui.hideAll();
      },
    });
  };

  return (
    <ColumnActions
      actions={{
        จัดการจุดเช็คชื่อ: { onAction: handleManageCheckpoints },
        กำหนดให้Role: { onAction: handleAssignRole },
        แก้ไข: { onAction: handleEdit },
        ลบ: { onAction: handleDelete, variant: 'destructive' },
      }}
    />
  );
}

export const policyColumns = (): ColumnDef<AttendancePolicy>[] => [
  {
    accessorKey: 'name',
    header: 'ชื่อนโยบาย',
    cell: ({ getValue }) => (
      <span className="font-semibold text-foreground">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'description',
    header: 'คำอธิบาย',
    cell: ({ getValue }) => {
      const description = getValue<string | null>();
      return description ? (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[320px]">
          {description}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground italic">-</span>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'สถานะ',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          เปิดใช้งาน
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          ปิดใช้งาน
        </Badge>
      ),
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: PolicyColumnActions,
  },
];
