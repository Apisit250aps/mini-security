'use client';

import React, { useCallback } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { FormSubmission } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useFormSubmissionClone } from '../../hooks/form-mutations';
import FormFillerModal from '../fill/form-filler-modal';
import FormSubmissionReviewDialog from './form-submission-review-dialog';

interface FormSubmissionColumnActionsProps<T extends FormSubmission> {
  cell: CellContext<T, unknown>;
  companyId: string;
}

export default function FormSubmissionColumnActions<T extends FormSubmission>({
  cell,
  companyId,
}: FormSubmissionColumnActionsProps<T>) {
  const ui = useOverlay();
  const submission = cell.row.original;
  const cloneMutation = useFormSubmissionClone(companyId);

  const { data: session } = useSession();
  const membersQuery = useCompanyMembersQueries(companyId);
  const currentMember = membersQuery.data?.find(
    (m) => m.userId === session?.user.id && m.isActive,
  );

  const memberId = currentMember?.id || '';

  const actionFill = useCallback(() => {
    ui.dialog.open({
      title: 'บันทึกแบบฟอร์ม',
      description: 'กรอกหรือแก้ไขข้อมูลแบบฟอร์ม',
      size: 'lg',
      children: (
        <FormFillerModal
          submissionId={submission.id}
          companyId={companyId}
          memberId={memberId}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, submission.id, companyId, memberId]);

  const actionReview = useCallback(() => {
    ui.dialog.open({
      title: 'พิจารณาอนุมัติ/ปฏิเสธแบบฟอร์ม',
      description: `รหัสการบันทึก: #${submission.id.slice(0, 8)}`,
      size: 'md',
      children: (
        <FormSubmissionReviewDialog
          submissionId={submission.id}
          companyId={companyId}
          reviewerMemberId={memberId}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, submission.id, companyId, memberId]);

  const actionClone = useCallback(() => {
    ui.alert.open({
      title: 'ยืนยันการคัดลอกเพื่อสร้างฉบับแก้ไข',
      description:
        'ระบบจะคัดลอกคำตอบทั้งหมดจากฉบับเดิมที่ถูกปฏิเสธ มาสร้างเป็นฉบับร่างใหม่ (Draft) เพื่อให้แก้ไขและส่งใหม่',
      confirmVariant: 'default',
      onConfirm: () => {
        cloneMutation.mutate(
          {
            id: submission.id,
            data: { memberId },
          },
          {
            onSuccess: () => {
              ui.alert.close();
            },
          },
        );
      },
    });
  }, [ui.alert, cloneMutation, submission.id, memberId]);

  if (submission.status === 'DRAFT') {
    return (
      <ColumnActions
        actions={{
          'กรอก/แก้ไขฟอร์มต่อ': {
            onAction: actionFill,
          },
        }}
      />
    );
  }

  if (submission.status === 'SUBMITTED') {
    return (
      <ColumnActions
        actions={{
          ดูรายละเอียดและคำตอบ: {
            onAction: actionFill,
          },
          'พิจารณาผล (อนุมัติ/ปฏิเสธ)': {
            onAction: actionReview,
          },
        }}
      />
    );
  }

  if (submission.status === 'REJECTED') {
    return (
      <ColumnActions
        actions={{
          ดูรายละเอียดและคำตอบ: {
            onAction: actionFill,
          },
          'คัดลอกสร้างฉบับแก้ไข (Clone)': {
            onAction: actionClone,
          },
        }}
      />
    );
  }

  // APPROVED
  return (
    <ColumnActions
      actions={{
        ดูรายละเอียดและคำตอบ: {
          onAction: actionFill,
        },
      }}
    />
  );
}
