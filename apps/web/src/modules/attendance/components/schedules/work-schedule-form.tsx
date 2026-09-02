'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkScheduleSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import {
  useWorkScheduleCreate,
  useWorkScheduleUpdate,
} from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { SwitchField } from '@repo/ui/components/shared/form/boolean-fields';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';
import type { WorkSchedule } from '@repo/domains/entities';

type FormValues = z.infer<typeof createWorkScheduleSchema>;

export default function WorkScheduleForm({
  companyId,
  schedule,
}: {
  companyId: string;
  schedule?: WorkSchedule;
}) {
  const ui = useOverlay();
  const createMutation = useWorkScheduleCreate(companyId);
  const updateMutation = useWorkScheduleUpdate(companyId);

  const isEdit = Boolean(schedule);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createWorkScheduleSchema as never),
    defaultValues: {
      companyId,
      name: schedule?.name || '',
      description: schedule?.description || '',
      isActive: schedule?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: FormValues) => {
    if (isEdit && schedule) {
      await updateMutation.mutateAsync({
        id: schedule.id,
        data: {
          name: data.name,
          description: data.description || null,
          isActive: data.isActive,
        },
      });
    } else {
      await createMutation.mutateAsync({
        companyId,
        name: data.name,
        description: data.description || null,
        isActive: data.isActive,
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
          label="ชื่อตารางเวลาทำงาน"
          placeholder="เช่น ตารางงานปกติ (จันทร์ - ศุกร์)"
          control={methods.control}
          required
        />

        <TextareaField
          name="description"
          label="คำอธิบาย"
          placeholder="รายละเอียดของตารางเวลาทำงานนี้"
          control={methods.control}
        />

        <div className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานตารางเวลานี้"
            description="หากปิดใช้งาน พนักงานจะไม่สามารถผูกกับตารางนี้ได้"
            control={methods.control}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={isLoading}>
          {isEdit ? 'บันทึกการแก้ไข' : 'สร้างตารางเวลา'}
        </ButtonLoading>
      </div>
    </form>
  );
}
