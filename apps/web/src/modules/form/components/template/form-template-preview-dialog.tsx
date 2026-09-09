'use client';

import React from 'react';
import { useFormTemplateQueries } from '../../hooks/form-queries';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';

interface FormTemplatePreviewDialogProps {
  templateId: string;
  onClose: () => void;
}

export default function FormTemplatePreviewDialog({
  templateId,
  onClose,
}: FormTemplatePreviewDialogProps) {
  const { data, isLoading } = useFormTemplateQueries(templateId);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        กำลังโหลดโครงสร้างแบบฟอร์ม...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        ไม่พบข้อมูลแบบฟอร์มนี้
      </div>
    );
  }

  const { template, activeVersion, draftVersion, sections, fields, roles } =
    data;

  // Group fields by section
  const fieldsBySection = new Map<string, typeof fields>();
  for (const field of fields) {
    const list = fieldsBySection.get(field.formSectionId) || [];
    list.push(field);
    fieldsBySection.set(field.formSectionId, list);
  }

  return (
    <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-1">
      {/* Header Overview */}
      <div className="flex flex-col gap-2 border-b pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold">{template.name}</h3>
          <Badge variant={template.isActive ? 'default' : 'secondary'}>
            {template.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </Badge>
        </div>
        {template.description && (
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
          <span>
            เวอร์ชันที่เผยแพร่:{' '}
            {activeVersion ? (
              <Badge variant="outline">v{activeVersion.version}</Badge>
            ) : (
              <span className="text-destructive font-medium">
                ยังไม่เผยแพร่
              </span>
            )}
          </span>
          {draftVersion && (
            <span>
              ฉบับร่างออกแบบ:{' '}
              <Badge variant="secondary">v{draftVersion.version}</Badge>
            </span>
          )}
          <span>
            สิทธิ์เข้าถึง: {roles.filter((r) => r.isEnabled).length} ตำแหน่ง
          </span>
        </div>
      </div>

      {/* Sections and Fields */}
      <div className="flex flex-col gap-6">
        {sections.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
            ยังไม่มีหมวดหมู่คำถาม กรุณากด &quot;เพิ่มหมวดหมู่&quot;
            เพื่อเริ่มต้นออกแบบ
          </div>
        ) : (
          sections.map((section, sIdx) => {
            const sectionFields = fieldsBySection.get(section.id) || [];
            return (
              <div
                key={section.id}
                className="border rounded-lg p-4 bg-muted/20 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h4 className="font-semibold text-sm">
                      {sIdx + 1}. {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{sectionFields.length} คำถาม</Badge>
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  {sectionFields.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      ยังไม่มีคำถามในหมวดหมู่นี้
                    </p>
                  ) : (
                    sectionFields.map((field, fIdx) => (
                      <div
                        key={field.id}
                        className="bg-background p-3 rounded border text-sm flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs text-muted-foreground">
                              {fIdx + 1}.
                            </span>
                            <span className="font-semibold">{field.label}</span>
                            {field.isRequired && (
                              <span className="text-destructive text-xs font-bold">
                                *จำเป็น
                              </span>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {field.type}
                          </Badge>
                        </div>
                        {field.description && (
                          <p className="text-xs text-muted-foreground pl-4">
                            {field.description}
                          </p>
                        )}
                        {field.type === 'SELECT' &&
                          Array.isArray(
                            (field.config as { options?: { label: string }[] })
                              ?.options,
                          ) && (
                            <div className="pl-4 pt-1 flex flex-wrap gap-1">
                              {(
                                field.config as {
                                  options: { label: string }[];
                                }
                              ).options.map((opt, oIdx) => (
                                <span
                                  key={oIdx}
                                  className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                                >
                                  {opt.label}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="outline" onPress={onClose}>
          ปิด
        </Button>
      </div>
    </div>
  );
}
