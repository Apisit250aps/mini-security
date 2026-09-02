'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { LeaveRequest } from '@repo/domains/entities';
import { useLeaveRequestReview } from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';

const reviewSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
  reviewNote: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const STATUS_OPTIONS = [
  { value: 'APPROVED', label: 'อนุมัติการลา (Approved)' },
  { value: 'REJECTED', label: 'ปฏิเสธคำขอลา (Rejected)' },
  { value: 'CANCELLED', label: 'ยกเลิกคำขอ (Cancelled)' },
  { value: 'PENDING', label: 'รอดำเนินการ (Pending)' },
];

export default function LeaveReviewDialog({
  leave,
  companyId,
}: {
  leave: LeaveRequest;
  companyId: string;
}) {
  const ui = useOverlay();
  const reviewMutation = useLeaveRequestReview(companyId);

  const methods = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: leave.status as ReviewFormValues['status'],
      reviewNote: leave.reviewNote || '',
    },
  });

  const handleSubmit = async (data: ReviewFormValues) => {
    await reviewMutation.mutateAsync({
      id: leave.id,
      data: {
        status: data.status,
        reviewNote: data.reviewNote,
      },
    });
    ui.hideAll();
  };

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <SelectField
          name="status"
          label="ผลการพิจารณาคำขอลา"
          placeholder="เลือกผลการพิจารณา..."
          options={STATUS_OPTIONS}
          control={methods.control}
          required
        />

        <TextareaField
          name="reviewNote"
          label="ข้อความประกอบการพิจารณา / หมายเหตุ"
          placeholder="ระบุความคิดเห็นหรือข้อความแจ้งพนักงาน"
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={reviewMutation.isPending}>
          บันทึกผลการพิจารณา
        </ButtonLoading>
      </div>
    </form>
  );
}
