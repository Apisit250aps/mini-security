'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField, SwitchField, TimeRangeField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import type { FormProps } from '@/types';

export const slotFormSchema = z.object({
  label: z.string().min(1, 'กรุณาระบุชื่อรอบเวลา'),
  slotOrder: z.coerce.number().min(1, 'ลำดับรอบต้องมีค่าตั้งแต่ 1 ขึ้นไป'),
  windowStart: z.string().min(1, 'กรุณาระบุเวลาเริ่มต้นรอบ'),
  windowEnd: z.string().min(1, 'กรุณาระบุเวลาสิ้นสุดรอบ'),
  isRequired: z.boolean().default(true),
});

export type SlotFormValues = z.infer<typeof slotFormSchema>;

export default function SlotForm({
  onSubmit,
  defaultValues,
  isLoading,
}: FormProps<SlotFormValues>) {
  const methods = useForm<SlotFormValues>({
    resolver: zodResolver(slotFormSchema as never),
    defaultValues: defaultValues ?? {
      label: '',
      slotOrder: 1,
      windowStart: '08:00:00',
      windowEnd: '09:00:00',
      isRequired: true,
    },
  });

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <InputField
          name="label"
          label="ชื่อรอบเวลา"
          placeholder="เช่น เข้างานภาคเช้า, ออกงานภาคเย็น"
          control={methods.control}
          required
        />

        <InputField
          name="slotOrder"
          label="ลำดับรอบ (Slot Order)"
          type="number"
          placeholder="1"
          control={methods.control}
          required
        />

        <TimeRangeField
          control={methods.control}
          startName="windowStart"
          endName="windowEnd"
          label="ช่วงเวลาของรอบ (Time Window)"
          placeholder="เลือกช่วงเวลาของรอบ (เช่น 08:00:00 - 09:00:00)"
          required
        />

        <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isRequired"
            label="บังคับเช็คชื่อรอบนี้ (Required)"
            description="หากไม่เช็คชื่อในรอบนี้จะถูกบันทึกเป็นขาดงานอัตโนมัติ"
            control={methods.control}
          />
        </FieldGroup>
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={isLoading}>
          บันทึกรอบเวลา
        </ButtonLoading>
      </div>
    </form>
  );
}
