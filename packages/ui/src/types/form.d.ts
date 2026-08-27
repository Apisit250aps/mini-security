import { FieldValues, Control, Path } from 'react-hook-form';

export type BaseFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
};

export type Option = {
  value: string;
  label: string;
};

export type CheckboxGroupProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  options: Option[];
  className?: string;
  containerClassName?: string;
  columns?: number;
};
