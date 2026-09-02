'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceRecordSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import { useAttendanceRecordCreate } from '../../hooks/attendance-mutations';
import {
  useWorkSchedulesQueries,
  useWorkShiftsQueries,
} from '../../hooks/attendance-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import { useOverlay } from '@repo/ui/hooks';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { DateField } from '@repo/ui/components/shared/form/field-date';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';
import type { User } from '@repo/domains/entities';

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
  const { data: members = [] } = useCompanyMembersQueries(companyId);
  const { data: users = [] } = useUserListQueries();
  const { data: schedules = [] } = useWorkSchedulesQueries(companyId);

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    schedules[0]?.id || '',
  );

  useEffect(() => {
    if (!selectedScheduleId && schedules.length > 0) {
      setSelectedScheduleId(schedules[0]?.id || '');
    }
  }, [schedules, selectedScheduleId]);

  const { data: shifts = [] } = useWorkShiftsQueries(selectedScheduleId);

  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of users) {
      map.set(u.id, u);
    }
    return map;
  }, [users]);

  const memberOptions = useMemo(
    () =>
      members.map((m) => {
        const user = usersMap.get(m.userId);
        return {
          value: m.id,
          label: user ? `${user.name} (${user.email})` : `พนักงาน ID: ${m.id}`,
        };
      }),
    [members, usersMap],
  );

  const scheduleOptions = useMemo(
    () =>
      schedules.map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [schedules],
  );

  const shiftOptions = useMemo(
    () =>
      shifts.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.startTime} - ${s.endTime})`,
      })),
    [shifts],
  );

  const methods = useForm<FormValues>({
    resolver: zodResolver(createAttendanceRecordSchema as never),
    defaultValues: {
      companyId,
      companyMemberId: members[0]?.id || '',
      workShiftId: shifts[0]?.id || '',
      workDate: new Date(),
      status: 'APPROVED',
      totalWorkMinutes: 480,
      overtimeMinutes: 0,
      lateMinutes: 0,
      note: '',
    },
  });

  useEffect(() => {
    if (shifts.length > 0 && !methods.getValues('workShiftId')) {
      methods.setValue('workShiftId', shifts[0]?.id || '');
    }
  }, [shifts, methods]);

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
        <SelectField
          name="companyMemberId"
          label="พนักงาน"
          placeholder="เลือกพนักงาน..."
          options={memberOptions}
          control={methods.control}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              ตารางเวลาอ้างอิง
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => {
                setSelectedScheduleId(e.target.value);
                methods.setValue('workShiftId', '');
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" disabled>
                เลือกตารางเวลา...
              </option>
              {scheduleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <SelectField
            name="workShiftId"
            label="กะการทำงาน (Work Shift)"
            placeholder="เลือกกะ..."
            options={shiftOptions}
            control={methods.control}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
        </div>

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
