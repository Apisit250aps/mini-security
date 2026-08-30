import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from '@repo/ui/components/field';
import type { BaseFieldProps } from '#types/form';
import { FieldValues, Controller } from 'react-hook-form';
import { Switch } from '@repo/ui/components/switch';

export const SwitchField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  id,
}: BaseFieldProps<T> & { description?: string; id?: string }) => {
  const switchId = id ?? `switch-${name}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field
          orientation="horizontal"
          className="max-w-sm items-center justify-between"
        >
          <FieldContent>
            {label && <FieldLabel htmlFor={switchId}>{label}</FieldLabel>}
            {description && <FieldDescription>{description}</FieldDescription>}
          </FieldContent>
          <Switch
            id={switchId}
            isSelected={Boolean(field.value)}
            onChange={(checked) => field.onChange(checked)}
            aria-label={label ?? name}
          />
        </Field>
      )}
    />
  );
};
