'use client';

import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Upload } from 'lucide-react';
import React, { useId, useRef } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

export function FileDropzoneField<T extends FieldValues>({
  name,
  control,
}: {
  name: Path<T>;
  control: Control<T>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0]; // เอาไฟล์แรก
            field.onChange(droppedFile); // อัปเดตเข้า react-hook-form
          }
        };
        return (
          <div className="w-full">
            <div
              className="border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer"
              onClick={handleBoxClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="mb-2 bg-muted rounded-full p-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or,{' '}
                <Label
                  htmlFor={id}
                  className="text-primary hover:text-primary/90 font-medium cursor-pointer"
                  onClick={(e) => e.stopPropagation()} // Prevent triggering handleBoxClick
                >
                  click to browse
                </Label>{' '}
                (4MB max)
              </p>
              <Input
                type="file"
                id={id}
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls" // บังคับให้เลือกได้เฉพาะ Excel
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const selectedFile = e.target.files[0]; // เอาไฟล์แรกแทนที่จะส่งไปทั้ง FileList
                    field.onChange(selectedFile);
                  }
                }}
              />
            </div>
          </div>
        );
      }}
    />
  );
}
