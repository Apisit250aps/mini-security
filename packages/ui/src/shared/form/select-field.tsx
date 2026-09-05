'use client';

import { useId } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { FieldValues, Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@repo/ui/components/field';
import type { BaseFieldProps, Option } from '#types/form';

export const SelectField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  required,
  valueAsNumber = false,
  id,
  disabled,
  isLoading,
  loadError,
}: BaseFieldProps<T> & {
  options: Option[];
  placeholder?: string;
  valueAsNumber?: boolean;
  id?: string;
  isLoading?: boolean;
  loadError?: boolean;
}) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
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
          descriptionId = `${selectId}-status ${selectId}-error`;
        } else if (status) {
          descriptionId = `${selectId}-status`;
        } else if (fieldState.invalid) {
          descriptionId = `${selectId}-error`;
        }
        const selectedKey =
          field.value != null && field.value !== ''
            ? String(field.value)
            : null;

        return (
          <Field
            data-invalid={fieldState.invalid}
            data-disabled={field.disabled}
          >
            {label != null && (
              <FieldLabel htmlFor={selectId}>
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
              </FieldLabel>
            )}
            <Select
              className="w-full"
              placeholder={placeholder ?? 'เลือกรายการ'}
              aria-label={label ?? placeholder ?? name}
              isInvalid={fieldState.invalid}
              selectedKey={selectedKey}
              onSelectionChange={(key) => {
                const value =
                  key == null
                    ? null
                    : valueAsNumber
                      ? Number(key)
                      : String(key);
                const nextValue =
                  typeof value === 'number' && Number.isNaN(value)
                    ? null
                    : value;
                field.onChange(nextValue);
              }}
              isRequired={required}
              isDisabled={field.disabled}
              aria-invalid={fieldState.invalid}
            >
              <SelectTrigger
                className="w-full"
                id={selectId}
                ref={field.ref}
                onBlur={() => field.onBlur()}
                aria-invalid={fieldState.invalid}
                aria-describedby={descriptionId}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem
                      key={String(option.value)}
                      id={String(option.value)}
                      textValue={option.label}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {status && (
              <FieldDescription id={`${selectId}-status`} role="status">
                {status}
              </FieldDescription>
            )}
            {fieldState.invalid && (
              <FieldError
                id={`${selectId}-error`}
                errors={[fieldState.error]}
              />
            )}
          </Field>
        );
      }}
    />
  );
};
