'use client';

import { useId } from 'react';
import { Field, FieldLabel, FieldDescription } from '@repo/ui/components/field';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@repo/ui/components/select';

export type OptionsSelectProps = {
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadError?: boolean;
  className?: string;
};

export function OptionsSelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'เลือกรายการ...',
  disabled,
  isLoading,
  loadError,
  className,
}: OptionsSelectProps) {
  const id = useId();
  const status = loadError
    ? 'โหลดรายการไม่สำเร็จ กรุณาลองใหม่'
    : isLoading
      ? 'กำลังโหลดรายการ...'
      : options.length === 0
        ? 'ไม่มีรายการให้เลือก'
        : undefined;
  return (
    <Field className={className} data-disabled={disabled}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        className="w-full"
        selectedKey={value || null}
        onSelectionChange={(key) => onChange(key == null ? '' : String(key))}
        placeholder={placeholder}
        aria-label={label}
        isDisabled={disabled || isLoading || loadError || options.length === 0}
      >
        <SelectTrigger
          id={id}
          aria-describedby={status ? `${id}-status` : undefined}
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
      {status && (
        <FieldDescription id={`${id}-status`} role="status">
          {status}
        </FieldDescription>
      )}
    </Field>
  );
}
