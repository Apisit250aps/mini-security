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
  { value: 'TEXTAREA', label: 'ข้อความหลายบรรทัด (Textarea)' },
  { value: 'NUMBER', label: 'ตัวเลข (Number)' },
  { value: 'SELECT', label: 'ตัวเลือก (Select / Dropdown)' },
  { value: 'RADIO', label: 'ตัวเลือกเดียว (Radio)' },
  { value: 'CHECKBOX_GROUP', label: 'หลายตัวเลือก (Checkbox)' },
  { value: 'BOOLEAN', label: 'ใช่ / ไม่ใช่ (Yes / No)' },
  { value: 'DATE', label: 'วันที่ (Date)' },
  { value: 'EMAIL', label: 'อีเมล (Email)' },
  { value: 'IMAGE', label: 'รูปถ่าย (Image / Photo)' },
  { value: 'FILE', label: 'ไฟล์เอกสารแนบ (File / Document)' },
];

const formFieldSchema = z.object({
  formSectionId: z.string().min(1, 'กรุณาเลือกหมวดหมู่คำถาม'),
  name: z.string().min(1).max(100),
  type: z.enum([
    'TEXT',
    'TEXTAREA',
    'NUMBER',
    'SELECT',
    'RADIO',
    'CHECKBOX_GROUP',
    'BOOLEAN',
    'DATE',
    'EMAIL',
    'IMAGE',
    'FILE',
  ]),
  label: z
    .string()
    .min(1, 'กรุณาระบุคำถามหรือชื่อฟิลด์')
    .max(255, 'คำถามยาวได้ไม่เกิน 255 ตัวอักษร'),
  description: z.string().max(1000).optional(),
  placeholder: z.string().max(255).optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  minLength: z.coerce.number().int().nonnegative().optional(),
  maxLength: z.coerce.number().int().nonnegative().optional(),
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
  const originalOptions = field?.options || [];

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
      name: field?.name || '',
      label: field?.label || '',
      description: field?.description || '',
      placeholder: field?.placeholder || '',
      min: field?.min ?? undefined,
      max: field?.max ?? undefined,
      minLength: field?.minLength ?? undefined,
      maxLength: field?.maxLength ?? undefined,
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
      let options: Array<{ label: string; value: string }> = [];
      if (
        ['SELECT', 'RADIO', 'CHECKBOX_GROUP'].includes(values.type) &&
        values.selectOptions
      ) {
        options = values.selectOptions
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => ({
            label: item,
            value:
              originalOptions.find((option) => option.label === item)?.value ??
              item,
          }));
      }

      // Auto-compute sortOrder as next index in chosen section
      const sectionFieldCount = fields.filter(
        (f) => f.formSectionId === values.formSectionId,
      ).length;
      const isNumber = values.type === 'NUMBER';
      const supportsLength = ['TEXT', 'TEXTAREA', 'EMAIL'].includes(
        values.type,
      );
      const constraints = {
        min: isNumber ? (values.min ?? null) : null,
        max: isNumber ? (values.max ?? null) : null,
        minLength: supportsLength ? (values.minLength ?? null) : null,
        maxLength: supportsLength ? (values.maxLength ?? null) : null,
      };

      if (
        ['SELECT', 'RADIO', 'CHECKBOX_GROUP'].includes(values.type) &&
        !values.selectOptions?.trim()
      ) {
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
              name: values.name,
              type: values.type,
              label: values.label,
              description: values.description || null,
              placeholder: values.placeholder || null,
              isRequired: values.isRequired,
              ...constraints,
              options,
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
          name: values.name,
          type: values.type,
          label: values.label,
          description: values.description || null,
          placeholder: values.placeholder || null,
          isRequired: values.isRequired,
          sortOrder: sectionFieldCount,
          ...constraints,
          options,
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
          name="name"
          label="ชื่อฟิลด์ (Field name)"
          placeholder="เช่น role หรือ inspection_note"
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

        <InputField
          name="placeholder"
          label="ข้อความตัวอย่าง (Placeholder)"
          placeholder="เช่น เลือกบทบาท หรือกรอกคำตอบ"
          control={methods.control}
        />

        {selectedType === 'NUMBER' && (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              name="min"
              label="ค่าต่ำสุด"
              control={methods.control}
            />
            <InputField
              name="max"
              label="ค่าสูงสุด"
              control={methods.control}
            />
          </div>
        )}

        {(selectedType === 'TEXT' ||
          selectedType === 'TEXTAREA' ||
          selectedType === 'EMAIL') && (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              name="minLength"
              label="ความยาวขั้นต่ำ"
              control={methods.control}
            />
            <InputField
              name="maxLength"
              label="ความยาวสูงสุด"
              control={methods.control}
            />
          </div>
        )}

        <TextareaField
          name="description"
          label="คำแนะนำเพิ่มเติมสำหรับผู้กรอก (Hint)"
          placeholder="คำอธิบายวิธีการตรวจสอบหรือเกณฑ์ที่ใช้"
          control={methods.control}
          rows={2}
        />

        {['SELECT', 'RADIO', 'CHECKBOX_GROUP'].includes(selectedType) && (
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
