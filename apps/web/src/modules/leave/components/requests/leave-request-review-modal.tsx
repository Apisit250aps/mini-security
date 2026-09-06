'use client';

import React from 'react';
import { formatDateRange } from '@/shared/utils/date';
import type { LeaveRequest } from '@repo/domains/entities';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SelectField, TextareaField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { ExternalLink } from 'lucide-react';
import { useLeaveRequestReview } from '../../hooks/leave-mutations';

export const reviewFormSchema = z.object({
  action: z.enum(['approved', 'rejected']),
  reviewNote: z.string().optional(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface LeaveRequestReviewModalProps {
  request: LeaveRequest;
  companyId: string;
  leaveTypeName?: string;
  memberName?: string;
  onSuccess: () => void;
}

export default function LeaveRequestReviewModal({
  request,
  companyId,
  leaveTypeName = 'การลา',
  memberName,
  onSuccess,
}: LeaveRequestReviewModalProps) {
  const reviewMutation = useLeaveRequestReview(companyId);

  const methods = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      action: 'approved',
      reviewNote: '',
    },
  });

  const onSubmit = React.useCallback(
    (data: ReviewFormValues) => {
      reviewMutation.mutate(
        {
          id: request.id,
          data: {
            action: data.action,
            reviewNote: data.reviewNote || undefined,
          },
        },
        {
          onSuccess: () => {
            onSuccess();
          },
        },
      );
    },
    [reviewMutation, request.id, onSuccess],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Request Details Summary */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
        {memberName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">พนักงาน:</span>
            <span className="font-semibold">{memberName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">ประเภทการลา:</span>
          <span className="font-semibold">{leaveTypeName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ช่วงเวลาที่ลา:</span>
          <span className="font-medium">
            {formatDateRange(request.startDate, request.endDate)} (
            {request.totalDays} วัน)
          </span>
        </div>
        <div className="flex flex-col gap-1 pt-2 border-t">
          <span className="text-muted-foreground text-xs">เหตุผลการลา:</span>
          <p className="text-sm bg-background p-2 rounded border">
            {request.reason}
          </p>
        </div>
        {request.proofUrl && (
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">หลักฐานแนบ:</span>
            <a
              href={request.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              เปิดดูเอกสาร <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Review Form */}
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FieldGroup className="flex flex-col gap-3">
          <SelectField
            name="action"
            label="ผลการพิจารณา"
            options={[
              { value: 'approved', label: 'อนุมัติคำขอลา (Approve)' },
              { value: 'rejected', label: 'ไม่อนุมัติ / ปฏิเสธ (Reject)' },
            ]}
            control={methods.control}
            required
          />

          <TextareaField
            name="reviewNote"
            label="ความเห็นหรือเหตุผลของผู้อนุมัติ"
            placeholder="ระบุเหตุผลในการอนุมัติหรือเหตุผลที่ไม่อนุมัติคำขอ..."
            control={methods.control}
          />
        </FieldGroup>

        <div className="flex justify-end">
          <ButtonLoading type="submit" isLoading={reviewMutation.isPending}>
            บันทึกผลการพิจารณา
          </ButtonLoading>
        </div>
      </form>
    </div>
  );
}
