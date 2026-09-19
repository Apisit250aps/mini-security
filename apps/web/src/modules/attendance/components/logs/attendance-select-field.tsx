'use client';

import type { FieldValues, Control, Path } from 'react-hook-form';
import { SelectField } from '@repo/ui/form';

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
  return (
    <SelectField
      control={control}
      name={name}
      label={label}
      placeholder={`เลือก${label}`}
      options={options}
      disabled={disabled}
      onValueChange={() => onChange?.()}
    />
  );
}
