import { Controller, FieldValues } from 'react-hook-form';
import { Checkbox } from '@repo/ui/components/checkbox';
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from '@repo/ui/components/field';
import { cn } from '@repo/ui/lib/utils';
import { CheckboxGroupProps } from '#types/form';
export function CheckboxGroup<T extends FieldValues>({
  control,
  name,
  label,
  options,
  className,
  containerClassName,
  columns = 1,
}: CheckboxGroupProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const valueArray: string[] = Array.isArray(field.value)
          ? field.value.map(String)
          : [];
        return (
          <Field className={cn('flex flex-col gap-2', className)}>
            {label && (
              <FieldLabel className="text-base font-semibold">
                {label}
              </FieldLabel>
            )}

            <div
              className={cn(
                `grid grid-cols-${columns} gap-2`,
                containerClassName,
              )}
            >
              {options.map((option) => {
                const optionId = String(option.value);
                const domId = `${name}-${optionId}`;
                const isChecked = valueArray.includes(optionId);
                return (
                  <Field key={optionId} orientation="horizontal">
                    <Checkbox
                      id={domId}
                      isSelected={isChecked}
                      onChange={(checked) => {
                        if (checked) {
                          field.onChange([...valueArray, optionId]);
                        } else {
                          field.onChange(
                            valueArray.filter((val) => val !== optionId),
                          );
                        }
                      }}
                    />
                    <FieldContent className="font-normal cursor-pointer select-none">
                      <FieldLabel
                        htmlFor={domId}
                        className="text-base cursor-pointer"
                      >
                        {option.label}
                      </FieldLabel>
                    </FieldContent>
                  </Field>
                );
              })}
            </div>
            {error && <FieldError errors={[error]} />}
          </Field>
        );
      }}
    />
  );
}
