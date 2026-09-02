'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberWorkScheduleSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import { useMemberWorkScheduleAssign } from '../../hooks/attendance-mutations';
import {
  useWorkSchedulesQueries,
  useWorkShiftsQueries,
} from '../../hooks/attendance-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useOverlay } from '@repo/ui/hooks';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';

type FormValues = z.infer<typeof createMemberWorkScheduleSchema>;

export default function MemberScheduleForm({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();
  const { data: members = [] } = useCompanyMembersQueries(companyId);
  const { data: schedules = [] } = useWorkSchedulesQueries(companyId);

  const [selectedScheduleId, setSelectedScheduleId] = React.useState<string>(
    schedules[0]?.id || '',
  );

  const { data: shifts = [] } = useWorkShiftsQueries(selectedScheduleId);

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `พนักงาน: ${m.userId}`,
  }));

  const scheduleOptions = schedules.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const shiftOptions = useMemo(
    () =>
      shifts.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.startTime} - ${s.endTime})`,
      })),
    [shifts],
  );

  const assignMutation = useMemberWorkScheduleAssign(members[0]?.id || '');

  const methods = useForm<FormValues>({
    resolver: zodResolver(createMemberWorkScheduleSchema as never),
    defaultValues: {
      companyMemberId: members[0]?.id || '',
      workShiftId: shifts[0]?.id || '',
      effectiveDate: new Date(),
      endDate: null,
    },
  });

  const handleSubmit = async (data: FormValues) => {
    await assignMutation.mutateAsync({
      companyMemberId: data.companyMemberId,
      workShiftId: data.workShiftId,
      effectiveDate: data.effectiveDate,
      endDate: data.endDate || null,
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
          label="เลือกพนักงาน"
          placeholder="เลือกพนักงานที่ต้องการมอบหมาย..."
          options={memberOptions}
          control={methods.control}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            ตารางเวลาอ้างอิง
          </label>
          <select
            value={selectedScheduleId}
            onChange={(e) => setSelectedScheduleId(e.target.value)}
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
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={assignMutation.isPending}>
          มอบหมายกะทำงาน
        </ButtonLoading>
      </div>
    </form>
  );
}
