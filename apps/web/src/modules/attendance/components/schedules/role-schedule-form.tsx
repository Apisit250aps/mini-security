'use client';

import { RoleSelectField } from '@/modules/role/components/role-select-field';
import { WorkShiftSelectField } from '@/modules/attendance/components/schedules/work-shift-select-field';
import { WorkScheduleSelect } from '@/modules/attendance/components/schedules/work-schedule-select';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleWorkScheduleSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import { useRoleWorkScheduleAssign } from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { DateField } from '@repo/ui/form';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';

type FormValues = z.infer<typeof createRoleWorkScheduleSchema>;

export default function RoleScheduleForm({
  companyId,
  workShiftId,
}: {
  companyId: string;
  workShiftId?: string;
}) {
  const ui = useOverlay();
  const [selectedScheduleId, setSelectedScheduleId] = React.useState('');

  const assignMutation = useRoleWorkScheduleAssign(companyId);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createRoleWorkScheduleSchema as never),
    mode: 'onChange',
    defaultValues: {
      roleId: '',
      companyId: companyId,
      workShiftId: workShiftId || '',
      effectiveDate: new Date(),
      endDate: null,
    },
  });

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
        <RoleSelectField
          name="roleId"
          companyId={companyId}
          label="เลือกตำแหน่ง / บทบาท (Role)"
          placeholder="เลือกบทบาทที่ต้องการมอบหมาย..."
          control={methods.control}
          required
        />

        {workShiftId && (
          <input type="hidden" {...methods.register('workShiftId')} />
        )}

        {!workShiftId && (
          <>
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
          </>
        )}

        <FieldGroup className="grid grid-cols-2 gap-3">
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
        </FieldGroup>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={assignMutation.isPending}>
          กำหนดกะให้ Role
        </ButtonLoading>
      </div>
    </form>
  );
}
