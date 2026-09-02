'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AttendanceRecord } from '@repo/domains/entities';
import { useAttendanceRecordApprove } from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';

const approveSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'LATE', 'ABSENT']),
  note: z.string().optional(),
});

type ApproveFormValues = z.infer<typeof approveSchema>;

const STATUS_OPTIONS = [
  { value: 'APPROVED', label: 'อนุมัติเวลาทำงาน (Approved)' },
  { value: 'LATE', label: 'มาสาย (Late)' },
  { value: 'ABSENT', label: 'ขาดงาน (Absent)' },
  { value: 'REJECTED', label: 'ปฏิเสธ / ไม่ผ่านเงื่อนไข (Rejected)' },
  { value: 'PENDING', label: 'รอดำเนินการ (Pending)' },
];

export default function AttendanceApproveDialog({
  record,
  companyId,
}: {
  record: AttendanceRecord;
  companyId: string;
}) {
  const ui = useOverlay();
  const approveMutation = useAttendanceRecordApprove(companyId);

  const methods = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      status: record.status as ApproveFormValues['status'],
      note: record.note || '',
    },
  });

  const handleSubmit = async (data: ApproveFormValues) => {
    await approveMutation.mutateAsync({
      id: record.id,
      data: {
        status: data.status,
        note: data.note,
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
          label="สถานะการลงเวลา"
          placeholder="เลือกสถานะ..."
          options={STATUS_OPTIONS}
          control={methods.control}
          required
        />

        <TextareaField
          name="note"
          label="หมายเหตุการอนุมัติ / ตรวจสอบ"
          placeholder="ระบุเหตุผลหรือข้อความประกอบการอนุมัติ"
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={approveMutation.isPending}>
          บันทึกผลการตรวจสอบ
        </ButtonLoading>
      </div>
    </form>
  );
}
