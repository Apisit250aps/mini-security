import { Controller, FieldValues } from 'react-hook-form';
import { Checkbox } from '@repo/ui/components/checkbox';
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  FieldSet,
  FieldLegend,
} from '@repo/ui/components/field';
import { cn } from '@repo/ui/lib/utils';
import type { CheckboxGroupProps } from '#types/form';

const columnClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
};

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
          <FieldSet className={cn('flex flex-col gap-2.5', className)}>
            {label && (
              <FieldLegend variant="label" className="font-medium text-sm">
                {label}
              </FieldLegend>
            )}

            <div
              className={cn(
                'grid gap-2.5',
                columnClasses[columns] || 'grid-cols-1',
                containerClassName,
              )}
            >
              {options.map((option) => {
                const optionId = String(option.value);
                const domId = `${name}-${optionId}`;
                const isChecked = valueArray.includes(optionId);
                return (
                  <Field
                    key={optionId}
                    orientation="horizontal"
                    className="items-center"
                  >
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
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </FieldLabel>
                    </FieldContent>
                  </Field>
                );
              })}
            </div>
            {error && <FieldError errors={[error]} />}
          </FieldSet>
        );
      }}
    />
  );
}
