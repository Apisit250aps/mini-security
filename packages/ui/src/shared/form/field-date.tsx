'use client';

import * as React from 'react';
import { Field, FieldLabel, FieldError } from '@repo/ui/components/field';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { DialogTrigger, Dialog } from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { format } from 'date-fns';
import { Calendar } from '@repo/ui/components/calendar';
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import { Dialog as AriaDialog, type DateRange } from 'react-aria-components';
import type { BaseFieldProps } from '#types/form';
import { RangeCalendar } from '@repo/ui/components/calendar';
import { Popover, PopoverTrigger } from '@repo/ui/components/popover';
import { CalendarIcon } from 'lucide-react';

function toDateValue(value: unknown): CalendarDate | null {
  const date = value instanceof Date ? value : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

/** Stores a React Aria DateRange (or null) in React Hook Form. */
function DateRangeField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Pick a date range',
  disabled,
  required,
  id,
}: BaseFieldProps<T> & { placeholder?: string; id?: string }) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      rules={{ required: required ? 'Please select a date range' : false }}
      render={({ field, fieldState }) => {
        const date = (field.value ?? null) as DateRange | null;

        return (
          <Field
            data-invalid={fieldState.invalid}
            data-disabled={field.disabled}
          >
            {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
            <PopoverTrigger
              onOpenChange={(isOpen) => {
                if (!isOpen) field.onBlur();
              }}
            >
              <Button
                type="button"
                variant="outline"
                id={inputId}
                ref={field.ref}
                onBlur={field.onBlur}
                isDisabled={field.disabled}
                aria-label={label ?? placeholder}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? errorId : undefined}
                className="w-full justify-start"
              >
                <CalendarIcon data-icon="inline-start" />
                {date?.start && date.end ? (
                  new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'long',
                  }).formatRange(
                    date.start.toDate(getLocalTimeZone()),
                    date.end.toDate(getLocalTimeZone()),
                  )
                ) : (
                  <span>{placeholder}</span>
                )}
              </Button>
              <Popover className="w-auto p-0" placement="bottom start">
                <AriaDialog aria-label={label ?? placeholder}>
                  <RangeCalendar
                    aria-label={label ?? placeholder}
                    value={date}
                    onChange={field.onChange}
                    isDisabled={field.disabled}
                    isInvalid={fieldState.invalid}
                    numberOfMonths={2}
                  />
                </AriaDialog>
              </Popover>
            </PopoverTrigger>
            {fieldState.invalid && (
              <FieldError id={errorId} errors={[fieldState.error]} />
            )}
          </Field>
        );
      }}
    />
  );
}

function DateField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
}: {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        return (
          <Field className="mx-auto">
            {label && (
              <FieldLabel htmlFor="date-picker-simple">{label}</FieldLabel>
            )}
            <DialogTrigger>
              <Button
                variant="outline"
                id="date-picker-simple"
                className="justify-start font-normal"
              >
                {field.value != null && field.value !== '' ? (
                  format(field.value, 'PPP')
                ) : (
                  <span>{placeholder ?? 'Pick a date'}</span>
                )}
              </Button>
              <Popover className="w-auto p-0" placement="bottom start">
                <Dialog>
                  <Calendar
                    value={toDateValue(field.value)}
                    onChange={(date) =>
                      field.onChange(
                        date ? date.toDate(getLocalTimeZone()) : null,
                      )
                    }
                  />
                </Dialog>
              </Popover>
            </DialogTrigger>
          </Field>
        );
      }}
    />
  );
}

export { DateField, DateRangeField };
