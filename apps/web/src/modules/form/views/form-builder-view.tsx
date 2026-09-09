'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  FileUp,
  Hash,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  ListOrdered,
  Plus,
  Settings2,
  Shield,
  Sparkles,
  ToggleLeft,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { useOverlay } from '@repo/ui/hooks';
import { toast } from '@repo/ui/components/sonner';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useFormTemplateQueries } from '../hooks/form-queries';
import { useFormVersionPublish } from '../hooks/form-mutations';
import { buildPageUrl, getErrorMessage } from '@/shared/utils';
import type { FormFieldType } from '@repo/domains/schema/form';

import FormTemplateEditDialog from '../components/template/form-template-edit-dialog';
import FormTemplateRolesDialog from '../components/template/form-template-roles-dialog';
import FormTemplateSectionDialog from '../components/template/form-template-section-dialog';
import FormTemplateFieldDialog from '../components/template/form-template-field-dialog';
import DynamicFieldRenderer from '../components/fill/dynamic-field-renderer';

interface FormBuilderViewProps {
  templateId: string;
}

export default function FormBuilderView({ templateId }: FormBuilderViewProps) {
  const ui = useOverlay();
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  const { data: session } = useSession();

  const membersQuery = useCompanyMembersQueries(activeCompanyId || '');
  const templateQuery = useFormTemplateQueries(templateId);
  const publishMutation = useFormVersionPublish(
    activeCompanyId || '',
    templateId,
  );

  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>(
    {},
  );

  const currentMember = membersQuery.data?.find(
    (m) => m.userId === session?.user.id && m.isActive,
  );
  const memberId = currentMember?.id || session?.user.id || '';

  const detail = templateQuery.data;
  const template = detail?.template;
  const draftVersion = detail?.draftVersion;
  const activeVersion = detail?.activeVersion;
  const currentVersion = draftVersion ?? activeVersion;
  const sections = detail?.sections || [];
  const fields = detail?.fields || [];
  const roles = detail?.roles || [];

  // Dialog Handlers
  const handleEditInfo = useCallback(() => {
    if (!template || !activeCompanyId) return;
    ui.dialog.open({
      title: 'แก้ไขข้อมูลแบบฟอร์ม',
      description: 'ปรับปรุงชื่อ คำอธิบาย หรือสถานะการเปิดใช้งาน',
      size: 'lg',
      children: (
        <FormTemplateEditDialog
          companyId={activeCompanyId}
          template={template}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, activeCompanyId, template]);

  const handleEditRoles = useCallback(() => {
    if (!activeCompanyId) return;
    ui.dialog.open({
      title: 'จัดการตำแหน่งที่มีสิทธิ์กรอกฟอร์ม (Roles)',
      description: template?.name || '',
      size: 'md',
      children: (
        <FormTemplateRolesDialog
          companyId={activeCompanyId}
          templateId={templateId}
          currentRoles={roles}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, activeCompanyId, templateId, roles, template?.name]);

  const handleAddSection = useCallback(() => {
    if (!activeCompanyId || !currentVersion) {
      toast.error('ไม่พบเวอร์ชันแบบฟอร์ม');
      return;
    }

    ui.dialog.open({
      title: 'เพิ่มหมวดหมู่คำถาม (Section)',
      description: `แบบฟอร์ม: ${template?.name || ''}`,
      size: 'md',
      children: (
        <FormTemplateSectionDialog
          companyId={activeCompanyId}
          templateId={templateId}
          formVersionId={currentVersion.id}
          currentSectionsCount={sections.length}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [
    ui.dialog,
    activeCompanyId,
    templateId,
    currentVersion,
    template?.name,
    sections.length,
  ]);

  const handleAddField = useCallback(
    (defaultSectionId?: string) => {
      if (!activeCompanyId || !currentVersion) {
        toast.error('ไม่พบเวอร์ชันแบบฟอร์ม');
        return;
      }

      if (sections.length === 0) {
        toast.error('กรุณาสร้างหมวดหมู่คำถาม (Section) ก่อนเพิ่มคำถาม');
        return;
      }

      ui.dialog.open({
        title: 'เพิ่มคำถามใหม่ (Field)',
        description: `แบบฟอร์ม: ${template?.name || ''}`,
        size: 'lg',
        children: (
          <FormTemplateFieldDialog
            companyId={activeCompanyId}
            templateId={templateId}
            formVersionId={currentVersion.id}
            sections={sections}
            defaultSectionId={defaultSectionId}
            onClose={() => ui.dialog.close()}
          />
        ),
      });
    },
    [
      ui.dialog,
      activeCompanyId,
      templateId,
      currentVersion,
      sections,
      template?.name,
    ],
  );

  const handlePublish = useCallback(() => {
    if (!draftVersion) {
      toast.error('ไม่พบฉบับร่างที่พร้อมเผยแพร่');
      return;
    }

    if (sections.length === 0) {
      toast.error('แบบฟอร์มต้องมีหมวดหมู่คำถามอย่างน้อย 1 หมวด');
      return;
    }

    if (fields.length === 0) {
      toast.error('แบบฟอร์มต้องมีคำถามอย่างน้อย 1 ข้อ');
      return;
    }

    ui.alert.open({
      title: 'ยืนยันการเผยแพร่แบบฟอร์ม',
      description: `ต้องการเผยแพร่ ${template?.name} (เวอร์ชัน v${draftVersion.version}) ใช่หรือไม่? สมาชิกที่มีสิทธิ์จะสามารถเริ่มกรอกแบบฟอร์มนี้ได้ทันที`,
      confirmVariant: 'default',
      onConfirm: () => {
        publishMutation.mutate(
          { memberId },
          {
            onSuccess: () => {
              ui.alert.close();
              toast.success('เผยแพร่แบบฟอร์มสำเร็จเรียบร้อยแล้ว');
            },
            onError: (err) => {
              toast.error(getErrorMessage(err, 'ไม่สามารถเผยแพร่แบบฟอร์มได้'));
            },
          },
        );
      },
    });
  }, [
    ui.alert,
    draftVersion,
    sections.length,
    fields.length,
    template?.name,
    publishMutation,
    memberId,
  ]);

  const getFieldIcon = (type: FormFieldType) => {
    switch (type) {
      case 'TEXT':
        return <FileText className="size-4 text-blue-500" />;
      case 'NUMBER':
        return <Hash className="size-4 text-emerald-500" />;
      case 'SELECT':
        return <ListOrdered className="size-4 text-purple-500" />;
      case 'BOOLEAN':
        return <ToggleLeft className="size-4 text-amber-500" />;
      case 'DATE':
        return <Calendar className="size-4 text-cyan-500" />;
      case 'IMAGE':
        return <ImageIcon className="size-4 text-rose-500" />;
      case 'FILE':
        return <FileUp className="size-4 text-orange-500" />;
      default:
        return <HelpCircle className="size-4 text-muted-foreground" />;
    }
  };

  const getFieldTypeName = (type: FormFieldType) => {
    switch (type) {
      case 'TEXT':
        return 'ข้อความ (Text)';
      case 'NUMBER':
        return 'ตัวเลข (Number)';
      case 'SELECT':
        return 'ตัวเลือก (Select)';
      case 'BOOLEAN':
        return 'ใช่/ไม่ใช่ (Yes/No)';
      case 'DATE':
        return 'วันที่ (Date)';
      case 'IMAGE':
        return 'รูปภาพ (Image)';
      case 'FILE':
        return 'ไฟล์เอกสาร (File)';
      default:
        return type;
    }
  };

  const isPageLoading =
    isCompanyLoading || !activeCompanyId || templateQuery.isLoading;

  return (
    <PageLayout
      pageId="companyFormBuilder"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดโครงสร้างแบบฟอร์ม..."
      actions={
        <div className="flex items-center gap-2">
          <Link href={buildPageUrl('companyFormTemplates')}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับหน้ารายการ
            </Button>
          </Link>

          {draftVersion && (
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onPress={handlePublish}
              isDisabled={publishMutation.isPending}
            >
              <Sparkles className="w-4 h-4" />
              เผยแพร่แบบฟอร์ม (Publish)
            </Button>
          )}
        </div>
      }
    >
      {!template ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-muted-foreground">ไม่พบข้อมูลแบบฟอร์มที่ระบุ</p>
          <Link href={buildPageUrl('companyFormTemplates')}>
            <Button variant="outline">กลับหน้ารายการแบบฟอร์ม</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          {/* Top Control Bar: Mode Switcher & Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">
                    {template.name}
                  </h2>
                  {draftVersion ? (
                    <Badge
                      variant="outline"
                      className="border-amber-500/40 text-amber-600 bg-amber-50 dark:bg-amber-950/30 text-xs"
                    >
                      ฉบับร่าง v{draftVersion.version}
                    </Badge>
                  ) : activeVersion ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-xs"
                    >
                      เผยแพร่แล้ว v{activeVersion.version}
                    </Badge>
                  ) : null}
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                    {template.description}
                  </p>
                )}
              </div>
            </div>

            {/* View Switcher: Builder vs Preview */}
            <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-1">
              <Button
                variant={activeTab === 'builder' ? 'default' : 'ghost'}
                size="sm"
                className="gap-1.5 text-xs h-8"
                onPress={() => setActiveTab('builder')}
              >
                <Layers className="size-3.5" />
                ออกแบบคำถาม ({fields.length})
              </Button>
              <Button
                variant={activeTab === 'preview' ? 'default' : 'ghost'}
                size="sm"
                className="gap-1.5 text-xs h-8"
                onPress={() => setActiveTab('preview')}
              >
                <Eye className="size-3.5" />
                ดูตัวอย่างฟอร์มจริง
              </Button>
            </div>
          </div>

          {/* TAB 1: FORM BUILDER CANVAS */}
          {activeTab === 'builder' && (
            <div className="flex flex-col gap-6">
              {/* Form Settings & Roles Strip */}
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Shield className="size-4 text-primary" />
                        <span className="text-sm font-medium">
                          สิทธิ์ตำแหน่งที่เข้าถึงแบบฟอร์มนี้:
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {roles.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">
                            ยังไม่ได้ระบุตำแหน่ง (ผู้มีสิทธิ์ทุกคนเข้าถึงได้)
                          </span>
                        ) : (
                          roles.map((r) => (
                            <Badge
                              key={r.id}
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {r.roleId}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onPress={handleEditRoles}
                      >
                        <Shield className="size-3.5" />
                        จัดการสิทธิ์ Role
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onPress={handleEditInfo}
                      >
                        <Settings2 className="size-3.5" />
                        แก้ไขข้อมูลแบบฟอร์ม
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Sections & Fields List */}
              {sections.length === 0 ? (
                <Card className="border-dashed border-2 border-border/80 bg-muted/10 p-8 text-center">
                  <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Layers className="size-6" />
                    </div>
                    <CardTitle className="text-base">
                      ยังไม่มีหมวดหมู่คำถามในแบบฟอร์ม
                    </CardTitle>
                    <CardDescription className="text-xs">
                      เริ่มต้นโดยการเพิ่มหมวดหมู่แรก (เช่น ข้อมูลทั่วไป,
                      การตรวจสอบอุปกรณ์, รายการความปลอดภัย) เพื่อจัดกลุ่มคำถาม
                    </CardDescription>
                    <Button
                      variant="default"
                      size="sm"
                      className="mt-2 gap-1.5"
                      onPress={handleAddSection}
                    >
                      <Plus className="size-4" />
                      เพิ่มหมวดหมู่แรก (Add Section)
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="flex flex-col gap-6">
                  {sections.map((section, sIdx) => {
                    const sectionFields = fields
                      .filter((f) => f.formSectionId === section.id)
                      .sort((a, b) => a.sortOrder - b.sortOrder);

                    return (
                      <Card
                        key={section.id}
                        className="border-border/60 shadow-xs"
                      >
                        {/* Section Header */}
                        <CardHeader className="py-4 bg-muted/20 border-b border-border/50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
                                  {sIdx + 1}
                                </span>
                                <h3 className="text-base font-semibold">
                                  {section.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="text-[11px] font-normal"
                                >
                                  {sectionFields.length} คำถาม
                                </Badge>
                              </div>
                              {section.description && (
                                <p className="text-xs text-muted-foreground mt-1 ml-8">
                                  {section.description}
                                </p>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs self-start sm:self-auto"
                              onPress={() => handleAddField(section.id)}
                            >
                              <Plus className="size-3.5" />
                              เพิ่มคำถามในหมวดนี้
                            </Button>
                          </div>
                        </CardHeader>

                        {/* Fields inside Section */}
                        <CardContent className="p-4">
                          {sectionFields.length === 0 ? (
                            <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-lg">
                              ยังไม่มีคำถามในหมวดหมู่นี้ คลิก
                              &quot;เพิ่มคำถามในหมวดนี้&quot; ด้านบน
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2.5">
                              {sectionFields.map((field, fIdx) => {
                                const selectConfig = field.config as {
                                  options?: Array<{
                                    label: string;
                                    value: string;
                                  }>;
                                };
                                const options = Array.isArray(
                                  selectConfig?.options,
                                )
                                  ? selectConfig.options
                                  : [];

                                return (
                                  <div
                                    key={field.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border/50 bg-background/60 hover:bg-muted/20 transition-colors"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex size-8 items-center justify-center rounded-md bg-muted/60 shrink-0 mt-0.5">
                                        {getFieldIcon(field.type)}
                                      </div>
                                      <div className="flex flex-col">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-xs text-muted-foreground font-mono">
                                            {sIdx + 1}.{fIdx + 1}
                                          </span>
                                          <span className="text-sm font-medium">
                                            {field.label}
                                          </span>
                                          {field.isRequired && (
                                            <Badge
                                              variant="outline"
                                              className="border-red-500/40 text-red-600 bg-red-50 dark:bg-red-950/30 text-[10px] px-1.5 py-0 h-4"
                                            >
                                              จำเป็น
                                            </Badge>
                                          )}
                                        </div>

                                        {field.description && (
                                          <p className="text-xs text-muted-foreground mt-0.5">
                                            {field.description}
                                          </p>
                                        )}

                                        {/* Select Options Pill Badges */}
                                        {field.type === 'SELECT' &&
                                          options.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                              <span className="text-[11px] text-muted-foreground">
                                                ตัวเลือก:
                                              </span>
                                              {options.map((opt) => (
                                                <Badge
                                                  key={opt.value}
                                                  variant="secondary"
                                                  className="text-[10px] px-1.5 py-0 font-normal"
                                                >
                                                  {opt.label}
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs font-normal"
                                      >
                                        {getFieldTypeName(field.type)}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Add Section Button */}
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      className="gap-2 border-dashed border-border hover:border-primary/50"
                      onPress={handleAddSection}
                    >
                      <Plus className="size-4" />
                      เพิ่มหมวดหมู่ใหม่ (Add Section)
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE INTERACTIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 text-xs text-blue-800 dark:text-blue-300">
                <CheckCircle2 className="size-4 shrink-0 text-blue-600" />
                <span>
                  <strong>
                    มุมมองตัวอย่างฟอร์มจริง (Responder Live Preview):
                  </strong>{' '}
                  นี่คือหน้าตาและพฤติกรรมจริงที่ผู้ใช้งานจะเห็นเมื่อกรอกแบบฟอร์มนี้
                  คุณสามารถทดลองพิมพ์หรือเลือกตัวเลือกต่างๆ ได้ทันที
                </span>
              </div>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  {template.description && (
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-6 flex flex-col gap-8">
                  {sections.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      ยังไม่มีข้อมูลฟิลด์สำหรับแสดงตัวอย่าง
                    </p>
                  ) : (
                    sections.map((section, sIdx) => {
                      const sectionFields = fields
                        .filter((f) => f.formSectionId === section.id)
                        .sort((a, b) => a.sortOrder - b.sortOrder);

                      return (
                        <div key={section.id} className="flex flex-col gap-4">
                          <div className="border-b border-border/40 pb-2">
                            <h3 className="text-base font-semibold">
                              {sIdx + 1}. {section.title}
                            </h3>
                            {section.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {section.description}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sectionFields.map((field) => (
                              <div
                                key={field.id}
                                className={
                                  field.type === 'TEXT' ||
                                  field.type === 'IMAGE' ||
                                  field.type === 'FILE'
                                    ? 'md:col-span-2'
                                    : 'col-span-1'
                                }
                              >
                                <DynamicFieldRenderer
                                  field={field}
                                  value={previewAnswers[field.id]}
                                  onChange={(val) =>
                                    setPreviewAnswers((prev) => ({
                                      ...prev,
                                      [field.id]: val,
                                    }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
