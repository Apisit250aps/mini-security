'use client';

import * as React from 'react';
import { Field, FieldLabel, FieldError } from '@repo/ui/components/field';
import { Controller, FieldValues } from 'react-hook-form';
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
  placeholder = 'Pick a date',
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
      rules={{ required: required ? 'กรุณาเลือกวันที่' : false }}
      render={({ field, fieldState }) => {
        const date = toDateValue(field.value);
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
                {date ? (
                  format(date.toDate(getLocalTimeZone()), 'PPP')
                ) : (
                  <span>{placeholder}</span>
                )}
              </Button>
              <Popover className="w-auto p-0" placement="bottom start">
                <AriaDialog aria-label={label ?? placeholder}>
                  <Calendar
                    aria-label={label ?? placeholder}
                    value={date}
                    isDisabled={field.disabled}
                    isInvalid={fieldState.invalid}
                    onChange={(value) =>
                      field.onChange(
                        value ? value.toDate(getLocalTimeZone()) : null,
                      )
                    }
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

export { DateField, DateRangeField };
