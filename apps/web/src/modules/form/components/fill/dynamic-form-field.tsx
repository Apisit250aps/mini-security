'use client';

import { Controller, type Control } from 'react-hook-form';
import type { FormField } from '@repo/domains/entities';
import {
  CheckboxGroup,
  InputField,
  SelectField,
  SwitchField,
  TextareaField,
} from '@repo/ui/form';
import { Field, FieldError, FieldLabel } from '@repo/ui/components/field';
import { RadioGroup } from '@repo/ui/components/choice-group';
import { renderFormAttachmentField } from './form-attachment-field';

type DynamicFormValues = Record<string, unknown>;

interface DynamicFormFieldProps {
  control: Control<DynamicFormValues>;
  field: FormField;
  disabled?: boolean;
  submissionId?: string;
}

const choiceTypes = ['SELECT', 'RADIO', 'CHECKBOX_GROUP'] as const;

export default function DynamicFormField({
  control,
  field,
  disabled = false,
  submissionId,
}: DynamicFormFieldProps) {
  const name = field.id;
  const required = field.isRequired;

  if (field.type === 'IMAGE' || field.type === 'FILE') {
    return (
      <Field>
        <FieldLabel>
          {field.label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </FieldLabel>
        {submissionId ? (
          renderFormAttachmentField({
            submissionId,
            fieldId: field.id,
            image: field.type === 'IMAGE',
            disabled,
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            แนบไฟล์ได้เมื่อเปิดกรอกแบบฟอร์ม
          </p>
        )}
      </Field>
    );
  }

  if (field.type === 'TEXT') {
    return (
      <InputField
        control={control}
        name={name}
        label={field.label}
        required={required}
        disabled={disabled}
        placeholder={field.placeholder ?? undefined}
        minLength={field.minLength ?? undefined}
        maxLength={field.maxLength ?? undefined}
      />
    );
  }

  if (field.type === 'TEXTAREA') {
    return (
      <TextareaField
        control={control}
        name={name}
        label={field.label}
        required={required}
        disabled={disabled}
        placeholder={field.placeholder ?? undefined}
        rows={3}
      />
    );
  }

  if (field.type === 'NUMBER') {
    return (
      <InputField
        control={control}
        name={name}
        label={field.label}
        required={required}
        disabled={disabled}
        type="number"
        placeholder={field.placeholder ?? undefined}
        min={field.min ?? undefined}
        max={field.max ?? undefined}
      />
    );
  }

  if (field.type === 'EMAIL') {
    return (
      <InputField
        control={control}
        name={name}
        label={field.label}
        required={required}
        disabled={disabled}
        type="email"
        placeholder={field.placeholder ?? undefined}
        minLength={field.minLength ?? undefined}
        maxLength={field.maxLength ?? undefined}
      />
    );
  }

  if (field.type === 'DATE') {
    return (
      <InputField
        control={control}
        name={name}
        label={field.label}
        required={required}
        disabled={disabled}
        type="date"
      />
    );
  }

  if (field.type === 'BOOLEAN') {
    return (
      <SwitchField
        control={control}
        name={name}
        label={field.label}
        disabled={disabled}
      />
    );
  }

  if (field.type === 'CHECKBOX_GROUP') {
    return (
      <CheckboxGroup
        control={control}
        name={name}
        label={field.label}
        disabled={disabled}
        options={(field.options ?? []).map(({ label, value }) => ({
          label,
          value,
        }))}
      />
    );
  }

  if (choiceTypes.includes(field.type as (typeof choiceTypes)[number])) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: input, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>
              {field.label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>
            <RadioGroup
              name={input.name}
              options={(field.options ?? []).map(({ label, value }) => ({
                label,
                value,
              }))}
              value={typeof input.value === 'string' ? input.value : null}
              onChange={input.onChange}
              disabled={disabled}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    );
  }

  return (
    <InputField
      control={control}
      name={name}
      label={field.label}
      required={required}
      disabled={disabled}
    />
  );
}
