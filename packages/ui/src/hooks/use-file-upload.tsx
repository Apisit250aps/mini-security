"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  file?: File;
}

export interface UseFileUploadOptions {
  accept?: string;
  maxSize?: number; // in bytes (e.g. 5 * 1024 * 1024)
  maxFiles?: number;
  multiple?: boolean;
  initialFiles?: FileMetadata[];
  onFilesChange?: (files: FileMetadata[]) => void;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function matchAccept(fileType: string, fileName: string, accept?: string): boolean {
  if (!accept || accept === "*" || accept === "*/*") return true;

  const patterns = accept.split(",").map((p) => p.trim().toLowerCase());
  const ext = "." + fileName.split(".").pop()?.toLowerCase();

  return patterns.some((pattern) => {
    if (pattern.startsWith(".")) {
      return ext === pattern;
    }
    if (pattern.endsWith("/*")) {
      const mainType = pattern.replace("/*", "");
      return fileType.toLowerCase().startsWith(mainType);
    }
    return fileType.toLowerCase() === pattern;
  });
}

export function useFileUpload({
  accept,
  maxSize,
  maxFiles = 10,
  multiple = false,
  initialFiles = [],
  onFilesChange,
}: UseFileUploadOptions = {}) {
  const [files, setFiles] = useState<FileMetadata[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Clean up preview object URLs
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const createPreview = (file: File): string | undefined => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      previewUrlsRef.current.add(url);
      return url;
    }
    return undefined;
  };

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  const addFiles = useCallback(
    (newFileList: FileList | File[]) => {
      const currentErrors: string[] = [];
      const newItems: FileMetadata[] = [];
      const incomingFiles = Array.from(newFileList);

      const effectiveMaxFiles = multiple ? maxFiles : 1;
      const spaceLeft = effectiveMaxFiles - (multiple ? files.length : 0);

      if (spaceLeft <= 0) {
        currentErrors.push(`สามารถอัปโหลดได้สูงสุด ${effectiveMaxFiles} ไฟล์`);
        setErrors(currentErrors);
        return;
      }

      const filesToProcess = incomingFiles.slice(0, spaceLeft);
      if (incomingFiles.length > spaceLeft) {
        currentErrors.push(`เลือกไฟล์เกินจำนวนที่กำหนด ระบบนำเข้าเฉพาะ ${spaceLeft} ไฟล์แรก`);
      }

      for (const file of filesToProcess) {
        if (accept && !matchAccept(file.type, file.name, accept)) {
          currentErrors.push(`ไฟล์ "${file.name}" ไม่ตรงกับประเภทที่รองรับ (${accept})`);
          continue;
        }

        if (maxSize && file.size > maxSize) {
          currentErrors.push(
            `ไฟล์ "${file.name}" มีขนาดใหญ่เกินไป (ขนาดสูงสุด ${formatBytes(maxSize)})`
          );
          continue;
        }

        const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const preview = createPreview(file);

        newItems.push({
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          preview,
          file,
        });
      }

      setErrors(currentErrors);

      setFiles((prev) => {
        const updated = multiple ? [...prev, ...newItems] : newItems;
        onFilesChange?.(updated);
        return updated;
      });
    },
    [accept, files.length, maxFiles, maxSize, multiple, onFilesChange]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [addFiles]
  );

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }, []);

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const target = prev.find((f) => f.id === id);
        if (target?.preview && previewUrlsRef.current.has(target.preview)) {
          URL.revokeObjectURL(target.preview);
          previewUrlsRef.current.delete(target.preview);
        }
        const updated = prev.filter((f) => f.id !== id);
        onFilesChange?.(updated);
        return updated;
      });
      setErrors([]);
    },
    [onFilesChange]
  );

  const clearFiles = useCallback(() => {
    files.forEach((f) => {
      if (f.preview && previewUrlsRef.current.has(f.preview)) {
        URL.revokeObjectURL(f.preview);
      }
    });
    previewUrlsRef.current.clear();
    setFiles([]);
    setErrors([]);
    onFilesChange?.([]);
  }, [files, onFilesChange]);

  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: "file" as const,
      accept,
      multiple,
      style: { display: "none" },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          addFiles(e.target.files);
        }
      },
    }),
    [accept, addFiles, multiple]
  );

  return [
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
  ] as const;
}
