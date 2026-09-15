'use client';

import { useId } from 'react';
import { FieldValues, Controller } from 'react-hook-form';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@repo/ui/components/combobox';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@repo/ui/components/field';
import type { BaseFieldProps, Option } from '#types/form';

export interface ComboboxFieldProps<T extends FieldValues>
  extends BaseFieldProps<T> {
  options: Option[];
  placeholder?: string;
  id?: string;
  isLoading?: boolean;
  loadError?: boolean;
  description?: string;
  emptyText?: string;
  className?: string;
}

export const ComboboxField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'ค้นหาหรือเลือกรายการ...',
  options,
  required,
  id,
  disabled,
  isLoading,
  loadError,
  description,
  emptyText = 'ไม่พบข้อมูลที่ค้นหา',
  className,
  onValueChange,
}: ComboboxFieldProps<T> & {
  onValueChange?: (value: string | null) => void;
}) => {
  const generatedId = useId();
  const comboboxId = id ?? generatedId;
  const status = loadError
    ? 'โหลดรายการไม่สำเร็จ กรุณาลองใหม่'
    : isLoading
      ? 'กำลังโหลดรายการ...'
      : options.length === 0
        ? 'ไม่มีรายการให้เลือก'
        : undefined;

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => {
        let descriptionId: string | undefined;
        if (status && fieldState.invalid) {
          descriptionId = `${comboboxId}-status ${comboboxId}-error`;
        } else if (status) {
          descriptionId = `${comboboxId}-status`;
        } else if (fieldState.invalid) {
          descriptionId = `${comboboxId}-error`;
        }

        const selectedKey =
          field.value != null && field.value !== ''
            ? String(field.value)
            : null;

        return (
          <Field
            data-invalid={fieldState.invalid}
            data-disabled={field.disabled}
            className={className}
          >
            {label != null && (
              <FieldLabel htmlFor={comboboxId}>
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
              </FieldLabel>
            )}

            <Combobox
              className="w-full"
              aria-label={label ?? placeholder ?? name}
              selectedKey={selectedKey}
              onSelectionChange={(key) => {
                const nextVal = key == null ? null : String(key);
                field.onChange(nextVal);
                onValueChange?.(nextVal);
              }}
              isDisabled={field.disabled || disabled || isLoading}
              isInvalid={fieldState.invalid}
              isRequired={required}
              aria-invalid={fieldState.invalid}
            >
              <ComboboxInput
                id={comboboxId}
                ref={field.ref}
                onBlur={() => field.onBlur()}
                placeholder={placeholder}
                disabled={field.disabled || disabled || isLoading}
                showTrigger
                showClear
                aria-invalid={fieldState.invalid}
                aria-describedby={descriptionId}
              />
              <ComboboxContent>
                <ComboboxList>
                  {options.map((option) => (
                    <ComboboxItem
                      key={String(option.value)}
                      id={String(option.value)}
                      textValue={option.label}
                    >
                      {option.label}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
                <ComboboxEmpty>{status || emptyText}</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>

            {description && (
              <FieldDescription id={`${comboboxId}-desc`}>
                {description}
              </FieldDescription>
            )}
            {status && (
              <FieldDescription id={`${comboboxId}-status`} role="status">
                {status}
              </FieldDescription>
            )}
            {fieldState.invalid && (
              <FieldError
                id={`${comboboxId}-error`}
                errors={[fieldState.error]}
              />
            )}
          </Field>
        );
      }}
    />
  );
};
