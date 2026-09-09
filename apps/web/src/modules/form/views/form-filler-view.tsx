'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck,
  FileText,
  Save,
  Send,
  Shield,
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
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useOverlay } from '@repo/ui/hooks';
import { toast } from '@repo/ui/components/sonner';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useFormSubmissionQueries } from '../hooks/form-queries';
import {
  useFormSubmissionSaveDraft,
  useFormSubmissionSubmit,
  useFormSubmissionClone,
} from '../hooks/form-mutations';
import { getErrorMessage } from '@/shared/utils';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import type { FormField } from '@repo/domains/entities';

import DynamicFieldRenderer from '../components/fill/dynamic-field-renderer';
import FormSubmissionReviewDialog from '../components/submission/form-submission-review-dialog';

interface FormFillerViewProps {
  submissionId: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }
> = {
  DRAFT: {
    label: 'ฉบับร่าง (Draft)',
    variant: 'outline',
    className:
      'border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30',
  },
  SUBMITTED: {
    label: 'ส่งแล้ว รอพิจารณา (Submitted)',
    variant: 'default',
    className: 'bg-primary/90 text-primary-foreground',
  },
  APPROVED: {
    label: 'อนุมัติแล้ว (Approved)',
    variant: 'outline',
    className:
      'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30',
  },
  REJECTED: {
    label: 'ไม่อนุมัติ (Rejected)',
    variant: 'destructive',
    className: '',
  },
};

export default function FormFillerView({ submissionId }: FormFillerViewProps) {
  const router = useRouter();
  const ui = useOverlay();

  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  const { data: session } = useSession();

  const membersQuery = useCompanyMembersQueries(activeCompanyId || '');
  const rolesQuery = useCompanyRolesQueries(activeCompanyId || '');
  const submissionQuery = useFormSubmissionQueries(submissionId);

  const saveDraftMutation = useFormSubmissionSaveDraft(
    submissionId,
    activeCompanyId || '',
  );
  const submitMutation = useFormSubmissionSubmit(
    submissionId,
    activeCompanyId || '',
  );
  const cloneMutation = useFormSubmissionClone(activeCompanyId || '');

  const [edits, setEdits] = useState<Record<string, unknown>>({});

  const detail = submissionQuery.data;
  const currentMember = membersQuery.data?.find(
    (m) => m.userId === session?.user.id && m.isActive,
  );
  const memberId = currentMember?.id || session?.user.id || '';

  const roles = rolesQuery.data || [];
  const assignedRole = roles.find((r) => r.id === detail?.submission?.roleId);

  // Derive current answers from query + user edits without setState in effect
  const answers = useMemo(() => {
    const result: Record<string, unknown> = {};
    if (detail?.answers) {
      for (const ans of detail.answers) {
        result[ans.fieldId] = ans.value;
      }
    }
    return { ...result, ...edits };
  }, [detail, edits]);

  const handleFieldChange = useCallback((fieldId: string, val: unknown) => {
    setEdits((prev) => ({ ...prev, [fieldId]: val }));
  }, []);

  const isReadOnly = detail?.submission.status !== 'DRAFT';

  // Group fields by section
  const fieldsBySection = useMemo(() => {
    const map = new Map<string, FormField[]>();
    if (!detail?.fields) return map;
    for (const f of detail.fields) {
      const list = map.get(f.formSectionId) || [];
      list.push(f);
      map.set(f.formSectionId, list);
    }
    return map;
  }, [detail]);

  const handleSaveDraft = useCallback(() => {
    if (!detail) return;
    const answerEntries = Object.entries(answers).map(([fieldId, value]) => ({
      fieldId,
      value,
    }));

    saveDraftMutation.mutate(
      {
        memberId,
        expectedRevision: detail.submission.revision,
        answers: answerEntries,
      },
      {
        onSuccess: () => {
          toast.success('บันทึกฉบับร่างเรียบร้อยแล้ว');
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, 'ไม่สามารถบันทึกฉบับร่างได้'));
        },
      },
    );
  }, [detail, answers, memberId, saveDraftMutation]);

  const handleSubmit = useCallback(() => {
    if (!detail) return;

    // Validate required fields
    const missingFields = detail.fields.filter((field) => {
      if (!field.isRequired) return false;
      const val = answers[field.id];
      if (val === undefined || val === null || val === '') return true;
      return false;
    });

    if (missingFields.length > 0) {
      toast.error(
        `กรุณากรอกคำถามที่จำเป็นให้ครบถ้วน (${missingFields.length} ข้อที่ยังไม่ได้ตอบ)`,
      );
      return;
    }

    const answerEntries = Object.entries(answers).map(([fieldId, value]) => ({
      fieldId,
      value,
    }));

    saveDraftMutation.mutate(
      {
        memberId,
        expectedRevision: detail.submission.revision,
        answers: answerEntries,
      },
      {
        onSuccess: (updatedSub) => {
          submitMutation.mutate(
            {
              memberId,
              expectedRevision:
                updatedSub?.data?.revision ?? detail.submission.revision + 1,
            },
            {
              onSuccess: () => {
                toast.success('ส่งแบบฟอร์มเพื่อรอพิจารณาอนุมัติเรียบร้อยแล้ว');
                router.push('/company/forms/submissions');
              },
              onError: (err) => {
                toast.error(getErrorMessage(err, 'ไม่สามารถส่งแบบฟอร์มได้'));
              },
            },
          );
        },
        onError: (err) => {
          toast.error(
            getErrorMessage(err, 'ไม่สามารถบันทึกข้อมูลก่อนส่งแบบฟอร์มได้'),
          );
        },
      },
    );
  }, [detail, answers, memberId, saveDraftMutation, submitMutation, router]);

  const handleClone = useCallback(() => {
    if (!detail || !activeCompanyId || !currentMember) return;
    ui.alert.open({
      title: 'ยืนยันการคัดลอกเพื่อสร้างฉบับแก้ไข',
      description:
        'ระบบจะคัดลอกคำตอบทั้งหมดจากฉบับเดิมที่ถูกปฏิเสธ มาสร้างเป็นฉบับร่างใหม่ (Draft) เพื่อให้แก้ไขและส่งใหม่',
      confirmVariant: 'default',
      onConfirm: () => {
        cloneMutation.mutate(
          {
            id: submissionId,
            data: { memberId: currentMember.id },
          },
          {
            onSuccess: (res) => {
              ui.alert.close();
              const newSub = res?.data;
              if (newSub?.id) {
                toast.success('สร้างฉบับแก้ไขใหม่เรียบร้อยแล้ว');
                router.push(`/company/forms/submissions/${newSub.id}`);
              }
            },
            onError: (err) => {
              toast.error(getErrorMessage(err, 'ไม่สามารถคัดลอกแบบฟอร์มได้'));
            },
          },
        );
      },
    });
  }, [
    ui.alert,
    detail,
    activeCompanyId,
    currentMember,
    cloneMutation,
    submissionId,
    router,
  ]);

  const handleOpenReview = useCallback(() => {
    if (!detail || !activeCompanyId) return;
    ui.dialog.open({
      title: 'พิจารณาอนุมัติ/ปฏิเสธแบบฟอร์ม',
      description: `รหัสการบันทึก: #${submissionId.slice(0, 8)}`,
      size: 'md',
      children: (
        <FormSubmissionReviewDialog
          submissionId={submissionId}
          companyId={activeCompanyId}
          reviewerMemberId={currentMember?.id || ''}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, detail, activeCompanyId, submissionId, currentMember]);

  const isPageLoading =
    isCompanyLoading || !activeCompanyId || submissionQuery.isLoading;

  if (!isPageLoading && !detail) {
    return (
      <PageLayout
        pageId="companyFormSubmissionDetail"
        actions={
          <Link href="/company/forms/submissions">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              กลับหน้ารายการตรวจ
            </Button>
          </Link>
        }
      >
        <div className="py-16 text-center text-sm text-muted-foreground">
          ไม่พบข้อมูลแบบฟอร์มการบันทึกนี้ หรือคุณไม่มีสิทธิ์เข้าถึง
        </div>
      </PageLayout>
    );
  }

  const { submission, template, version, sections, review, contributors } =
    detail || {};
  const statusInfo = (submission?.status &&
    STATUS_CONFIG[submission.status]) || {
    label: submission?.status || 'UNKNOWN',
    variant: 'outline' as const,
  };

  return (
    <PageLayout
      pageId="companyFormSubmissionDetail"
      title={
        template?.name ? `แบบฟอร์ม: ${template.name}` : 'บันทึกแบบฟอร์มตรวจสอบ'
      }
      description={
        template?.description || 'กรอกข้อมูลและบันทึกผลการตรวจสอบตามแบบฟอร์ม'
      }
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลแบบฟอร์ม..."
      actions={
        <div className="flex items-center gap-2">
          <Link href="/company/forms/submissions">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              กลับหน้ารายการตรวจ
            </Button>
          </Link>

          {submission?.status === 'DRAFT' && (
            <>
              <ButtonLoading
                variant="outline"
                size="sm"
                className="gap-1.5"
                onPress={handleSaveDraft}
                isLoading={saveDraftMutation.isPending}
              >
                <Save className="size-4" />
                บันทึกฉบับร่าง
              </ButtonLoading>

              <ButtonLoading
                size="sm"
                className="gap-1.5"
                onPress={handleSubmit}
                isLoading={
                  submitMutation.isPending || saveDraftMutation.isPending
                }
              >
                <Send className="size-4" />
                ส่งแบบฟอร์ม
              </ButtonLoading>
            </>
          )}

          {submission?.status === 'REJECTED' && (
            <ButtonLoading
              size="sm"
              className="gap-1.5"
              onPress={handleClone}
              isLoading={cloneMutation.isPending}
            >
              <Copy className="size-4" />
              คัดลอกสร้างฉบับแก้ไข (Clone)
            </ButtonLoading>
          )}

          {submission?.status === 'SUBMITTED' && (
            <Button
              size="sm"
              variant="default"
              className="gap-1.5"
              onPress={handleOpenReview}
            >
              <FileCheck className="size-4" />
              พิจารณาผล (อนุมัติ/ปฏิเสธ)
            </Button>
          )}
        </div>
      }
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6 py-2">
        {/* Top Meta Card */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <FileText className="size-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {template?.name || 'แบบฟอร์มตรวจสอบ'}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {template?.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                <Badge
                  variant={statusInfo.variant}
                  className={statusInfo.className}
                >
                  {statusInfo.label}
                </Badge>
                {submission && (
                  <Badge variant="outline">Rev #{submission.revision}</Badge>
                )}
                {version && (
                  <Badge variant="secondary">v{version.version}</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 border-t border-border/40 mt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="size-3.5 text-primary" />
                <span>
                  บทบาทที่รับผิดชอบ:{' '}
                  <strong className="text-foreground">
                    {assignedRole?.name || 'สมาชิกทั่วไป'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                <span>
                  เริ่มบันทึก:{' '}
                  <strong className="text-foreground">
                    {submission?.startedAt
                      ? formatDate(submission.startedAt)
                      : '-'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                <span>
                  แก้ไขล่าสุด:{' '}
                  <strong className="text-foreground">
                    {submission?.updatedAt
                      ? formatDate(submission.updatedAt)
                      : '-'}
                  </strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Context Banners */}
        {/* 1. DRAFT Notice Banner */}
        {submission?.status === 'DRAFT' && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 text-amber-950 dark:text-amber-200 border border-amber-500/25 rounded-xl text-xs sm:text-sm">
            <FileText className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-amber-900 dark:text-amber-100">
                แบบฟอร์มฉบับร่าง (Draft)
              </span>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                กรอกข้อมูลตามหัวข้อด้านล่าง สามารถกดบันทึกฉบับร่างไว้ได้
                และเมื่อกรอกข้อมูลครบถ้วนแล้วกดส่งแบบฟอร์มเพื่อดำเนินการต่อไป
              </p>
            </div>
          </div>
        )}

        {/* 2. REJECTED Alert */}
        {submission?.status === 'REJECTED' && review && (
          <div className="flex items-start justify-between gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/25 rounded-xl text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  แบบฟอร์มนี้ได้รับการปฏิเสธ (Rejected)
                </span>
                {review.note && (
                  <p className="text-xs leading-relaxed">
                    เหตุผล: <strong>{review.note}</strong>
                  </p>
                )}
                {review.createdAt && (
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    ตรวจสอบเมื่อ {formatDateTime(review.createdAt)}
                  </span>
                )}
              </div>
            </div>
            <ButtonLoading
              size="sm"
              variant="destructive"
              className="shrink-0 gap-1.5"
              onPress={handleClone}
              isLoading={cloneMutation.isPending}
            >
              <Copy className="size-3.5" />
              คัดลอกสร้างฉบับแก้ไข
            </ButtonLoading>
          </div>
        )}

        {/* 3. SUBMITTED Banner */}
        {submission?.status === 'SUBMITTED' && (
          <div className="flex items-center justify-between gap-3 p-4 bg-blue-500/10 text-blue-900 dark:text-blue-200 border border-blue-500/25 rounded-xl text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-blue-600 shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold">
                  ส่งแบบฟอร์มเรียบร้อยแล้ว อยู่ระหว่างรอพิจารณาอนุมัติ
                </span>
                <span className="text-xs text-muted-foreground">
                  ส่งเมื่อ{' '}
                  {submission.submittedAt
                    ? formatDateTime(submission.submittedAt)
                    : '-'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
              onPress={handleOpenReview}
            >
              <FileCheck className="size-3.5 text-primary" />
              พิจารณาผล
            </Button>
          </div>
        )}

        {/* 4. APPROVED Banner */}
        {submission?.status === 'APPROVED' && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border border-emerald-500/25 rounded-xl text-xs sm:text-sm">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">
                แบบฟอร์มนี้ได้รับการอนุมัติเรียบร้อยแล้ว (Approved)
              </span>
              {review?.note && (
                <span className="text-xs text-emerald-800 dark:text-emerald-300">
                  หมายเหตุจากผู้อนุมัติ: {review.note}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Sections & Fields */}
        <div className="flex flex-col gap-6">
          {sections && sections.length > 0 ? (
            sections.map((section, sIdx) => {
              const sectionFields = fieldsBySection.get(section.id) || [];
              return (
                <Card key={section.id} className="border-border/70 shadow-xs">
                  <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold shrink-0">
                        {sIdx + 1}
                      </span>
                      <CardTitle className="text-base font-semibold">
                        {section.title}
                      </CardTitle>
                    </div>
                    {section.description && (
                      <CardDescription className="text-xs text-muted-foreground mt-1 ml-8.5">
                        {section.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="pt-5">
                    {sectionFields.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        ยังไม่มีคำถามในหมวดหมู่นี้
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {sectionFields.map((field) => (
                          <DynamicFieldRenderer
                            key={field.id}
                            field={field}
                            value={answers[field.id]}
                            onChange={(val) => handleFieldChange(field.id, val)}
                            disabled={isReadOnly}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-dashed border-border/80">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                แบบฟอร์มนี้ยังไม่มีหัวข้อคำถาม
              </CardContent>
            </Card>
          )}
        </div>

        {/* Floating Bottom Sticky Action Bar */}
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md shadow-lg">
          <Link href="/company/forms/submissions">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="size-4" />
              กลับหน้ารายการตรวจ
            </Button>
          </Link>

          {!isReadOnly ? (
            <div className="flex items-center gap-2">
              <ButtonLoading
                variant="outline"
                size="sm"
                onPress={handleSaveDraft}
                isLoading={saveDraftMutation.isPending}
                className="gap-1.5"
              >
                <Save className="size-4" />
                บันทึกฉบับร่าง
              </ButtonLoading>

              <ButtonLoading
                size="sm"
                onPress={handleSubmit}
                isLoading={
                  submitMutation.isPending || saveDraftMutation.isPending
                }
                className="gap-1.5"
              >
                <Send className="size-4" />
                ส่งแบบฟอร์ม
              </ButtonLoading>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {submission?.status === 'REJECTED' && (
                <ButtonLoading
                  size="sm"
                  onPress={handleClone}
                  isLoading={cloneMutation.isPending}
                  className="gap-1.5"
                >
                  <Copy className="size-4" />
                  คัดลอกสร้างฉบับแก้ไข (Clone)
                </ButtonLoading>
              )}
              {submission?.status === 'SUBMITTED' && (
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1.5"
                  onPress={handleOpenReview}
                >
                  <FileCheck className="size-4" />
                  พิจารณาผล (อนุมัติ/ปฏิเสธ)
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
