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

const formSectionSchema = z.object({
  title: z.string().min(1, 'กรุณาระบุหัวข้อหมวดหมู่'),
  description: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
});

type FormSectionValues = z.infer<typeof formSectionSchema>;

interface FormTemplateSectionDialogProps {
  companyId: string;
  templateId: string;
  formVersionId: string;
  currentSectionsCount: number;
  onClose: () => void;
}

export default function FormTemplateSectionDialog({
  companyId,
  templateId,
  formVersionId,
  currentSectionsCount,
  onClose,
}: FormTemplateSectionDialogProps) {
  const createSectionMutation = useFormSectionCreate(companyId, templateId);

  const methods = useForm<FormSectionValues>({
    resolver: zodResolver(formSectionSchema as never),
    defaultValues: {
      title: '',
      description: '',
      sortOrder: currentSectionsCount,
    },
  });

  const handleSubmit = useCallback(
    (values: FormSectionValues) => {
      createSectionMutation.mutate(
        {
          companyId,
          formVersionId,
          title: values.title,
          description: values.description || null,
          sortOrder: values.sortOrder,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    },
    [createSectionMutation, companyId, formVersionId, onClose],
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
          placeholder="เช่น ข้อมูลทั่วไป, รายการตรวจเช็คความปลอดภัย"
          control={methods.control}
          required
        />

        <TextareaField
          name="description"
          label="คำอธิบายหมวดหมู่"
          placeholder="ระบุคำอธิบายย่อยของหมวดหมู่นี้ (ถ้ามี)"
          control={methods.control}
          rows={2}
        />

        <InputField
          name="sortOrder"
          label="ลำดับการแสดงผล"
          type="number"
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onPress={onClose}>
          ยกเลิก
        </Button>
        <ButtonLoading
          type="submit"
          isLoading={createSectionMutation.isPending}
        >
          เพิ่มหมวดหมู่
        </ButtonLoading>
      </div>
    </form>
  );
}
