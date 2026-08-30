import { FieldContent } from '@repo/ui/components/field';
import { Field, FieldLabel, FieldDescription } from '@repo/ui/components/field';
import { BaseFieldProps } from '#types/form';

import { FieldValues, Controller } from 'react-hook-form';
import { Switch } from '@repo/ui/components/switch';

export const SwitchField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
}: BaseFieldProps<T> & { description?: string }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal" className="max-w-sm">
          <FieldContent>
            <FieldLabel htmlFor={`form-rhf-demo-${name}`}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </FieldContent>
          <Switch
            id={`form-rhf-demo-${name}`}
            isSelected={field.value}
            onChange={(checked) => field.onChange(checked)}
          />
        </Field>
      )}
    />
  );
};
