'use client';

import { useId } from 'react';
import { Controller, FieldValues } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@repo/ui/components/field';
import { Textarea } from '@repo/ui/components/textarea';
import type { BaseFieldProps } from '#types/form';

export const TextareaField = <T extends FieldValues>({
  control,
  name,
  label,
  id,
  required,
  disabled,
  ...props
}: BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Textarea>, 'name'> & {
    id?: string;
  }): React.ReactElement => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} data-disabled={field.disabled}>
          {label && (
            <FieldLabel htmlFor={textareaId}>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>
          )}
          <Textarea
            {...field}
            id={textareaId}
            aria-invalid={fieldState.invalid}
            aria-describedby={
              fieldState.invalid ? `${textareaId}-error` : undefined
            }
            value={field.value ?? ''}
            {...props}
            required={required}
            disabled={field.disabled}
          />
          {fieldState.invalid && (
            <FieldError
              id={`${textareaId}-error`}
              errors={[fieldState.error]}
            />
          )}
        </Field>
      )}
    />
  );
};
