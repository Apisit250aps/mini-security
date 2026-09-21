'use client';

import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField, TextareaField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Button } from '@repo/ui/components/button';
import { useFormSectionCreate } from '../../hooks/form-mutations';

export const formSectionSchema = z.object({
  title: z.string().min(1, 'กรุณาระบุชื่อหมวดหมู่'),
  description: z.string().optional(),
});

export type FormSectionValues = z.infer<typeof formSectionSchema>;

interface FormTemplateSectionDialogProps {
  organizationId?: string;
  templateId: string;
  formVersionId: string;
  currentSectionsCount: number;
  onClose: () => void;
}

export default function FormTemplateSectionDialog({
  organizationId,
  templateId,
  formVersionId,
  currentSectionsCount,
  onClose,
}: FormTemplateSectionDialogProps) {
  const activeOrgId = organizationId || '';
  const createSectionMutation = useFormSectionCreate(activeOrgId, templateId);

  const methods = useForm<FormSectionValues>({
    resolver: zodResolver(formSectionSchema as never),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleSubmit = useCallback(
    (values: FormSectionValues) => {
      createSectionMutation.mutate(
        {
          organizationId: activeOrgId,
          formVersionId,
          title: values.title,
          description: values.description || null,
          sortOrder: currentSectionsCount,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    },
    [
      createSectionMutation,
      activeOrgId,
      formVersionId,
      currentSectionsCount,
      onClose,
    ],
  );

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <InputField
          name="title"
          label="ชื่อหมวดหมู่ (Section Title)"
          placeholder="เช่น ข้อมูลทั่วไป, การตรวจสอบความปลอดภัย"
          control={methods.control}
          required
        />

        <TextareaField
          name="description"
          label="คำอธิบายหมวดหมู่ (ถ้ามี)"
          placeholder="ระบุคำแนะนำหรือขอบเขตสำหรับหมวดหมู่นี้..."
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onPress={onClose}>
          ยกเลิก
        </Button>
        <ButtonLoading
          type="submit"
          isLoading={createSectionMutation.isPending}
        >
          บันทึกหมวดหมู่
        </ButtonLoading>
      </div>
    </form>
  );
}
