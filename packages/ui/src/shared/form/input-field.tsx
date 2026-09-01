'use client';

import React from 'react';
import { Field, FieldLabel, FieldError } from '@repo/ui/components/field';
import { Input } from '@repo/ui/components/input';
import {
  InputGroup,
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
  id,
  ...props
}: BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Input>, 'name'>): React.ReactElement => {
  const inputId = id ?? name;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={inputId}>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>
          )}
          <Input
            id={inputId}
            aria-invalid={fieldState.invalid}
            {...field}
            {...props}
            required={required}
            onChange={(e) => parseOnChange(e, field)}
            value={field.value ?? ''}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
  id,
  ...props
}: BaseFieldProps<T> & React.ComponentProps<'input'>): React.ReactElement => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputId = id ?? `password-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={inputId}>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>
          )}
          <InputGroup>
            <InputGroupInput
              id={inputId}
              {...props}
              {...field}
              type={showPassword ? 'text' : 'password'}
              aria-invalid={fieldState.invalid}
              value={field.value ?? ''}
            />
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              className="mr-1 text-muted-foreground hover:text-foreground"
              onPress={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <Eye className="size-4" />
              ) : (
                <EyeClosed className="size-4" />
              )}
            </InputGroupButton>
          </InputGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export { InputField, PasswordField };
