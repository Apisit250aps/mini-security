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
import {
  useFormFieldCreate,
  useFormFieldEdit,
} from '../../hooks/form-mutations';
import type { FormField, FormSection } from '@repo/domains/entities';

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
  label: z
    .string()
    .min(1, 'กรุณาระบุคำถามหรือชื่อฟิลด์')
    .max(255, 'คำถามยาวได้ไม่เกิน 255 ตัวอักษร'),
  description: z.string().max(1000).optional(),
  isRequired: z.boolean().default(false),
  selectOptions: z.string().optional(),
});

type FormFieldValues = z.infer<typeof formFieldSchema>;

interface FormTemplateFieldDialogProps {
  companyId: string;
  templateId: string;
  formVersionId: string;
  sections: FormSection[];
  fields: FormField[];
  defaultSectionId?: string;
  field?: FormField;
  onClose: () => void;
}

export default function FormTemplateFieldDialog({
  companyId,
  templateId,
  formVersionId,
  sections,
  fields,
  defaultSectionId,
  field,
  onClose,
}: FormTemplateFieldDialogProps) {
  const createFieldMutation = useFormFieldCreate(templateId);

  const editFieldMutation = useFormFieldEdit(templateId);
  const existingOptions = z
    .array(z.object({ label: z.string(), value: z.string() }))
    .safeParse(field?.config?.options);
  const originalOptions = existingOptions.success ? existingOptions.data : [];

  const sectionOptions = sections.map((s) => ({
    value: s.id,
    label: s.title,
  }));

  const methods = useForm<FormFieldValues>({
    resolver: zodResolver(formFieldSchema as never),
    defaultValues: {
      formSectionId:
        field?.formSectionId || defaultSectionId || sections[0]?.id || '',
      type: field?.type || 'TEXT',
      label: field?.label || '',
      description: field?.description || '',
      isRequired: field?.isRequired ?? false,
      selectOptions: originalOptions.map((option) => option.label).join('\n'),
    },
  });

  const selectedType = useWatch({ control: methods.control, name: 'type' });
  const selectedSectionId = useWatch({
    control: methods.control,
    name: 'formSectionId',
  });

  const handleSubmit = useCallback(
    (values: FormFieldValues) => {
      let config: Record<string, unknown> =
        field?.type === values.type ? { ...field.config } : {};
      if (values.type === 'SELECT' && values.selectOptions) {
        const parsedOptions = values.selectOptions
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => ({
            label: item,
            value:
              originalOptions.find((option) => option.label === item)?.value ??
              item,
          }));
        config = { ...config, options: parsedOptions };
      }

      // Auto-compute sortOrder as next index in chosen section
      const sectionFieldCount = fields.filter(
        (f) => f.formSectionId === values.formSectionId,
      ).length;

      if (values.type === 'SELECT' && !values.selectOptions?.trim()) {
        methods.setError('selectOptions', {
          message: 'กรุณาระบุตัวเลือกอย่างน้อย 1 รายการ',
        });
        return;
      }
      if (field) {
        editFieldMutation.mutate(
          {
            fieldId: field.id,
            data: {
              formSectionId: values.formSectionId,
              type: values.type,
              label: values.label,
              description: values.description || null,
              isRequired: values.isRequired,
              config,
            },
          },
          { onSuccess: onClose },
        );
        return;
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
          sortOrder: sectionFieldCount,
          config,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    },
    [
      createFieldMutation,
      editFieldMutation,
      field,
      originalOptions,
      methods,
      companyId,
      formVersionId,
      fields,
      onClose,
    ],
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
            placeholder={`ปกติ\nชำรุด\nไม่สามารถตรวจสอบได้`}
            control={methods.control}
            rows={3}
            required
          />
        )}

        <div className="flex items-center justify-end gap-4">
          <div className="pt-1">
            <SwitchField
              name="isRequired"
              label="จำเป็นต้องตอบ (Required)"
              control={methods.control}
            />
          </div>
        </div>

        {/* Show how many fields currently in this section */}
        {!field && selectedSectionId && (
          <p className="text-xs text-muted-foreground">
            คำถามนี้จะถูกเพิ่มเป็นลำดับที่{' '}
            {fields.filter((f) => f.formSectionId === selectedSectionId)
              .length + 1}{' '}
            ในหมวดหมู่นี้ (สามารถเรียงลำดับใหม่ได้ในหน้า Builder)
          </p>
        )}
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onPress={onClose}>
          ยกเลิก
        </Button>
        <ButtonLoading
          type="submit"
          isLoading={
            createFieldMutation.isPending || editFieldMutation.isPending
          }
        >
          {field ? 'บันทึกการแก้ไข' : 'เพิ่มคำถาม'}
        </ButtonLoading>
      </div>
    </form>
  );
}
