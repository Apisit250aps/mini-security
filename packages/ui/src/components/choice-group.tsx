'use client';

import * as React from 'react';
import { Checkbox } from './checkbox';
import { cn } from '#lib/utils';

export interface ChoiceOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  name: string;
  options: ChoiceOption[];
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  disabled = false,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)} role="radiogroup">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

interface CheckboxGroupProps {
  name: string;
  options: ChoiceOption[];
  value?: string[] | null;
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function ControlledCheckboxGroup({
  name,
  options,
  value,
  onChange,
  disabled = false,
  className,
}: CheckboxGroupProps) {
  const selected = value ?? [];
  return (
    <div className={cn('flex flex-col gap-2', className)} role="group">
      {options.map((option) => {
        const checked = selected.includes(option.value);
        return (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              id={`${name}-${option.value}`}
              isSelected={checked}
              isDisabled={disabled}
              onChange={(nextChecked) =>
                onChange(
                  nextChecked
                    ? [...selected, option.value]
                    : selected.filter((item) => item !== option.value),
                )
              }
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
