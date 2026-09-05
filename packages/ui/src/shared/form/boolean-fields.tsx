'use client';

import { useId, useRef, useImperativeHandle } from 'react';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
  FieldError,
} from '@repo/ui/components/field';
import type { BaseFieldProps } from '#types/form';
import { FieldValues, useController } from 'react-hook-form';
import { Switch } from '@repo/ui/components/switch';

export const SwitchField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  id,
  disabled,
}: BaseFieldProps<T> & { description?: string; id?: string }) => {
  const { field, fieldState } = useController({ control, name, disabled });
  const { ref: fieldRef } = field;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(
    fieldRef,
    () => ({
      focus: () => inputRef.current?.focus(),
      select: () => inputRef.current?.select(),
      setCustomValidity: (message: string) =>
        inputRef.current?.setCustomValidity(message),
      reportValidity: () => inputRef.current?.reportValidity(),
    }),
    [],
  );
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <Field
      data-invalid={fieldState.invalid}
      data-disabled={field.disabled}
      orientation="horizontal"
      className="max-w-sm items-center justify-between"
    >
      <FieldContent>
        {label && <FieldLabel htmlFor={switchId}>{label}</FieldLabel>}
        {description && <FieldDescription>{description}</FieldDescription>}
        {fieldState.invalid && (
          <FieldError id={`${switchId}-error`} errors={[fieldState.error]} />
        )}
      </FieldContent>
      <Switch
        id={switchId}
        inputRef={inputRef}
        onBlur={field.onBlur}
        aria-invalid={fieldState.invalid}
        aria-describedby={fieldState.invalid ? `${switchId}-error` : undefined}
        isSelected={Boolean(field.value)}
        onChange={(checked) => field.onChange(checked)}
        isDisabled={field.disabled}
        aria-label={label ?? name}
      />
    </Field>
  );
};
