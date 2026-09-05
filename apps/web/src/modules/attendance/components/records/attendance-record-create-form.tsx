'use client';

import {
  SelectField,
  InputField,
  TextareaField,
  DateField,
} from '@repo/ui/form';

import { CompanyMemberSelectField } from '@/modules/company/components/members/company-member-select-field';
import { WorkShiftSelectField } from '@/modules/attendance/components/schedules/work-shift-select-field';
import { WorkScheduleSelect } from '@/modules/attendance/components/schedules/work-schedule-select';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceRecordSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import { useAttendanceRecordCreate } from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';

import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';

type FormValues = z.infer<typeof createAttendanceRecordSchema>;

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'รอตรวจสอบ (Pending)' },
  { value: 'APPROVED', label: 'อนุมัติ (Approved)' },
  { value: 'LATE', label: 'มาสาย (Late)' },
  { value: 'ABSENT', label: 'ขาดงาน (Absent)' },
];

export default function AttendanceRecordCreateForm({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();
  const createMutation = useAttendanceRecordCreate(companyId);
  const [selectedScheduleId, setSelectedScheduleId] = React.useState('');

  const methods = useForm<FormValues>({
    resolver: zodResolver(createAttendanceRecordSchema as never),
    defaultValues: {
      companyId,
      companyMemberId: '',
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
      workShiftId: data.workShiftId,
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
        <CompanyMemberSelectField
          name="companyMemberId"
          companyId={companyId}
          label="พนักงาน"
          placeholder="เลือกพนักงาน..."
          control={methods.control}
          required
        />

        <FieldGroup className="grid grid-cols-2 gap-3">
          <WorkScheduleSelect
            companyId={companyId}
            label="ตารางเวลาอ้างอิง"
            value={selectedScheduleId}
            onChange={(value) => {
              setSelectedScheduleId(value);
              methods.setValue('workShiftId', '', {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />

          <WorkShiftSelectField
            name="workShiftId"
            workScheduleId={selectedScheduleId}
            label="กะการทำงาน (Work Shift)"
            placeholder="เลือกกะ..."
            control={methods.control}
            required
          />
        </FieldGroup>

        <FieldGroup className="grid grid-cols-2 gap-3">
          <DateField
            name="workDate"
            label="วันที่ปฏิบัติงาน (Work Date)"
            placeholder="เลือกวันที่"
            control={methods.control}
          />

          <SelectField
            name="status"
            label="สถานะการลงเวลา"
            options={STATUS_OPTIONS}
            control={methods.control}
            required
          />
        </FieldGroup>

        <FieldGroup className="grid grid-cols-3 gap-2">
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
        </FieldGroup>

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
