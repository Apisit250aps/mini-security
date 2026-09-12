'use client';

import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SelectField, TextareaField, DateField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import AttendanceSelectField from './attendance-select-field';
import { getWorkDate } from '../../utils/check-in-slot';
import {
  useRoleSchedulesQueries,
  useScheduleSlotsQueries,
} from '../../hooks/attendance-queries';
import type { FormProps } from '@/types';

export const manualCheckInFormSchema = z.object({
  companyMemberId: z.string().uuid('กรุณาเลือกพนักงาน'),
  scheduleSlotId: z.string().uuid('กรุณาเลือกรอบเวลา'),
  scheduleId: z.string().uuid('กรุณาเลือกตารางเวลา'),
  workDate: z.string().min(1, 'กรุณาระบุวันที่'),
  status: z.enum(['present', 'late', 'absent', 'excused']),
  note: z.string().optional(),
});

export type ManualCheckInFormValues = z.infer<typeof manualCheckInFormSchema>;

const STATUS_OPTIONS = [
  { value: 'present', label: 'มาตรงเวลา (Present)' },
  { value: 'late', label: 'มาสาย (Late)' },
  { value: 'absent', label: 'ขาดงาน (Absent)' },
  { value: 'excused', label: 'ลา/มีเหตุจำเป็น (Excused)' },
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
  const members = useCompanyMembersQueries(companyId);
  const users = useUserListQueries();

  const todayStr = useMemo(() => getWorkDate(new Date()), []);

  const methods = useForm<ManualCheckInFormValues>({
    resolver: zodResolver(manualCheckInFormSchema),
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
  const selectedMemberId = useWatch({
    control: methods.control,
    name: 'companyMemberId',
  });
  const selectedMember = members.data?.find(
    (member) => member.id === selectedMemberId && member.isActive,
  );
  const schedulesQuery = useRoleSchedulesQueries(
    companyId,
    selectedMember?.roleId,
  );
  const validSchedule = schedulesQuery.data?.some(
    (schedule) => schedule.id === selectedScheduleId,
  );
  const slotsQuery = useScheduleSlotsQueries(
    validSchedule ? selectedScheduleId : undefined,
  );
  const memberOptions = (members.data ?? [])
    .filter((member) => member.isActive)
    .map((member) => ({
      value: member.id,
      label:
        users.data?.find((user) => user.id === member.userId)?.name ??
        member.id,
    }));
  const failed =
    members.isError ||
    users.isError ||
    schedulesQuery.isError ||
    slotsQuery.isError;
  const loading =
    members.isLoading ||
    users.isLoading ||
    schedulesQuery.isLoading ||
    slotsQuery.isLoading;

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
      onSubmit={methods.handleSubmit((values) => {
        if (isLoading || loading || failed || !selectedMember || !validSchedule)
          return;
        if (
          !slotsQuery.data?.some((slot) => slot.id === values.scheduleSlotId)
        ) {
          methods.setError('scheduleSlotId', {
            message: 'กรุณาเลือกรอบของตารางที่ได้รับมอบหมาย',
          });
          return;
        }
        onSubmit(values);
      })}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <AttendanceSelectField
          name="companyMemberId"
          label="พนักงาน"
          options={memberOptions}
          control={methods.control}
          disabled={
            isLoading ||
            members.isLoading ||
            users.isLoading ||
            members.isError ||
            users.isError
          }
          onChange={() => {
            methods.setValue('scheduleId', '');
            methods.setValue('scheduleSlotId', '');
          }}
        />
        {failed && (
          <p role="alert">
            โหลดข้อมูลไม่สำเร็จ กรุณาปิดแล้วเปิดแบบฟอร์มอีกครั้ง
          </p>
        )}
        {selectedMember &&
          !schedulesQuery.isLoading &&
          !schedulesQuery.isError &&
          !scheduleOptions.length && (
            <p>พนักงานนี้ยังไม่มีตารางที่เปิดใช้งานและได้รับมอบหมาย</p>
          )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AttendanceSelectField
            name="scheduleId"
            label="ตารางเวลา"
            options={scheduleOptions}
            control={methods.control}
            disabled={
              isLoading ||
              !selectedMember ||
              schedulesQuery.isLoading ||
              schedulesQuery.isError
            }
            onChange={() => methods.setValue('scheduleSlotId', '')}
          />
          <AttendanceSelectField
            name="scheduleSlotId"
            label="รอบเวลา"
            options={slotOptions}
            control={methods.control}
            disabled={
              isLoading ||
              !validSchedule ||
              slotsQuery.isLoading ||
              slotsQuery.isError
            }
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
        <ButtonLoading
          type="submit"
          isLoading={isLoading}
          isDisabled={loading || failed || !selectedMember || !validSchedule}
        >
          บันทึกเวลา
        </ButtonLoading>
      </div>
    </form>
  );
}
