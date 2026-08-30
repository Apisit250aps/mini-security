import { Controller, FieldValues } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@repo/ui/components/field';
import { Textarea } from '@repo/ui/components/textarea';
import type { BaseFieldProps } from '#types/form';

export const TextareaField = <T extends FieldValues>({
  control,
  name,
  label,
  id,
  required,
  ...props
}: BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Textarea>, 'name'> & {
    id?: string;
  }): React.ReactElement => {
  const textareaId = id ?? name;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={textareaId}>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>
          )}
          <Textarea
            {...field}
            id={textareaId}
            aria-invalid={fieldState.invalid}
            value={field.value ?? ''}
            {...props}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
