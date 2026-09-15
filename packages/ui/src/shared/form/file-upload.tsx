"use client";

import * as React from "react";
import {
  FileIcon,
  ImageIcon,
  UploadCloud,
  X,
  Trash2,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Button } from "#components/button";
import { cn } from "#lib/utils";
import {
  useFileUpload,
  formatBytes,
  type FileMetadata,
} from "#hooks/use-file-upload";

export interface FileUploadProps {
  value?: FileMetadata[];
  onChange?: (files: FileMetadata[]) => void;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  dropzoneClassName?: string;
  placeholder?: string;
  description?: string;
}

function getFileTypeIcon(type: string, name: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
    return FileSpreadsheet;
  }
  if (type.includes("pdf") || type.includes("text") || name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx")) {
    return FileText;
  }
  return FileIcon;
}

export function FileUpload({
  value,
  onChange,
  accept,
  maxSizeMB = 5,
  maxFiles = 5,
  multiple = false,
  disabled = false,
  className,
  dropzoneClassName,
  placeholder = "ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์",
  description,
}: FileUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept,
    maxSize,
    maxFiles,
    multiple,
    initialFiles: value || [],
    onFilesChange: onChange,
  });

  const displayFiles = value !== undefined ? value : files;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <input {...getInputProps()} disabled={disabled} aria-label="Upload files input" />

      {/* Dropzone Container */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : openFileDialog}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openFileDialog();
          }
        }}
        onDragEnter={disabled ? undefined : handleDragEnter}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDragOver={disabled ? undefined : handleDragOver}
        onDrop={disabled ? undefined : handleDrop}
        data-dragging={isDragging || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "relative flex min-h-[140px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-6 text-center transition-all duration-150 outline-none select-none",
          "hover:border-primary/60 hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5",
          "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
          !disabled && "cursor-pointer",
          dropzoneClassName,
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-full border bg-muted/40 text-muted-foreground transition-colors group-hover:text-primary">
            <UploadCloud className="size-5 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground">{placeholder}</p>
            <p className="text-xs text-muted-foreground">
              {description ||
                `รองรับขนาดสูงสุด ${maxSizeMB}MB ${multiple ? `· สูงสุด ${maxFiles} ไฟล์` : ""}`}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            isDisabled={disabled}
            className="mt-1 gap-1.5 text-xs pointer-events-none"
          >
            เลือกไฟล์จากเครื่อง
          </Button>
        </div>
      </div>

      {/* File List / Preview */}
      {displayFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-muted-foreground">
              ไฟล์ที่เลือก ({displayFiles.length}
              {multiple && ` / ${maxFiles}`})
            </span>
            {multiple && displayFiles.length > 1 && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                ลบทั้งหมด
              </Button>
            )}
          </div>

          <ul className="grid gap-2">
            {displayFiles.map((f) => {
              const Icon = getFileTypeIcon(f.type, f.name);
              const isImage = f.type.startsWith("image/") && (f.preview || f.url);

              return (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card p-2.5 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {isImage ? (
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <img
                          src={f.preview || f.url}
                          alt={f.name}
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
                        <Icon className="size-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {f.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(f.size)}
                      </p>
                    </div>
                  </div>

                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(f.id);
                      }}
                      aria-label={`ลบ ${f.name}`}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="flex flex-col gap-1 px-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive font-medium" role="alert">
              • {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
