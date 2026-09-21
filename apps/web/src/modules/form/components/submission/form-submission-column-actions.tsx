'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CellContext } from '@tanstack/react-table';
import type { FormSubmission } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useOrganizationMembersQueries } from '@/modules/organization/hooks/organization-queries';
import { useFormSubmissionCreateCorrection } from '../../hooks/form-mutations';
import FormSubmissionReviewDialog from './form-submission-review-dialog';

interface FormSubmissionColumnActionsProps<T extends FormSubmission> {
  cell: CellContext<T, unknown>;
  organizationId?: string;
}

export default function FormSubmissionColumnActions<T extends FormSubmission>({
  cell,
  organizationId,
}: FormSubmissionColumnActionsProps<T>) {
  const activeOrgId = organizationId || '';
  const router = useRouter();
  const ui = useOverlay();
  const submission = cell.row.original;
  const cloneMutation = useFormSubmissionCreateCorrection(
    submission.id,
    activeOrgId,
  );

  const { data: session } = useSession();
  const membersQuery = useOrganizationMembersQueries(activeOrgId);
  const currentMember = membersQuery.data?.find(
    (m) => m.userId === session?.user.id && m.isActive,
  );

  const memberId = currentMember?.id || '';

  const actionFill = useCallback(() => {
    router.push(`/organization/forms/submissions/${submission.id}`);
  }, [router, submission.id]);

  const actionReview = useCallback(() => {
    ui.dialog.open({
      title: 'พิจารณาอนุมัติ/ปฏิเสธแบบฟอร์ม',
      description: `รหัสการบันทึก: #${submission.id.slice(0, 8)}`,
      size: 'md',
      children: (
        <FormSubmissionReviewDialog
          submissionId={submission.id}
          organizationId={activeOrgId}
          reviewerMemberId={memberId}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, submission.id, activeOrgId, memberId]);

  const actionClone = useCallback(() => {
    ui.alert.open({
      title: 'ยืนยันการคัดลอกเพื่อสร้างฉบับแก้ไข',
      description:
        'ระบบจะคัดลอกคำตอบทั้งหมดจากฉบับเดิมที่ถูกปฏิเสธ มาสร้างเป็นฉบับร่างใหม่ (Draft) เพื่อให้แก้ไขและส่งใหม่',
      confirmVariant: 'default',
      onConfirm: () => {
        cloneMutation.mutate(undefined, {
          onSuccess: (res: { data?: { id?: string } }) => {
            ui.alert.close();
            const newSub = res?.data;
            if (newSub?.id) {
              router.push(`/organization/forms/submissions/${newSub.id}`);
            }
          },
        });
      },
    });
  }, [ui.alert, cloneMutation, router]);

  if (!submission.submittedAt) {
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

  return (
    <ColumnActions
      actions={{
        ดูรายละเอียดและคำตอบ: {
          onAction: actionFill,
        },
        'พิจารณาผล (อนุมัติ/ปฏิเสธ)': {
          onAction: actionReview,
        },
        'คัดลอกสร้างฉบับแก้ไข (Clone)': {
          onAction: actionClone,
        },
      }}
    />
  );
}
