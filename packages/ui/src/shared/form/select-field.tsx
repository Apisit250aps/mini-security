import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { FieldValues, Controller } from 'react-hook-form';
import { Field, FieldLabel, FieldError } from '@repo/ui/components/field';
import type { BaseFieldProps, Option } from '#types/form';

export const SelectField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  required,
  valueAsNumber = false,
  id,
}: BaseFieldProps<T> & {
  options: Option[];
  placeholder?: string;
  valueAsNumber?: boolean;
  id?: string;
}) => {
  const selectId = id ?? `select-${name}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedKey =
          field.value != null && field.value !== ''
            ? String(field.value)
            : null;

        return (
          <Field data-invalid={fieldState.invalid}>
            {label != null && (
              <FieldLabel htmlFor={selectId}>
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
              </FieldLabel>
            )}
            <Select
              selectedKey={selectedKey}
              onSelectionChange={(key) => {
                if (key == null) {
                  field.onChange(null);
                  return;
                }
                if (valueAsNumber) {
                  const num = Number(key);
                  field.onChange(Number.isNaN(num) ? null : num);
                } else {
                  field.onChange(key);
                }
              }}
              isRequired={required}
              isDisabled={field.disabled}
              aria-invalid={fieldState.invalid}
            >
              <SelectTrigger
                className="w-full"
                id={selectId}
                ref={field.ref}
                onBlur={() => field.onBlur()}
                aria-invalid={fieldState.invalid}
              >
                <SelectValue>{placeholder ?? 'เลือกรายการ'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem
                      key={String(option.value)}
                      id={String(option.value)}
                      textValue={option.label}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
