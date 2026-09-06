'use client';

import * as React from 'react';
import { Field, FieldLabel, FieldError } from '@repo/ui/components/field';
import { Controller, FieldValues, Control, Path } from 'react-hook-form';
import { Button } from '@repo/ui/components/button';
import { format } from 'date-fns';
import { Calendar } from '@repo/ui/components/calendar';
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import { Dialog as AriaDialog, type DateRange } from 'react-aria-components';
import type { BaseFieldProps } from '#types/form';
import { RangeCalendar } from '@repo/ui/components/calendar';
import { Popover, PopoverTrigger } from '@repo/ui/components/popover';
import { CalendarIcon } from 'lucide-react';

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

function toDateValue(value: unknown): CalendarDate | null {
  if (!value) return null;
  if (value instanceof CalendarDate) return value;
  let date: Date | null = null;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' && value.trim()) {
    const match = ISO_DATE_REGEX.exec(value.trim());
    if (match && match[1] && match[2] && match[3]) {
      return new CalendarDate(
        parseInt(match[1], 10),
        parseInt(match[2], 10),
        parseInt(match[3], 10),
      );
    }
    date = new Date(value);
  }
  if (!date || Number.isNaN(date.getTime())) return null;
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

function toDateRangeValue(value: unknown): DateRange | null {
  if (!value || typeof value !== 'object') return null;
  const range = value as { start?: unknown; end?: unknown };
  const start = toDateValue(range.start);
  const end = toDateValue(range.end);
  if (!start || !end) return null;
  return { start, end };
}

export type DateRangeFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name?: Path<T>;
  startName?: Path<T>;
  endName?: Path<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  valueFormat?: 'date' | 'string';
  onChangeRange?: (start: string | null, end: string | null) => void;
};

/** Stores a React Aria DateRange or { start: string, end: string } in React Hook Form. */
function DateRangeField<T extends FieldValues>({
  name,
  startName,
  endName,
  control,
  label,
  placeholder = 'เลือกช่วงวันที่',
  disabled,
  required,
  id,
  valueFormat = 'string',
  onChangeRange,
}: DateRangeFieldProps<T>) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  if (startName && endName) {
    return (
      <Controller
        name={startName}
        control={control}
        rules={{ required: required ? 'กรุณาเลือกช่วงวันที่' : false }}
        render={({ field: startField, fieldState: startState }) => (
          <Controller
            name={endName}
            control={control}
            render={({ field: endField, fieldState: endState }) => {
              const date = toDateRangeValue({
                start: startField.value,
                end: endField.value,
              });
              const isInvalid = startState.invalid || endState.invalid;
              const error = startState.error || endState.error;

              return (
                <Field
                  data-invalid={isInvalid}
                  data-disabled={
                    disabled || startField.disabled || endField.disabled
                  }
                >
                  {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
                  <PopoverTrigger
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        startField.onBlur();
                        endField.onBlur();
                      }
                    }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      id={inputId}
                      ref={startField.ref}
                      onBlur={() => {
                        startField.onBlur();
                        endField.onBlur();
                      }}
                      isDisabled={
                        disabled || startField.disabled || endField.disabled
                      }
                      aria-label={label ?? placeholder}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className="w-full justify-start"
                    >
                      <CalendarIcon data-icon="inline-start" />
                      {date?.start && date.end ? (
                        new Intl.DateTimeFormat(undefined, {
                          dateStyle: 'medium',
                        }).formatRange(
                          date.start.toDate(getLocalTimeZone()),
                          date.end.toDate(getLocalTimeZone()),
                        )
                      ) : (
                        <span className="text-muted-foreground">
                          {placeholder}
                        </span>
                      )}
                    </Button>
                    <Popover className="w-auto p-0" placement="bottom start">
                      <AriaDialog aria-label={label ?? placeholder}>
                        <RangeCalendar
                          aria-label={label ?? placeholder}
                          value={date}
                          onChange={(range) => {
                            if (!range || !range.start || !range.end) {
                              startField.onChange(null);
                              endField.onChange(null);
                              onChangeRange?.(null, null);
                              return;
                            }
                            const s = `${range.start.year}-${String(range.start.month).padStart(2, '0')}-${String(range.start.day).padStart(2, '0')}`;
                            const e = `${range.end.year}-${String(range.end.month).padStart(2, '0')}-${String(range.end.day).padStart(2, '0')}`;
                            if (valueFormat === 'string') {
                              startField.onChange(s);
                              endField.onChange(e);
                            } else {
                              startField.onChange(
                                range.start.toDate(getLocalTimeZone()),
                              );
                              endField.onChange(
                                range.end.toDate(getLocalTimeZone()),
                              );
                            }
                            onChangeRange?.(s, e);
                          }}
                          isDisabled={
                            disabled || startField.disabled || endField.disabled
                          }
                          isInvalid={isInvalid}
                          numberOfMonths={2}
                        />
                      </AriaDialog>
                    </Popover>
                  </PopoverTrigger>
                  {isInvalid && <FieldError id={errorId} errors={[error]} />}
                </Field>
              );
            }}
          />
        )}
      />
    );
  }

  if (!name) {
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      rules={{ required: required ? 'กรุณาเลือกช่วงวันที่' : false }}
      render={({ field, fieldState }) => {
        const date = toDateRangeValue(field.value);

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
                    dateStyle: 'medium',
                  }).formatRange(
                    date.start.toDate(getLocalTimeZone()),
                    date.end.toDate(getLocalTimeZone()),
                  )
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </Button>
              <Popover className="w-auto p-0" placement="bottom start">
                <AriaDialog aria-label={label ?? placeholder}>
                  <RangeCalendar
                    aria-label={label ?? placeholder}
                    value={date}
                    onChange={(range) => {
                      if (!range || !range.start || !range.end) {
                        field.onChange(range);
                        onChangeRange?.(null, null);
                        return;
                      }
                      const s = `${range.start.year}-${String(range.start.month).padStart(2, '0')}-${String(range.start.day).padStart(2, '0')}`;
                      const e = `${range.end.year}-${String(range.end.month).padStart(2, '0')}-${String(range.end.day).padStart(2, '0')}`;
                      if (valueFormat === 'string') {
                        field.onChange({ start: s, end: e });
                      } else {
                        field.onChange(range);
                      }
                      onChangeRange?.(s, e);
                    }}
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
  placeholder = 'เลือกวันที่',
  disabled,
  required,
  id,
  valueFormat = 'string',
}: BaseFieldProps<T> & {
  placeholder?: string;
  id?: string;
  valueFormat?: 'date' | 'string';
}) {
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
                  format(date.toDate(getLocalTimeZone()), 'dd/MM/yyyy')
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </Button>
              <Popover className="w-auto p-0" placement="bottom start">
                <AriaDialog aria-label={label ?? placeholder}>
                  <Calendar
                    aria-label={label ?? placeholder}
                    value={date}
                    isDisabled={field.disabled}
                    isInvalid={fieldState.invalid}
                    onChange={(value) => {
                      if (!value) {
                        field.onChange(null);
                        return;
                      }
                      if (valueFormat === 'string') {
                        const formatted = `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
                        field.onChange(formatted);
                      } else {
                        field.onChange(value.toDate(getLocalTimeZone()));
                      }
                    }}
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
