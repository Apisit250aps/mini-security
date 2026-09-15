'use client';

import React, { useCallback } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { LeaveRequest } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useLeaveRequestCancel } from '../../hooks/leave-mutations';
import LeaveRequestDetailSheet from './leave-request-detail-sheet';

interface LeaveRequestColumnActionsProps<T extends LeaveRequest> {
  cell: CellContext<T, unknown>;
  companyId: string;
  leaveTypeName?: string;
  memberName?: string;
}

export default function LeaveRequestColumnActions<T extends LeaveRequest>({
  cell,
  companyId,
  leaveTypeName,
  memberName,
}: LeaveRequestColumnActionsProps<T>) {
  const ui = useOverlay();
  const cancelMutation = useLeaveRequestCancel(companyId);
  const request = cell.row.original;

  const actionOpenSheet = useCallback(() => {
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
  }, [ui.sheet, request, companyId, leaveTypeName, memberName]);

  const actionCancel = useCallback(() => {
    ui.alert.open({
      title: 'ยืนยันการยกเลิกคำขอลา',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอลานี้?',
      confirmVariant: 'destructive',
      onConfirm: () => {
        cancelMutation.mutate(request.id, {
          onSuccess: () => {
            ui.alert.close();
          },
        });
      },
    });
  }, [ui.alert, cancelMutation, request.id]);

  if (request.status === 'pending') {
    return (
      <ColumnActions
        actions={{
          'พิจารณาอนุมัติ/ปฏิเสธ (Review)': {
            onAction: actionOpenSheet,
          },
          ยกเลิกคำขอ: {
            onAction: actionCancel,
            variant: 'destructive',
          },
        }}
      />
    );
  }

  return (
    <ColumnActions
      actions={{
        'ดูรายละเอียดคำขอ (View Details)': {
          onAction: actionOpenSheet,
        },
      }}
    />
  );
}
