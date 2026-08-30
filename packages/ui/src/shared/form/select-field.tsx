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
import { BaseFieldProps, Option } from '#types/form';

export const SelectField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  required,
  valueAsNumber = false,
}: BaseFieldProps<T> &
  React.ComponentProps<typeof Select> & {
    options: Option[];
    placeholder?: string;
    valueAsNumber?: boolean;
  }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label != null && (
            <FieldLabel htmlFor={`select-ele-${name}`}>
              {label}
              {required && <span className="text-red-500">*</span>}
            </FieldLabel>
          )}
          <Select
            key={field.value}
            onChange={(e) => {
              if (valueAsNumber) {
                field.onChange(isNaN(Number(e)) ? null : Number(e));
              } else {
                field.onChange(e);
              }
            }}
            isRequired={required}
            isDisabled={field.disabled}
          >
            <SelectTrigger
              className="w-full"
              id={`select-ele-${name}`}
              ref={field.ref}
              onBlur={() => field.onBlur()}
            >
              <SelectValue>{placeholder ?? ''}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem key={option.value} id={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
