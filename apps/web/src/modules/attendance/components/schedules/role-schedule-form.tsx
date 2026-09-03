'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleWorkScheduleSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import { useRoleWorkScheduleAssign } from '../../hooks/attendance-mutations';
import {
  useWorkSchedulesQueries,
  useWorkShiftsQueries,
} from '../../hooks/attendance-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useOverlay } from '@repo/ui/hooks';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { DateField } from '@repo/ui/components/shared/form/field-date';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';

type FormValues = z.infer<typeof createRoleWorkScheduleSchema>;

export default function RoleScheduleForm({ companyId }: { companyId: string }) {
  const ui = useOverlay();
  const { data: roles = [] } = useCompanyRolesQueries(companyId);
  const { data: schedules = [] } = useWorkSchedulesQueries(companyId);

  const [selectedScheduleId, setSelectedScheduleId] =
    React.useState<string>('');
  const activeScheduleId = selectedScheduleId || schedules[0]?.id || '';

  const { data: shifts = [] } = useWorkShiftsQueries(activeScheduleId);

  const roleOptions = useMemo(
    () =>
      roles
        .filter((r) => r.roleType !== 'SUPER_ADMIN')
        .map((r) => ({
          value: r.id,
          label: r.name,
        })),
    [roles],
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

  const assignMutation = useRoleWorkScheduleAssign(companyId);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createRoleWorkScheduleSchema as never),
    defaultValues: {
      roleId: roles[0]?.id || '',
      companyId: companyId,
      workShiftId: shifts[0]?.id || '',
      effectiveDate: new Date(),
      endDate: null,
    },
  });

  useEffect(() => {
    if (shifts.length > 0 && !methods.getValues('workShiftId')) {
      methods.setValue('workShiftId', shifts[0]?.id || '');
    }
  }, [shifts, methods]);

  const handleSubmit = async (data: FormValues) => {
    await assignMutation.mutateAsync({
      roleId: data.roleId,
      companyId: companyId,
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
          name="roleId"
          label="เลือกตำแหน่ง / บทบาท (Role)"
          placeholder="เลือกบทบาทที่ต้องการมอบหมาย..."
          options={roleOptions}
          control={methods.control}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">
            ตารางเวลาอ้างอิง
          </label>
          <select
            value={activeScheduleId}
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

        <div className="grid grid-cols-2 gap-3">
          <DateField
            name="effectiveDate"
            label="วันที่เริ่มมีผล (Effective Date)"
            placeholder="เลือกวันที่เริ่มใช้งาน"
            control={methods.control}
          />
          <DateField
            name="endDate"
            label="วันที่สิ้นสุด (ถ้ามี)"
            placeholder="ไม่ระบุ = ใช้งานต่อเนื่อง"
            control={methods.control}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={assignMutation.isPending}>
          กำหนดกะให้ Role
        </ButtonLoading>
      </div>
    </form>
  );
}
