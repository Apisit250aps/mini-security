'use client';

import React from 'react';
import type { CellContext, ColumnDef } from '@tanstack/react-table';
import type { AttendanceCheckpoint } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useAttendanceCheckpointDelete } from '../../hooks/attendance-mutations';
import CheckpointForm from './checkpoint-form';
import CheckpointLocationDialog from './checkpoint-location-dialog';

function CheckpointColumnActions<T extends AttendanceCheckpoint>({
  row,
  companyId,
}: CellContext<T, unknown> & { companyId: string }) {
  const ui = useOverlay();
  const checkpoint = row.original;
  const deleteMutation = useAttendanceCheckpointDelete(checkpoint.policyId);

  const handleLocations = () => {
    ui.dialog.open({
      title: 'ผูกสถานที่สำหรับจุดเช็คชื่อ',
      description: `จัดการพิกัดสถานที่และรัศมีที่อนุญาตสำหรับ "${checkpoint.label}"`,
      size: 'lg',
      children: (
        <CheckpointLocationDialog
          companyId={companyId}
          checkpoint={checkpoint}
        />
      ),
    });
  };

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขจุดเช็คชื่อ',
      description: 'ปรับปรุงเงื่อนไข เวลา และข้อกำหนดของจุดเช็ค',
      size: 'xl',
      children: (
        <CheckpointForm
          policyId={checkpoint.policyId}
          checkpoint={checkpoint}
        />
      ),
    });
  };

  const handleDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบจุดเช็คชื่อ',
      description: `คุณต้องการลบจุดเช็ค "${checkpoint.label}" หรือไม่?`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(checkpoint.id);
        ui.hideAll();
      },
    });
  };

  return (
    <ColumnActions
      actions={{
        จัดการสถานที่: { onAction: handleLocations },
        แก้ไข: { onAction: handleEdit },
        ลบ: { onAction: handleDelete, variant: 'destructive' },
      }}
    />
  );
}

export const checkpointColumns = ({
  companyId,
}: {
  companyId: string;
}): ColumnDef<AttendanceCheckpoint>[] => [
  {
    accessorKey: 'orderIndex',
    header: 'ลำดับ',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue<number>()}</span>
    ),
  },
  {
    accessorKey: 'label',
    header: 'จุดเช็คชื่อ',
    cell: ({ getValue }) => (
      <span className="font-semibold text-foreground">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'checkType',
    header: 'ประเภท',
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-mono text-xs">
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    id: 'window',
    header: 'ช่วงเวลา',
    cell: ({ row }) => {
      const checkpoint = row.original;
      return checkpoint.windowStart || checkpoint.windowEnd ? (
        <span className="font-mono text-xs text-muted-foreground">
          {checkpoint.windowStart || 'เริ่ม'} - {checkpoint.windowEnd || 'ปิด'}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
  },
  {
    id: 'requirements',
    header: 'ข้อกำหนด',
    cell: ({ row }) => {
      const checkpoint = row.original;
      return (
        <div className="flex flex-wrap gap-1">
          {checkpoint.isRequired && <Badge variant="secondary">บังคับ</Badge>}
          {checkpoint.requireLocation && <Badge variant="outline">GPS</Badge>}
          {checkpoint.requirePhoto && <Badge variant="outline">รูปภาพ</Badge>}
          {Boolean(checkpoint.graceMinutes && checkpoint.graceMinutes > 0) && (
            <Badge variant="outline">
              สายได้ {checkpoint.graceMinutes} นาที
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: (context) => (
      <CheckpointColumnActions {...context} companyId={companyId} />
    ),
  },
];
