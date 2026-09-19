'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { LeaveTypeSelectField } from '@/shared/components/form';
import type { FormProps } from '@/types';

export const quotaFormSchema = z.object({
  leaveTypeId: z.string().uuid('กรุณาเลือกประเภทการลา'),
  year: z.coerce.number().min(2000, 'ปีต้องมากกว่า 2000'),
  totalDays: z.coerce.number().min(0, 'จำนวนวันต้องไม่ติดลบ'),
});

export type QuotaFormValues = z.infer<typeof quotaFormSchema>;

interface QuotaFormProps extends FormProps<QuotaFormValues> {
  companyId: string;
  isEditing?: boolean;
}

export default function QuotaForm({
  companyId,
  onSubmit,
  defaultValues,
  isLoading,
  isEditing = false,
}: QuotaFormProps) {
  const methods = useForm<QuotaFormValues>({
    resolver: zodResolver(quotaFormSchema as never),
    defaultValues: defaultValues ?? {
      leaveTypeId: '',
      year: new Date().getFullYear(),
      totalDays: 10,
    },
  });

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <LeaveTypeSelectField
          companyId={companyId}
          name="leaveTypeId"
          label="ประเภทการลา"
          placeholder="เลือกประเภทการลา..."
          control={methods.control}
          disabled={isEditing}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField
            name="year"
            label="ปี (Year)"
            type="number"
            control={methods.control}
            disabled={isEditing}
            required
          />

          <InputField
            name="totalDays"
            label="โควต้าทั้งหมด (วัน)"
            type="number"
            control={methods.control}
            required
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={isLoading}>
          บันทึกโควต้า
        </ButtonLoading>
      </div>
    </form>
  );
}
