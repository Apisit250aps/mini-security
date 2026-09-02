'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkShiftSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import {
  useWorkShiftCreate,
  useWorkShiftUpdate,
} from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { SwitchField } from '@repo/ui/components/shared/form/boolean-fields';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';
import type { WorkShift } from '@repo/domains/entities';

type FormValues = z.infer<typeof createWorkShiftSchema>;

export default function WorkShiftForm({
  companyId,
  workScheduleId,
  shift,
}: {
  companyId: string;
  workScheduleId: string;
  shift?: WorkShift;
}) {
  const ui = useOverlay();
  const createMutation = useWorkShiftCreate(workScheduleId);
  const updateMutation = useWorkShiftUpdate(workScheduleId);

  const isEdit = Boolean(shift);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createWorkShiftSchema as never),
    defaultValues: {
      companyId,
      workScheduleId,
      name: shift?.name || '',
      startTime: shift?.startTime || '09:00',
      endTime: shift?.endTime || '18:00',
      isOvernight: shift?.isOvernight ?? false,
      color: shift?.color || '#3b82f6',
    },
  });

  const handleSubmit = async (data: FormValues) => {
    if (isEdit && shift) {
      await updateMutation.mutateAsync({
        id: shift.id,
        data: {
          name: data.name,
          startTime: data.startTime,
          endTime: data.endTime,
          isOvernight: data.isOvernight,
          color: data.color || null,
        },
      });
    } else {
      await createMutation.mutateAsync({
        companyId,
        workScheduleId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        isOvernight: data.isOvernight,
        color: data.color || null,
      });
    }
    ui.hideAll();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <InputField
          name="name"
          label="ชื่อกะการทำงาน"
          placeholder="เช่น กะเช้า (Morning Shift)"
          control={methods.control}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <InputField
            name="startTime"
            label="เวลาเริ่มงาน (HH:mm)"
            placeholder="09:00"
            control={methods.control}
            required
          />
          <InputField
            name="endTime"
            label="เวลาเลิกงาน (HH:mm)"
            placeholder="18:00"
            control={methods.control}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            name="color"
            label="สีประจำกะ (Hex Code)"
            type="color"
            control={methods.control}
          />
          <div className="flex flex-col justify-center rounded-lg border p-3">
            <SwitchField
              name="isOvernight"
              label="กะข้ามคืน (Overnight)"
              description="กะทำงานที่สิ้นสุดในวันถัดไป"
              control={methods.control}
            />
          </div>
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={isLoading}>
          {isEdit ? 'บันทึกการแก้ไข' : 'สร้างกะทำงาน'}
        </ButtonLoading>
      </div>
    </form>
  );
}
