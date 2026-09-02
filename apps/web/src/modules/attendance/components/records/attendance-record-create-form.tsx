'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceRecordSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import { useAttendanceRecordCreate } from '../../hooks/attendance-mutations';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useOverlay } from '@repo/ui/hooks';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';

type FormValues = z.infer<typeof createAttendanceRecordSchema>;

export default function AttendanceRecordCreateForm({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();
  const createMutation = useAttendanceRecordCreate(companyId);
  const { data: members = [] } = useCompanyMembersQueries(companyId);

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `พนักงาน: ${m.userId}`,
  }));

  const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'รอตรวจสอบ (Pending)' },
    { value: 'APPROVED', label: 'อนุมัติ (Approved)' },
    { value: 'LATE', label: 'มาสาย (Late)' },
    { value: 'ABSENT', label: 'ขาดงาน (Absent)' },
  ];

  const methods = useForm<FormValues>({
    resolver: zodResolver(createAttendanceRecordSchema as never),
    defaultValues: {
      companyId,
      companyMemberId: members[0]?.id || '',
      workShiftId: '',
      workDate: new Date(),
      status: 'APPROVED',
      totalWorkMinutes: 480,
      overtimeMinutes: 0,
      lateMinutes: 0,
      note: '',
    },
  });

  const handleSubmit = async (data: FormValues) => {
    await createMutation.mutateAsync({
      companyId,
      companyMemberId: data.companyMemberId,
      workShiftId: data.workShiftId || '00000000-0000-0000-0000-000000000000',
      workDate: data.workDate,
      status: data.status,
      totalWorkMinutes: Number(data.totalWorkMinutes) || null,
      overtimeMinutes: Number(data.overtimeMinutes) || null,
      lateMinutes: Number(data.lateMinutes) || null,
      note: data.note || null,
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
          name="companyMemberId"
          label="พนักงาน"
          placeholder="เลือกพนักงาน..."
          options={memberOptions}
          control={methods.control}
          required
        />

        <InputField
          name="workShiftId"
          label="รหัสกะทำงาน (Work Shift ID)"
          placeholder="เช่น UUID ของกะทำงาน"
          control={methods.control}
          required
        />

        <SelectField
          name="status"
          label="สถานะเริ่มต้น"
          options={STATUS_OPTIONS}
          control={methods.control}
          required
        />

        <div className="grid grid-cols-3 gap-2">
          <InputField
            name="totalWorkMinutes"
            label="เวลาทำงาน (นาที)"
            type="number"
            control={methods.control}
          />
          <InputField
            name="lateMinutes"
            label="สาย (นาที)"
            type="number"
            control={methods.control}
          />
          <InputField
            name="overtimeMinutes"
            label="OT (นาที)"
            type="number"
            control={methods.control}
          />
        </div>

        <TextareaField
          name="note"
          label="หมายเหตุ"
          placeholder="ระบุข้อความหรือหมายเหตุเพิ่มเติม"
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={createMutation.isPending}>
          บันทึกเวลา
        </ButtonLoading>
      </div>
    </form>
  );
}
