'use client';

import React from 'react';
import { CellContext } from '@tanstack/react-table';
import type { LeaveRequest } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useLeaveRequestDelete } from '../../hooks/attendance-mutations';
import LeaveForm from './leave-form';
import LeaveReviewDialog from './leave-review-dialog';

export default function LeaveRequestActions<T extends LeaveRequest>({
  row,
}: CellContext<T, unknown>) {
  const ui = useOverlay();
  const leave = row.original;
  const deleteMutation = useLeaveRequestDelete(leave.companyId);

  const handleReview = () => {
    ui.dialog.open({
      title: 'พิจารณาคำขอลาหยุด',
      description: 'อนุมัติหรือปฏิเสธคำขอลาของพนักงาน',
      size: 'md',
      children: <LeaveReviewDialog leave={leave} companyId={leave.companyId} />,
    });
  };

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขคำขอลา',
      description: 'ปรับปรุงรายละเอียดหรือวันที่ขอลา',
      size: 'lg',
      children: <LeaveForm companyId={leave.companyId} leave={leave} />,
    });
  };

  const handleDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบคำขอลา',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการลบคำขอลานี้?',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(leave.id);
        ui.hideAll();
      },
    });
  };

  return (
    <ColumnActions
      actions={{
        พิจารณาอนุมัติ: {
          onAction: handleReview,
        },
        แก้ไข: {
          onAction: handleEdit,
        },
        ลบคำขอ: {
          onAction: handleDelete,
          variant: 'destructive',
        },
      }}
    />
  );
}
