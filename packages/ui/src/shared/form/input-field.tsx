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
  ...props
}: BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Input>, 'name'>): React.ReactElement => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-red-500">*</span>}
            </FieldLabel>
          )}
          <Input
            id={name}
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
  ...props
}: BaseFieldProps<T> & React.ComponentProps<'input'>): React.ReactElement => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={`form-rhf-demo-${name}`}>
              {label}
              {required && <span className="text-red-500">*</span>}
            </FieldLabel>
          )}
          <InputGroup>
            <InputGroupInput
              id={`form-rhf-demo-${name}`}
              {...props}
              {...field}
              type={showPassword ? 'text' : 'password'}
              aria-invalid={fieldState.invalid}
            />
            <InputGroupButton
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeClosed />}
            </InputGroupButton>
          </InputGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export { InputField, PasswordField };
