'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Textarea } from '@repo/ui/components/textarea';
import { useFormSubmissionReview } from '../../hooks/form-mutations';

interface FormSubmissionReviewDialogProps {
  submissionId: string;
  companyId: string;
  reviewerMemberId: string;
  onClose: () => void;
}

export default function FormSubmissionReviewDialog({
  submissionId,
  companyId,
  reviewerMemberId,
  onClose,
}: FormSubmissionReviewDialogProps) {
  const reviewMutation = useFormSubmissionReview(submissionId, companyId);
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [note, setNote] = useState('');

  const handleReview = useCallback(() => {
    reviewMutation.mutate(
      {
        memberId: reviewerMemberId,
        action,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }, [reviewMutation, reviewerMemberId, action, note, onClose]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        กรุณาตรวจสอบข้อมูลการบันทึกแบบฟอร์มก่อนทำการอนุมัติหรือปฏิเสธ
      </p>

      <div className="flex flex-col gap-2 border rounded-lg p-3">
        <label className="text-xs font-semibold text-muted-foreground">
          ผลการพิจารณา:
        </label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={action === 'APPROVE' ? 'default' : 'outline'}
            onPress={() => setAction('APPROVE')}
          >
            อนุมัติแบบฟอร์ม (Approve)
          </Button>
          <Button
            type="button"
            variant={action === 'REJECT' ? 'destructive' : 'outline'}
            onPress={() => setAction('REJECT')}
          >
            ไม่อนุมัติ / ให้แก้ไข (Reject)
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          {action === 'REJECT'
            ? 'เหตุผลที่ไม่อนุมัติ / รายละเอียดที่ต้องแก้ไข *'
            : 'ข้อคิดเห็นหรือหมายเหตุเพิ่มเติม (ถ้ามี)'}
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            action === 'REJECT'
              ? 'เช่น ข้อมูลส่วนที่ 2 ไม่ครบถ้วน กรุณาถ่ายรูปใหม่'
              : 'ระบุข้อคิดเห็นเพิ่มเติม...'
          }
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onPress={onClose}>
          ยกเลิก
        </Button>
        <ButtonLoading
          variant={action === 'REJECT' ? 'destructive' : 'default'}
          onPress={handleReview}
          isLoading={reviewMutation.isPending}
          isDisabled={action === 'REJECT' && !note.trim()}
        >
          {action === 'REJECT' ? 'ยืนยันปฏิเสธคำขอ' : 'ยืนยันอนุมัติ'}
        </ButtonLoading>
      </div>
    </div>
  );
}
