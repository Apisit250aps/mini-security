"use client";

import * as React from "react";
import { Field, FieldLabel, FieldError, FieldDescription } from "#components/field";
import { FileUpload, type FileUploadProps } from "./file-upload";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import type { FileMetadata } from "#hooks/use-file-upload";

export interface FileUploadFieldProps<T extends FieldValues>
  extends Omit<FileUploadProps, "value" | "onChange"> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  helperText?: string;
  id?: string;
}

export function FileUploadField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  helperText,
  id,
  ...props
}: FileUploadFieldProps<T>) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState }) => {
        // Value normalization: support FileMetadata[], single FileMetadata, or File[]
        const rawValue = field.value;
        const normalizedValue: FileMetadata[] = Array.isArray(rawValue)
          ? rawValue
          : rawValue
            ? [rawValue]
            : [];

        const handleChange = (files: FileMetadata[]) => {
          if (props.multiple) {
            field.onChange(files);
          } else {
            field.onChange(files[0] || null);
          }
        };

        return (
          <Field
            data-invalid={fieldState.invalid || undefined}
            data-disabled={field.disabled || undefined}
            className="w-full flex flex-col gap-1.5"
          >
            {label && (
              <FieldLabel htmlFor={fieldId}>
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
              </FieldLabel>
            )}

            {helperText && !fieldState.invalid && (
              <FieldDescription>{helperText}</FieldDescription>
            )}

            <FileUpload
              {...props}
              disabled={field.disabled}
              value={normalizedValue}
              onChange={handleChange}
            />

            {fieldState.invalid && (
              <FieldError id={`${fieldId}-error`} errors={[fieldState.error]} />
            )}
          </Field>
        );
      }}
    />
  );
}
