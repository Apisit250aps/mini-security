'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  SwitchField,
  SelectField,
  TextareaField,
} from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import type { FormProps } from '@/types';

export const leaveTypeFormSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อประเภทการลา'),
  description: z.string().optional(),
  unit: z.enum(['day', 'half_day', 'hour']).default('day'),
  requiresProof: z.boolean().default(false),
  maxDaysPerYear: z.coerce.number().nullable().optional(),
  isPaid: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export type LeaveTypeFormValues = z.infer<typeof leaveTypeFormSchema>;

const UNIT_OPTIONS = [
  { value: 'day', label: 'เต็มวัน (Day)' },
  { value: 'half_day', label: 'ครึ่งวัน (Half Day)' },
  { value: 'hour', label: 'รายชั่วโมง (Hour)' },
];

export default function LeaveTypeForm({
  onSubmit,
  defaultValues,
  isLoading,
}: FormProps<LeaveTypeFormValues>) {
  const methods = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeFormSchema as never),
    defaultValues: defaultValues ?? {
      name: '',
      description: '',
      unit: 'day',
      requiresProof: false,
      maxDaysPerYear: 30,
      isPaid: true,
      isActive: true,
    },
  });

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <InputField
          name="name"
          label="ชื่อประเภทการลา"
          placeholder="เช่น ลาพักร้อน, ลาป่วย, ลากิจ"
          control={methods.control}
          required
        />

        <TextareaField
          name="description"
          label="คำอธิบาย / นโยบายการลา"
          placeholder="ระบุข้อกำหนด เงื่อนไขการลา"
          control={methods.control}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectField
            name="unit"
            label="หน่วยการนับวันลา"
            options={UNIT_OPTIONS}
            control={methods.control}
            required
          />

          <InputField
            name="maxDaysPerYear"
            label="โควต้าสูงสุดต่อปี (วัน)"
            type="number"
            placeholder="เช่น 30 (เว้นว่างหากไม่จำกัด)"
            control={methods.control}
          />
        </div>

        <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isPaid"
            label="ได้รับค่าจ้าง (Paid Leave)"
            description="พนักงานยังคงได้รับค่าจ้างตามปกติระหว่างการลาประเภทนี้"
            control={methods.control}
          />

          <SwitchField
            name="requiresProof"
            label="ต้องแนบหลักฐาน (Require Proof)"
            description="บังคับให้พนักงานแนบเอกสารหรือใบรับรองแพทย์เมื่อยื่นคำขอลา"
            control={methods.control}
          />

          <SwitchField
            name="isActive"
            label="เปิดใช้งานประเภทการลานี้ (Active)"
            description="อนุญาตให้พนักงานเลือกยื่นคำขอลาประเภทนี้ได้"
            control={methods.control}
          />
        </FieldGroup>
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={isLoading}>
          บันทึกประเภทการลา
        </ButtonLoading>
      </div>
    </form>
  );
}
