'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { toast } from '@repo/ui/components/sonner';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import {
  useFormSubmissionQueries,
  useReviewDetailQueries,
} from '../hooks/form-queries';
import {
  useFormReviewFinalize,
  useFormReviewRecordAnswer,
  useFormReviewRecordSection,
} from '../hooks/form-mutations';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import { Textarea } from '@repo/ui/components/textarea';
import Link from 'next/link';
import { getErrorMessage } from '@/shared/utils';

export default function FormReviewView({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  const { activeOrganizationId, isLoading: isOrganizationLoading } =
    useActiveOrganization();

  const [note, setNote] = useState('');
  const [answerNotes, setAnswerNotes] = useState<Record<string, string>>({});
  const { hasPermission, isSuperAdmin } = usePermission();
  const answerMutation = useFormReviewRecordAnswer(activeOrganizationId || '');
  const sectionMutation = useFormReviewRecordSection(
    activeOrganizationId || '',
  );

  const submissionQuery = useFormSubmissionQueries(submissionId);
  const reviewQuery = useReviewDetailQueries(submissionId);

  const finalizeMutation = useFormReviewFinalize(activeOrganizationId || '');

  const handleFinalize = (action: 'APPROVE' | 'RETURN') => {
    if (!submissionQuery.data) return;
    if (action === 'RETURN' && !note.trim()) {
      toast.error('กรุณาระบุหมายเหตุการตีกลับ');
      return;
    }

    finalizeMutation.mutate(
      {
        submissionId,
        data: {
          action,
          expectedRevision: submissionQuery.data.submission.revision,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            action === 'APPROVE'
              ? 'อนุมัติแบบฟอร์มเรียบร้อย'
              : 'ส่งกลับให้แก้ไขเรียบร้อย',
          );
          router.push('/organization/forms/reviews');
        },
        onError: (err) => {
          toast.error(
            getErrorMessage(err, 'เกิดข้อผิดพลาดในการบันทึกผลการตรวจ'),
          );
        },
      },
    );
  };

  const isPageLoading =
    isOrganizationLoading || !activeOrganizationId || submissionQuery.isLoading;
  const detail = submissionQuery.data;
  const entries = reviewQuery.data ?? [];
  const superseded = new Set(entries.map((e) => e.supersedesEntryId));
  const heads = entries.filter((e) => !superseded.has(e.id));
  const finalDecision = heads.find((e) => !e.answerId);
  const needsChanges = heads.some((e) => e.action === 'NEEDS_CHANGES');
  const busy =
    answerMutation.isPending ||
    sectionMutation.isPending ||
    finalizeMutation.isPending ||
    reviewQuery.isLoading ||
    submissionQuery.isFetching;
  const canReviewAnswer = isSuperAdmin || hasPermission('form_review:answer');
  const canReviewSection = isSuperAdmin || hasPermission('form_review:section');
  const canFinalize = isSuperAdmin || hasPermission('form_review:finalize');

  const reviewAnswer = (answerId: string, action: 'PASS' | 'NEEDS_CHANGES') => {
    if (!detail || busy || finalDecision) return;
    const answerNote = answerNotes[answerId]?.trim();
    if (action === 'NEEDS_CHANGES' && !answerNote) {
      toast.error('กรุณาระบุสิ่งที่ต้องแก้ไขในข้อนี้');
      return;
    }
    const head = heads.find((e) => e.answerId === answerId);
    answerMutation.mutate({
      submissionId,
      answerId,
      data: {
        action,
        note: answerNote,
        supersedesEntryId: head?.id,
        expectedRevision: detail.submission.revision,
      },
    });
  };

  return (
    <PageLayout
      pageId="organizationFormReview"
      title={`ตรวจแบบฟอร์ม: ${detail?.template?.name || 'กำลังโหลด...'}`}
      description="ตรวจสอบคำตอบและพิจารณาอนุมัติ"
      isLoading={isPageLoading}
      actions={
        <Link href="/organization/forms/reviews">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="size-4" />
            กลับคิวตรวจ
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 border rounded-xl bg-card">
            <h3 className="font-medium mb-3">สรุปความคืบหน้า</h3>
            <div className="space-y-2 text-sm">
              <p>ผู้ส่ง: {detail?.submission?.submittedBy || '-'}</p>
              <p>รอบที่: {detail?.submission?.revision || 1}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {detail?.sections?.map((section) => {
            const fields = detail.fields.filter(
              (f) => f.formSectionId === section.id,
            );
            const results = fields.map((f) =>
              heads.find(
                (e) =>
                  e.answerId ===
                  detail.answers.find((a) => a.fieldId === f.id)?.id,
              ),
            );
            const status = results.some((r) => r?.action === 'NEEDS_CHANGES')
              ? 'ต้องแก้ไข'
              : results.length > 0 && results.every((r) => r?.action === 'PASS')
                ? 'ผ่านทั้งหมด'
                : 'รอตรวจ';
            return (
              <div key={section.id} className="p-5 border rounded-xl bg-card">
                <h4 className="font-semibold mb-2">
                  {section.title} · {status}
                </h4>
                {canReviewSection && !finalDecision && (
                  <Button
                    className="mb-4"
                    size="sm"
                    variant="outline"
                    isDisabled={busy || !fields.length}
                    onClick={() =>
                      sectionMutation.mutate({
                        submissionId,
                        sectionId: section.id,
                        data: {
                          action: 'PASS',
                          expectedRevision: detail.submission.revision,
                        },
                      })
                    }
                  >
                    ผ่านทุกข้อในหมวดนี้
                  </Button>
                )}
                <div className="space-y-4">
                  {detail.fields
                    ?.filter((f) => f.formSectionId === section.id)
                    .map((field) => {
                      const answer = detail.answers?.find(
                        (a) => a.fieldId === field.id,
                      );
                      const head = heads.find((e) => e.answerId === answer?.id);
                      return (
                        <div
                          key={field.id}
                          className="p-3 border rounded bg-muted/30"
                        >
                          <p className="text-sm font-medium">{field.label}</p>
                          <p className="text-xs mt-1">
                            {head?.action === 'PASS'
                              ? 'ผ่าน'
                              : head?.action === 'NEEDS_CHANGES'
                                ? 'ต้องแก้ไข'
                                : 'ยังไม่ตรวจ'}
                          </p>
                          {head?.note && <p className="text-sm">{head.note}</p>}
                          {canReviewAnswer && answer && !finalDecision && (
                            <div className="space-y-2 my-2">
                              <Textarea
                                aria-label={`หมายเหตุสำหรับ ${field.label}`}
                                placeholder="หมายเหตุรายข้อ"
                                value={answerNotes[answer.id] ?? ''}
                                onChange={(e) =>
                                  setAnswerNotes((notes) => ({
                                    ...notes,
                                    [answer.id]: e.target.value,
                                  }))
                                }
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  isDisabled={busy}
                                  onClick={() =>
                                    reviewAnswer(answer.id, 'PASS')
                                  }
                                >
                                  ผ่าน
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  isDisabled={busy}
                                  onClick={() =>
                                    reviewAnswer(answer.id, 'NEEDS_CHANGES')
                                  }
                                >
                                  ต้องแก้ไข
                                </Button>
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {String(answer?.value ?? '-')}
                          </p>
                          {detail.attachments
                            .filter(
                              (attachment) =>
                                attachment.answerId === answer?.id,
                            )
                            .map((attachment) => (
                              <a
                                key={attachment.id}
                                className="block text-sm underline"
                                href={`/api/forms/attachments/${attachment.id}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {attachment.originalName}
                              </a>
                            ))}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-20 p-4 border rounded-xl bg-card space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <FileCheck className="size-4 text-primary" />
              การตัดสินใจ
            </h3>

            {finalDecision && (
              <p className="text-sm">ผลตัดสิน: {finalDecision.action}</p>
            )}
            {needsChanges && (
              <p className="text-sm text-destructive">
                ยังมีข้อที่ต้องแก้ไข จึงยังอนุมัติไม่ได้
              </p>
            )}
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">
                  หมายเหตุ (จำเป็นเมื่อส่งกลับแก้ไข)
                </label>
                <Textarea
                  placeholder="ระบุสิ่งที่ต้องแก้ไข..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
              </div>

              <ButtonLoading
                className="w-full gap-2"
                variant="default"
                isDisabled={
                  busy || !!finalDecision || needsChanges || !canFinalize
                }
                onPress={() => handleFinalize('APPROVE')}
                isLoading={
                  finalizeMutation.isPending &&
                  finalizeMutation.variables?.data.action === 'APPROVE'
                }
              >
                <CheckCircle2 className="size-4" />
                อนุมัติผ่าน
              </ButtonLoading>

              <ButtonLoading
                className="w-full gap-2"
                variant="destructive"
                isDisabled={busy || !!finalDecision || !canFinalize}
                onPress={() => handleFinalize('RETURN')}
                isLoading={
                  finalizeMutation.isPending &&
                  finalizeMutation.variables?.data.action === 'RETURN'
                }
              >
                <AlertCircle className="size-4" />
                ส่งกลับให้แก้ไข
              </ButtonLoading>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
