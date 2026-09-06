'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField, SelectField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyLeaveTypesQueries } from '../../hooks/leave-queries';
import type { FormProps } from '@/types';

export const quotaFormSchema = z.object({
  leaveTypeId: z.string().uuid('กรุณาเลือกประเภทการลา'),
  year: z.coerce.number().min(2000, 'ปีต้องมากกว่า 2000'),
  totalDays: z.coerce.number().min(0, 'จำนวนวันต้องไม่ติดลบ'),
  usedDays: z.coerce.number().min(0, 'จำนวนวันใช้ไปต้องไม่ติดลบ').default(0),
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
  const typesQuery = useCompanyLeaveTypesQueries(companyId, true);

  const typeOptions = useMemo(() => {
    return (typesQuery.data || []).map((t) => ({
      value: t.id,
      label: `${t.name} (${t.maxDaysPerYear ? `${t.maxDaysPerYear} วัน` : 'ไม่จำกัด'})`,
    }));
  }, [typesQuery.data]);

  const methods = useForm<QuotaFormValues>({
    resolver: zodResolver(quotaFormSchema as never),
    defaultValues: defaultValues ?? {
      leaveTypeId: '',
      year: new Date().getFullYear(),
      totalDays: 10,
      usedDays: 0,
    },
  });

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <SelectField
          name="leaveTypeId"
          label="ประเภทการลา"
          placeholder="เลือกประเภทการลา..."
          options={typeOptions}
          control={methods.control}
          disabled={isEditing || typesQuery.isLoading}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

          <InputField
            name="usedDays"
            label="ใช้ไปแล้ว (วัน)"
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
