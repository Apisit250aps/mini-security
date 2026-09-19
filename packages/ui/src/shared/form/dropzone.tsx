'use client';

import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { FileUploadField } from './file-upload-field';

export interface FileDropzoneFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function FileDropzoneField<T extends FieldValues>({
  name,
  control,
  accept = '.xlsx, .xls, .csv',
  maxSizeMB = 5,
  label,
  description,
  disabled,
}: FileDropzoneFieldProps<T>) {
  return (
    <FileUploadField
      name={name}
      control={control}
      accept={accept}
      maxSizeMB={maxSizeMB}
      label={label}
      description={description}
      disabled={disabled}
      multiple={false}
    />
  );
}
