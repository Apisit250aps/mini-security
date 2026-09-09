'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField, TextareaField, SwitchField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';

export const formTemplateFormSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อแบบฟอร์ม'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type FormTemplateFormValues = z.infer<typeof formTemplateFormSchema>;

interface FormTemplateFormProps {
  defaultValues?: Partial<FormTemplateFormValues>;
  onSubmit: (values: FormTemplateFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function FormTemplateForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'บันทึก',
}: FormTemplateFormProps) {
  const methods = useForm<FormTemplateFormValues>({
    resolver: zodResolver(formTemplateFormSchema as never),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      isActive: defaultValues?.isActive ?? true,
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
          label="ชื่อแบบฟอร์ม"
          placeholder="เช่น แบบฟอร์มตรวจตราความปลอดภัยประจำวัน"
          control={methods.control}
          required
        />

        <TextareaField
          name="description"
          label="คำอธิบาย / วัตถุประสงค์"
          placeholder="ระบุวัตถุประสงค์และคำชี้แจงในการกรอกแบบฟอร์มนี้"
          control={methods.control}
          rows={3}
        />

        <SwitchField
          name="isActive"
          label="เปิดใช้งานแบบฟอร์มนี้"
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading
          type="submit"
          isLoading={Boolean(isLoading)}
          className="w-full sm:w-auto"
        >
          {submitLabel}
        </ButtonLoading>
      </div>
    </form>
  );
}
