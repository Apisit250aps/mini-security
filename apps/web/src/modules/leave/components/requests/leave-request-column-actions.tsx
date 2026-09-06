'use client';

import React, { useCallback } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { LeaveRequest } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useLeaveRequestCancel } from '../../hooks/leave-mutations';
import LeaveRequestReviewModal from './leave-request-review-modal';
import { formatDate } from '@/shared/utils';

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

  const actionReview = useCallback(() => {
    ui.dialog.open({
      title: 'พิจารณาคำขอลาหยุดงาน',
      description: 'ตรวจสอบความถูกต้องและอนุมัติหรือปฏิเสธคำขอนี้',
      size: 'lg',
      children: (
        <LeaveRequestReviewModal
          request={request}
          companyId={companyId}
          leaveTypeName={leaveTypeName}
          memberName={memberName}
          onSuccess={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, request, companyId, leaveTypeName, memberName]);

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

  const actionViewDetails = useCallback(() => {
    ui.dialog.open({
      title: 'รายละเอียดคำขอลา',
      description: `สถานะ: ${request.status}`,
      children: (
        <div className="space-y-3 text-sm">
          {memberName && (
            <div>
              <span className="text-muted-foreground text-xs">พนักงาน:</span>
              <p className="mt-0.5 font-medium">{memberName}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground text-xs">เหตุผลการลา:</span>
            <p className="mt-1 p-2 bg-muted rounded border">{request.reason}</p>
          </div>
          {request.reviewNote && (
            <div>
              <span className="text-muted-foreground text-xs">
                ความคิดเห็นจากผู้อนุมัติ:
              </span>
              <p className="mt-1 p-2 bg-muted rounded border">
                {request.reviewNote}
              </p>
            </div>
          )}
          {request.reviewedAt && (
            <p className="text-xs text-muted-foreground">
              พิจารณาเมื่อ: {formatDate(request.reviewedAt)}
            </p>
          )}
        </div>
      ),
    });
  }, [ui.dialog, request, memberName]);

  if (request.status === 'pending') {
    return (
      <ColumnActions
        actions={{
          'พิจารณาอนุมัติ/ปฏิเสธ': {
            onAction: actionReview,
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
        ดูรายละเอียด: {
          onAction: actionViewDetails,
        },
      }}
    />
  );
}
