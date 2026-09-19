'use client';

import React from 'react';
import type { FormField } from '@repo/domains/entities';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Switch } from '@repo/ui/components/switch';
import { renderFormAttachmentField } from './form-attachment-field';

interface DynamicFieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  submissionId?: string;
}

export default function DynamicFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
  submissionId,
}: DynamicFieldRendererProps) {
  const isRequired = field.isRequired;

  const renderControl = () => {
    switch (field.type) {
      case 'TEXT':
      case 'TEXTAREA':
        return (
          <Textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={field.placeholder || 'ระบุข้อความคำตอบ...'}
            minLength={field.minLength ?? undefined}
            maxLength={field.maxLength ?? undefined}
            rows={2}
          />
        );

      case 'NUMBER':
        return (
          <Input
            type="number"
            value={value !== undefined && value !== null ? String(value) : ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === '' ? null : Number(val));
            }}
            disabled={disabled}
            placeholder={field.placeholder || '0'}
            min={field.min ?? undefined}
            max={field.max ?? undefined}
          />
        );

      case 'SELECT':
      case 'RADIO': {
        const options = field.options || [];
        if (field.type === 'RADIO')
          return (
            <div className="flex flex-col gap-2">
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="radio"
                    name={field.id}
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
        return (
          <select
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-label={field.placeholder || field.label}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">-- กรุณาเลือก --</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      case 'CHECKBOX_GROUP': {
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-col gap-2">
            {(field.options || []).map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...selected, option.value]
                        : selected.filter((item) => item !== option.value),
                    )
                  }
                  disabled={disabled}
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      }

      case 'BOOLEAN': {
        const isChecked = Boolean(value);
        return (
          <div className="flex items-center gap-3 py-1">
            <Switch
              isSelected={isChecked}
              onChange={(checked) => onChange(checked)}
              isDisabled={disabled}
            />
            <span className="text-sm font-medium">
              {isChecked ? 'ใช่ / ผ่าน (Yes)' : 'ไม่ใช่ / ไม่ผ่าน (No)'}
            </span>
          </div>
        );
      }

      case 'DATE':
        return (
          <Input
            type="date"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );

      case 'EMAIL':
        return (
          <Input
            type="email"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={field.placeholder || 'name@example.com'}
            minLength={field.minLength ?? undefined}
            maxLength={field.maxLength ?? undefined}
          />
        );

      case 'IMAGE':
      case 'FILE':
        return submissionId ? (
          renderFormAttachmentField({
            submissionId,
            fieldId: field.id,
            image: field.type === 'IMAGE',
            disabled,
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            แนบไฟล์ได้เมื่อเปิดกรอกแบบฟอร์ม
          </p>
        );

      default:
        return (
          <Input
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg border bg-card text-card-foreground">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold flex items-center gap-1.5">
          <span>{field.label}</span>
          {isRequired && (
            <span className="text-destructive font-bold text-xs">*</span>
          )}
        </label>
        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
          {field.type}
        </span>
      </div>

      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}

      <div className="pt-1">{renderControl()}</div>
    </div>
  );
}
