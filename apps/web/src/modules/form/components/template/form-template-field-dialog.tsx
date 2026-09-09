'use client';

import React, { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  TextareaField,
  SelectField,
  SwitchField,
} from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Button } from '@repo/ui/components/button';
import { useFormFieldCreate } from '../../hooks/form-mutations';
import type { FormSection } from '@repo/domains/entities';

const FIELD_TYPE_OPTIONS = [
  { value: 'TEXT', label: 'ข้อความสั้น / ยาว (Text)' },
  { value: 'NUMBER', label: 'ตัวเลข (Number)' },
  { value: 'SELECT', label: 'ตัวเลือก (Select / Dropdown)' },
  { value: 'BOOLEAN', label: 'ใช่ / ไม่ใช่ (Yes / No)' },
  { value: 'DATE', label: 'วันที่ (Date)' },
  { value: 'IMAGE', label: 'รูปถ่าย (Image / Photo)' },
  { value: 'FILE', label: 'ไฟล์เอกสารแนบ (File / Document)' },
];

const formFieldSchema = z.object({
  formSectionId: z.string().min(1, 'กรุณาเลือกหมวดหมู่คำถาม'),
  type: z.enum([
    'TEXT',
    'NUMBER',
    'SELECT',
    'BOOLEAN',
    'DATE',
    'IMAGE',
    'FILE',
  ]),
  label: z.string().min(1, 'กรุณาระบุคำถามหรือชื่อฟิลด์'),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  selectOptions: z.string().optional(),
});

type FormFieldValues = z.infer<typeof formFieldSchema>;

interface FormTemplateFieldDialogProps {
  companyId: string;
  templateId: string;
  formVersionId: string;
  sections: FormSection[];
  defaultSectionId?: string;
  onClose: () => void;
}

export default function FormTemplateFieldDialog({
  companyId,
  templateId,
  formVersionId,
  sections,
  defaultSectionId,
  onClose,
}: FormTemplateFieldDialogProps) {
  const createFieldMutation = useFormFieldCreate(companyId, templateId);

  const sectionOptions = sections.map((s) => ({
    value: s.id,
    label: s.title,
  }));

  const methods = useForm<FormFieldValues>({
    resolver: zodResolver(formFieldSchema as never),
    defaultValues: {
      formSectionId: defaultSectionId || sections[0]?.id || '',
      type: 'TEXT',
      label: '',
      description: '',
      isRequired: false,
      sortOrder: 0,
      selectOptions: '',
    },
  });

  const selectedType = useWatch({ control: methods.control, name: 'type' });

  const handleSubmit = useCallback(
    (values: FormFieldValues) => {
      let config: Record<string, unknown> = {};
      if (values.type === 'SELECT' && values.selectOptions) {
        const parsedOptions = values.selectOptions
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => ({ label: item, value: item }));
        config = { options: parsedOptions };
      }

      createFieldMutation.mutate(
        {
          companyId,
          formVersionId,
          formSectionId: values.formSectionId,
          type: values.type,
          label: values.label,
          description: values.description || null,
          isRequired: values.isRequired,
          sortOrder: values.sortOrder,
          config,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    },
    [createFieldMutation, companyId, formVersionId, onClose],
  );

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <SelectField
          name="formSectionId"
          label="หมวดหมู่คำถาม (Section)"
          placeholder="เลือกหมวดหมู่"
          options={sectionOptions}
          control={methods.control}
          required
        />

        <SelectField
          name="type"
          label="ประเภทของคำตอบ"
          placeholder="เลือกประเภท"
          options={FIELD_TYPE_OPTIONS}
          control={methods.control}
          required
        />

        <InputField
          name="label"
          label="ข้อความคำถาม / ป้ายกำกับ (Label)"
          placeholder="เช่น ประตูปิดล็อคเรียบร้อยหรือไม่?, ถ่ายรูปบริเวณจุดตรวจ"
          control={methods.control}
          required
        />

        <TextareaField
          name="description"
          label="คำแนะนำเพิ่มเติมสำหรับผู้กรอก (Hint)"
          placeholder="คำอธิบายวิธีการตรวจสอบหรือเกณฑ์ที่ใช้"
          control={methods.control}
          rows={2}
        />

        {selectedType === 'SELECT' && (
          <TextareaField
            name="selectOptions"
            label="ตัวเลือก (ใส่บรรทัดละ 1 ตัวเลือก)"
            placeholder="ปกติ&#10;ชำรุด&#10;ไม่สามารถตรวจสอบได้"
            control={methods.control}
            rows={3}
            required
          />
        )}

        <div className="flex items-center justify-between gap-4">
          <InputField
            name="sortOrder"
            label="ลำดับคำถาม"
            type="number"
            control={methods.control}
          />
          <div className="pt-6">
            <SwitchField
              name="isRequired"
              label="จำเป็นต้องตอบ (Required)"
              control={methods.control}
            />
          </div>
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onPress={onClose}>
          ยกเลิก
        </Button>
        <ButtonLoading type="submit" isLoading={createFieldMutation.isPending}>
          เพิ่มคำถาม
        </ButtonLoading>
      </div>
    </form>
  );
}
