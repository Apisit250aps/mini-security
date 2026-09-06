'use client';

import * as React from 'react';
import { Field, FieldLabel, FieldError } from '@repo/ui/components/field';
import { Controller, FieldValues, Control, Path } from 'react-hook-form';
import { Button } from '@repo/ui/components/button';
import { Popover, PopoverTrigger } from '@repo/ui/components/popover';
import { Dialog as AriaDialog } from 'react-aria-components';
import { Clock } from 'lucide-react';
import type { BaseFieldProps } from '#types/form';

export type TimeRangeFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name?: Path<T>;
  startName?: Path<T>;
  endName?: Path<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  withSeconds?: boolean;
};

const TIME_PRESETS = [
  { label: '08:00 - 17:00', start: '08:00', end: '17:00' },
  { label: '08:30 - 17:30', start: '08:30', end: '17:30' },
  { label: '09:00 - 18:00', start: '09:00', end: '18:00' },
  { label: '08:00 - 09:00', start: '08:00', end: '09:00' },
  { label: '12:00 - 13:00', start: '12:00', end: '13:00' },
  { label: '17:00 - 18:00', start: '17:00', end: '18:00' },
];

function formatTimeWithSeconds(
  val: string | null | undefined,
  withSeconds: boolean,
): string {
  if (!val) return '';
  const trimmed = val.trim();
  const parts = trimmed.split(':');
  const h = parts[0] ? parts[0].padStart(2, '0') : '00';
  const m = parts[1] ? parts[1].padStart(2, '0') : '00';
  if (withSeconds) {
    const s = parts[2] ? parts[2].padStart(2, '0') : '00';
    return `${h}:${m}:${s}`;
  }
  return `${h}:${m}`;
}

function normalizeToInputTime(val: string | null | undefined): string {
  if (!val) return '';
  const parts = val.trim().split(':');
  if (parts.length >= 2) {
    return `${parts[0]!.padStart(2, '0')}:${parts[1]!.padStart(2, '0')}`;
  }
  return val;
}

export function TimeRangeField<T extends FieldValues>({
  name,
  startName,
  endName,
  control,
  label,
  placeholder = 'เลือกช่วงเวลา',
  disabled,
  required,
  id,
  withSeconds = true,
}: TimeRangeFieldProps<T>) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  if (startName && endName) {
    return (
      <Controller
        name={startName}
        control={control}
        rules={{ required: required ? 'กรุณาระบุเวลาเริ่มต้น' : false }}
        render={({ field: startField, fieldState: startState }) => (
          <Controller
            name={endName}
            control={control}
            rules={{ required: required ? 'กรุณาระบุเวลาสิ้นสุด' : false }}
            render={({ field: endField, fieldState: endState }) => {
              const startVal = startField.value as string | undefined;
              const endVal = endField.value as string | undefined;
              const isInvalid = startState.invalid || endState.invalid;
              const error = startState.error || endState.error;
              const displayStart = normalizeToInputTime(startVal);
              const displayEnd = normalizeToInputTime(endVal);

              const handleApplyPreset = (s: string, e: string) => {
                startField.onChange(formatTimeWithSeconds(s, withSeconds));
                endField.onChange(formatTimeWithSeconds(e, withSeconds));
              };

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
                      className="w-full justify-start font-normal"
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {displayStart && displayEnd ? (
                        <span className="font-medium text-foreground">
                          {displayStart} - {displayEnd}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {placeholder}
                        </span>
                      )}
                    </Button>
                    <Popover className="w-80 p-3" placement="bottom start">
                      <AriaDialog
                        aria-label={label ?? placeholder}
                        className="flex flex-col gap-3 outline-none"
                      >
                        <div className="text-xs font-semibold text-muted-foreground">
                          พรีเซ็ตช่วงเวลาด่วน (Quick Presets)
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {TIME_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => handleApplyPreset(p.start, p.end)}
                              className="rounded-md border border-input bg-background px-2 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground text-center transition-colors"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>

                        <div className="border-t pt-2 grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                              เวลาเริ่มต้น
                            </label>
                            <input
                              type="time"
                              value={normalizeToInputTime(startVal)}
                              onChange={(ev) => {
                                const val = ev.target.value;
                                startField.onChange(
                                  formatTimeWithSeconds(val, withSeconds),
                                );
                              }}
                              className="h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                              เวลาสิ้นสุด
                            </label>
                            <input
                              type="time"
                              value={normalizeToInputTime(endVal)}
                              onChange={(ev) => {
                                const val = ev.target.value;
                                endField.onChange(
                                  formatTimeWithSeconds(val, withSeconds),
                                );
                              }}
                              className="h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                        </div>
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
      rules={{ required: required ? 'กรุณาระบุช่วงเวลา' : false }}
      render={({ field, fieldState }) => {
        const value = (field.value || {}) as {
          start?: string;
          end?: string;
        };
        const displayStart = normalizeToInputTime(value.start);
        const displayEnd = normalizeToInputTime(value.end);

        const handleApplyPreset = (s: string, e: string) => {
          field.onChange({
            start: formatTimeWithSeconds(s, withSeconds),
            end: formatTimeWithSeconds(e, withSeconds),
          });
        };

        return (
          <Field
            data-invalid={fieldState.invalid}
            data-disabled={disabled || field.disabled}
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
                isDisabled={disabled || field.disabled}
                aria-label={label ?? placeholder}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? errorId : undefined}
                className="w-full justify-start font-normal"
              >
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                {displayStart && displayEnd ? (
                  <span className="font-medium text-foreground">
                    {displayStart} - {displayEnd}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </Button>
              <Popover className="w-80 p-3" placement="bottom start">
                <AriaDialog
                  aria-label={label ?? placeholder}
                  className="flex flex-col gap-3 outline-none"
                >
                  <div className="text-xs font-semibold text-muted-foreground">
                    พรีเซ็ตช่วงเวลาด่วน (Quick Presets)
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TIME_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleApplyPreset(p.start, p.end)}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground text-center transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-2 grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">
                        เวลาเริ่มต้น
                      </label>
                      <input
                        type="time"
                        value={normalizeToInputTime(value.start)}
                        onChange={(ev) => {
                          const val = ev.target.value;
                          field.onChange({
                            ...value,
                            start: formatTimeWithSeconds(val, withSeconds),
                          });
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">
                        เวลาสิ้นสุด
                      </label>
                      <input
                        type="time"
                        value={normalizeToInputTime(value.end)}
                        onChange={(ev) => {
                          const val = ev.target.value;
                          field.onChange({
                            ...value,
                            end: formatTimeWithSeconds(val, withSeconds),
                          });
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
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

export function TimeField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'เลือกเวลา',
  disabled,
  required,
  id,
  withSeconds = true,
}: BaseFieldProps<T> & {
  placeholder?: string;
  id?: string;
  withSeconds?: boolean;
}) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? 'กรุณาระบุเวลา' : false }}
      render={({ field, fieldState }) => {
        const val = field.value as string | undefined;
        return (
          <Field
            data-invalid={fieldState.invalid}
            data-disabled={disabled || field.disabled}
          >
            {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
            <div className="relative">
              <input
                type="time"
                id={inputId}
                ref={field.ref}
                onBlur={field.onBlur}
                disabled={disabled || field.disabled}
                value={normalizeToInputTime(val)}
                onChange={(ev) => {
                  field.onChange(
                    formatTimeWithSeconds(ev.target.value, withSeconds),
                  );
                }}
                aria-label={label ?? placeholder}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? errorId : undefined}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {fieldState.invalid && (
              <FieldError id={errorId} errors={[fieldState.error]} />
            )}
          </Field>
        );
      }}
    />
  );
}
