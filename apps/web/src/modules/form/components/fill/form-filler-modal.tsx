'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { toast } from '@repo/ui/components/sonner';
import { AlertCircle, CheckCircle2, Save, Send } from 'lucide-react';
import { useFormSubmissionQueries } from '../../hooks/form-queries';
import {
  useFormSubmissionSaveDraft,
  useFormSubmissionSubmit,
} from '../../hooks/form-mutations';
import type { FormField } from '@repo/domains/entities';
import DynamicFieldRenderer from './dynamic-field-renderer';

interface FormFillerModalProps {
  submissionId: string;
  companyId: string;
  memberId: string;
  onClose: () => void;
}

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  DRAFT: { label: 'ฉบับร่าง (Draft)', variant: 'secondary' },
  SUBMITTED: { label: 'ส่งแล้ว รอพิจารณา (Submitted)', variant: 'default' },
  APPROVED: { label: 'อนุมัติแล้ว (Approved)', variant: 'default' },
  REJECTED: { label: 'ไม่อนุมัติ (Rejected)', variant: 'destructive' },
};

export default function FormFillerModal({
  submissionId,
  companyId,
  memberId,
  onClose,
}: FormFillerModalProps) {
  const { data: detail, isLoading } = useFormSubmissionQueries(submissionId);

  const saveDraftMutation = useFormSubmissionSaveDraft(submissionId, companyId);
  const submitMutation = useFormSubmissionSubmit(submissionId, companyId);

  const [edits, setEdits] = useState<Record<string, unknown>>({});

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

    saveDraftMutation.mutate({
      memberId,
      expectedRevision: detail.submission.revision,
      answers: answerEntries,
    });
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

    // First save draft with current answers, then submit
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
                onClose();
              },
            },
          );
        },
      },
    );
  }, [detail, answers, memberId, saveDraftMutation, submitMutation, onClose]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        กำลังโหลดข้อมูลแบบฟอร์ม...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        ไม่พบข้อมูลแบบฟอร์มการบันทึกนี้
      </div>
    );
  }

  const { submission, template, version, sections, review } = detail;
  const statusInfo = STATUS_MAP[submission.status] || {
    label: submission.status,
    variant: 'outline',
  };

  return (
    <div className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto pr-1">
      {/* Header Info */}
      <div className="flex flex-col gap-2 border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">
            {template?.name || 'แบบฟอร์มบันทึกข้อมูล'}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <Badge variant="outline">Rev #{submission.revision}</Badge>
            {version && <Badge variant="secondary">v{version.version}</Badge>}
          </div>
        </div>

        {template?.description && (
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
        )}

        {/* Rejection Alert if rejected */}
        {submission.status === 'REJECTED' && review && (
          <div className="flex items-start gap-3 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">
                แบบฟอร์มนี้ได้รับการปฏิเสธ (Rejected)
              </span>
              {review.note && <span>เหตุผล: {review.note}</span>}
            </div>
          </div>
        )}

        {/* Approval banner if approved */}
        {submission.status === 'APPROVED' && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>แบบฟอร์มนี้ได้รับการอนุมัติเรียบร้อยแล้ว</span>
          </div>
        )}
      </div>

      {/* Dynamic Sections & Fields */}
      <div className="flex flex-col gap-6">
        {sections.map((section, sIdx) => {
          const sectionFields = fieldsBySection.get(section.id) || [];
          return (
            <div key={section.id} className="flex flex-col gap-3">
              <div className="border-b pb-1.5">
                <h4 className="font-semibold text-sm">
                  {sIdx + 1}. {section.title}
                </h4>
                {section.description && (
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
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
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onPress={onClose}>
          {isReadOnly ? 'ปิด' : 'ยกเลิก'}
        </Button>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <ButtonLoading
              variant="outline"
              onPress={handleSaveDraft}
              isLoading={saveDraftMutation.isPending}
            >
              <Save className="w-4 h-4 mr-1.5" />
              บันทึกฉบับร่าง
            </ButtonLoading>

            <ButtonLoading
              onPress={handleSubmit}
              isLoading={
                submitMutation.isPending || saveDraftMutation.isPending
              }
            >
              <Send className="w-4 h-4 mr-1.5" />
              ส่งแบบฟอร์ม
            </ButtonLoading>
          </div>
        )}
      </div>
    </div>
  );
}
