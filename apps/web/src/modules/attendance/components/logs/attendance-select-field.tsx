'use client';

import { useId } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Field, FieldLabel, FieldError } from '@repo/ui/components/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';

export default function AttendanceSelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  disabled,
  onChange,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange?: () => void;
}) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select
            aria-label={label}
            className="w-full"
            placeholder={`เลือก${label}`}
            isDisabled={disabled}
            selectedKey={
              options.some((option) => option.value === field.value)
                ? field.value
                : null
            }
            isInvalid={fieldState.invalid}
            onSelectionChange={(key) => {
              field.onChange(key == null ? '' : String(key));
              onChange?.();
            }}
          >
            <SelectTrigger
              id={id}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    id={option.value}
                    textValue={option.label}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
