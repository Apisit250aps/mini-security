'use client';

import React from 'react';
import { Field, FieldLabel, FieldError } from '@repo/ui/components/field';
import { Input } from '@repo/ui/components/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Eye, EyeClosed } from 'lucide-react';
import type { BaseFieldProps } from '#types/form';
import { FieldValues, Controller } from 'react-hook-form';
import { parseOnChange } from '#lib/fields';

const InputField = <T extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  id,
  ...props
}: BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Input>, 'name'>): React.ReactElement => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} data-disabled={field.disabled}>
          {label && (
            <FieldLabel htmlFor={inputId}>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>
          )}
          <Input
            id={inputId}
            aria-invalid={fieldState.invalid}
            aria-describedby={
              fieldState.invalid ? `${inputId}-error` : undefined
            }
            {...field}
            {...props}
            disabled={field.disabled}
            required={required}
            onChange={(e) => parseOnChange(e, field)}
            value={field.value ?? ''}
          />
          {fieldState.invalid && (
            <FieldError id={`${inputId}-error`} errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
};

const PasswordField = <T extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  id,
  ...props
}: BaseFieldProps<T> & React.ComponentProps<'input'>): React.ReactElement => {
  const [showPassword, setShowPassword] = React.useState(false);
  const generatedId = React.useId();
  const passwordId = id ?? generatedId;

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} data-disabled={field.disabled}>
          {label && (
            <FieldLabel htmlFor={passwordId}>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>
          )}
          <InputGroup>
            <InputGroupInput
              id={passwordId}
              {...props}
              disabled={field.disabled}
              required={required}
              {...field}
              type={showPassword ? 'text' : 'password'}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${passwordId}-error` : undefined
              }
              value={field.value ?? ''}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                isDisabled={field.disabled}
                variant="ghost"
                size="icon-xs"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                className="mr-1 text-muted-foreground hover:text-foreground"
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <Eye /> : <EyeClosed />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {fieldState.invalid && (
            <FieldError
              id={`${passwordId}-error`}
              errors={[fieldState.error]}
            />
          )}
        </Field>
      )}
    />
  );
};

export { InputField, PasswordField };
