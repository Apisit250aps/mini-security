import { Controller, FieldValues } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@repo/ui/components/field';
import { Textarea } from '@repo/ui/components/textarea';
import { BaseFieldProps } from '#types/form';

export const TextareaField = <T extends FieldValues>({
  control,
  name,
  label,
  ...props
}: BaseFieldProps<T> &
  Omit<React.ComponentProps<typeof Textarea>, 'name'>): React.ReactElement => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={`form-rhf-demo-${name}`}>{label}</FieldLabel>
          )}
          <Textarea
            {...field}
            id={`form-rhf-demo-${name}`}
            aria-invalid={fieldState.invalid}
            {...props}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
