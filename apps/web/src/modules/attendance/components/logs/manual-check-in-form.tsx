'use client';

import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SelectField, TextareaField, DateField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import {
  useCompanySchedulesQueries,
  useScheduleSlotsQueries,
} from '../../hooks/attendance-queries';
import type { FormProps } from '@/types';

export const manualCheckInFormSchema = z.object({
  companyMemberId: z.string().uuid('กรุณาเลือกพนักงาน'),
  scheduleId: z.string().uuid('กรุณาเลือกตารางเวลา'),
  scheduleSlotId: z.string().uuid('กรุณาเลือกรอบเวลา'),
  workDate: z.string().min(1, 'กรุณาระบุวันที่ทำงาน'),
  status: z.enum(['present', 'late', 'absent', 'excused']),
  note: z.string().optional(),
});

export type ManualCheckInFormValues = z.infer<typeof manualCheckInFormSchema>;

const STATUS_OPTIONS = [
  { value: 'present', label: 'มาตรงเวลา (Present)' },
  { value: 'late', label: 'มาสาย (Late)' },
  { value: 'absent', label: 'ขาดงาน (Absent)' },
  { value: 'excused', label: 'ลาได้รับอนุญาต (Excused)' },
];

interface ManualCheckInFormProps extends FormProps<ManualCheckInFormValues> {
  companyId: string;
}

export default function ManualCheckInForm({
  companyId,
  onSubmit,
  defaultValues,
  isLoading,
}: ManualCheckInFormProps) {
  const membersQuery = useCompanyMembersQueries(companyId);
  const schedulesQuery = useCompanySchedulesQueries(companyId);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0]!;
  }, []);

  const methods = useForm<ManualCheckInFormValues>({
    resolver: zodResolver(manualCheckInFormSchema as never),
    defaultValues: defaultValues ?? {
      companyMemberId: '',
      scheduleId: '',
      scheduleSlotId: '',
      workDate: todayStr,
      status: 'present',
      note: '',
    },
  });

  const selectedScheduleId = useWatch({
    control: methods.control,
    name: 'scheduleId',
  });
  const slotsQuery = useScheduleSlotsQueries(selectedScheduleId);

  const memberOptions = useMemo(() => {
    return (membersQuery.data || []).map((m) => ({
      value: m.id,
      label: m.userId || m.id,
    }));
  }, [membersQuery.data]);

  const scheduleOptions = useMemo(() => {
    return (schedulesQuery.data || []).map((s) => ({
      value: s.id,
      label: s.name,
    }));
  }, [schedulesQuery.data]);

  const slotOptions = useMemo(() => {
    return (slotsQuery.data || []).map((slot) => ({
      value: slot.id,
      label: `${slot.label} (${slot.windowStart} - ${slot.windowEnd})`,
    }));
  }, [slotsQuery.data]);

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <SelectField
          name="companyMemberId"
          label="พนักงาน"
          placeholder="เลือกพนักงาน..."
          options={memberOptions}
          control={methods.control}
          disabled={membersQuery.isLoading}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectField
            name="scheduleId"
            label="ตารางเวลา"
            placeholder="เลือกตาราง..."
            options={scheduleOptions}
            control={methods.control}
            required
          />

          <SelectField
            name="scheduleSlotId"
            label="รอบเวลา (Slot)"
            placeholder={
              selectedScheduleId ? 'เลือกรอบเวลา...' : 'กรุณาเลือกตารางเวลาก่อน'
            }
            options={slotOptions}
            control={methods.control}
            disabled={!selectedScheduleId || slotsQuery.isLoading}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DateField
            name="workDate"
            label="วันที่ทำงาน"
            placeholder="เลือกวันที่ทำงาน..."
            control={methods.control}
            valueFormat="string"
            required
          />

          <SelectField
            name="status"
            label="สถานะการเข้างาน"
            options={STATUS_OPTIONS}
            control={methods.control}
            required
          />
        </div>

        <TextareaField
          name="note"
          label="หมายเหตุเพิ่มเติม"
          placeholder="ระบุเหตุผลหรือรายละเอียดการลงเวลาแทนพนักงาน"
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={isLoading}>
          บันทึกเวลา
        </ButtonLoading>
      </div>
    </form>
  );
}
