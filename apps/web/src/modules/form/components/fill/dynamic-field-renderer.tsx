'use client';

import React from 'react';
import type { FormField } from '@repo/domains/entities';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Switch } from '@repo/ui/components/switch';
import { FileUpload, type FileMetadata } from '@repo/ui/components/shared/form';

interface DynamicFieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

export default function DynamicFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
}: DynamicFieldRendererProps) {
  const isRequired = field.isRequired;

  const renderControl = () => {
    switch (field.type) {
      case 'TEXT':
        return (
          <Textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={field.description || 'ระบุข้อความคำตอบ...'}
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
            placeholder="0"
          />
        );

      case 'SELECT': {
        const config = field.config as {
          options?: Array<{ label: string; value: string }>;
        };
        const options = Array.isArray(config?.options) ? config.options : [];
        return (
          <select
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">-- กรุณาเลือก --</option>
            {options.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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

      case 'IMAGE': {
        const imageFiles: FileMetadata[] = [];
        if (typeof value === 'string' && value) {
          imageFiles.push({
            id: 'init-img',
            name: value.split('/').pop() || 'image.jpg',
            size: 0,
            type: 'image/jpeg',
            url: value,
            preview: value,
          });
        } else if (Array.isArray(value)) {
          imageFiles.push(...(value as FileMetadata[]));
        }

        return (
          <FileUpload
            accept="image/*"
            maxSizeMB={5}
            multiple={false}
            disabled={disabled}
            placeholder="ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่อเลือกรูป"
            description="รองรับไฟล์รูปภาพ JPG, PNG, WebP (สูงสุด 5MB)"
            value={imageFiles}
            onChange={(files: FileMetadata[]) => {
              if (files.length === 0) {
                onChange('');
              } else {
                onChange(files[0]?.preview || files[0]?.url || files[0]?.name || '');
              }
            }}
          />
        );
      }

      case 'FILE': {
        const docFiles: FileMetadata[] = [];
        if (typeof value === 'string' && value) {
          docFiles.push({
            id: 'init-file',
            name: value.split('/').pop() || 'attachment',
            size: 0,
            type: 'application/octet-stream',
            url: value,
          });
        } else if (Array.isArray(value)) {
          docFiles.push(...(value as FileMetadata[]));
        }

        return (
          <FileUpload
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.png,.jpg"
            maxSizeMB={10}
            multiple={false}
            disabled={disabled}
            placeholder="ลากไฟล์เอกสารมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์แนบ"
            description="รองรับไฟล์เอกสาร PDF, Office, ภาพถ่าย (สูงสุด 10MB)"
            value={docFiles}
            onChange={(files: FileMetadata[]) => {
              if (files.length === 0) {
                onChange('');
              } else {
                onChange(files[0]?.preview || files[0]?.url || files[0]?.name || '');
              }
            }}
          />
        );
      }

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
