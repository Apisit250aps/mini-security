'use client';

import React from 'react';
import { CellContext } from '@tanstack/react-table';
import type { AttendanceRecord } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useAttendanceRecordDelete } from '../../hooks/attendance-mutations';
import AttendanceApproveDialog from './attendance-approve-dialog';
import AttendanceLogDrawer from './attendance-log-drawer';

export default function AttendanceRecordActions<T extends AttendanceRecord>({
  row,
}: CellContext<T, unknown>) {
  const ui = useOverlay();
  const record = row.original;
  const deleteMutation = useAttendanceRecordDelete(record.companyId);

  const handleOpenLogs = () => {
    ui.dialog.open({
      title: 'ประวัติการลงเวลา (Check-in Events)',
      description: `รายการ Checkpoint ที่พนักงานเช็คชื่อ`,
      size: '3xl',
      children: <AttendanceLogDrawer record={record} />,
    });
  };

  const handleApprove = () => {
    ui.dialog.open({
      title: 'ตรวจสอบและอนุมัติเวลาทำงาน',
      description: 'ปรับสถานะการเข้างานและระบุหมายเหตุการอนุมัติ',
      size: 'md',
      children: (
        <AttendanceApproveDialog record={record} companyId={record.companyId} />
      ),
    });
  };

  const handleDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบบันทึก',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกเวลาทำงานนี้?',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(record.id);
        ui.hideAll();
      },
    });
  };

  return (
    <ColumnActions
      actions={{
        ดูจุดเช็คชื่อ: {
          onAction: handleOpenLogs,
        },
        อนุมัติและปรับสถานะ: {
          onAction: handleApprove,
        },
        ลบบันทึก: {
          onAction: handleDelete,
          variant: 'destructive',
        },
      }}
    />
  );
}
