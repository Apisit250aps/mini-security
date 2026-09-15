'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { toast } from '@repo/ui/components/sonner';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useFormSubmissionQueries, useReviewDetailQueries } from '../hooks/form-queries';
import { useFormReviewFinalize } from '../hooks/form-mutations';
import { Textarea } from '@repo/ui/components/textarea';
import Link from 'next/link';
import { getErrorMessage } from '@/shared/utils';

export default function FormReviewView({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  
  const [note, setNote] = useState('');
  
  const submissionQuery = useFormSubmissionQueries(submissionId);
  const reviewQuery = useReviewDetailQueries(submissionId);
  
  const finalizeMutation = useFormReviewFinalize(activeCompanyId || '');

  const handleFinalize = (action: 'APPROVE' | 'RETURN') => {
    if (action === 'RETURN' && !note.trim()) {
      toast.error('กรุณาระบุหมายเหตุการตีกลับ');
      return;
    }
    
    finalizeMutation.mutate(
      {
        submissionId,
        data: {
          action,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(action === 'APPROVE' ? 'อนุมัติแบบฟอร์มเรียบร้อย' : 'ส่งกลับให้แก้ไขเรียบร้อย');
          router.push('/company/forms/reviews');
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, 'เกิดข้อผิดพลาดในการบันทึกผลการตรวจ'));
        },
      }
    );
  };

  const isPageLoading = isCompanyLoading || !activeCompanyId || submissionQuery.isLoading;
  const detail = submissionQuery.data;

  return (
    <PageLayout
      pageId="companyFormReview"
      title={`ตรวจแบบฟอร์ม: ${detail?.template?.name || 'กำลังโหลด...'}`}
      description="ตรวจสอบคำตอบและพิจารณาอนุมัติ"
      isLoading={isPageLoading}
      actions={
        <Link href="/company/forms/reviews">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
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
          {detail?.sections?.map((section) => (
            <div key={section.id} className="p-5 border rounded-xl bg-card">
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <div className="space-y-4">
                {detail.fields?.filter(f => f.formSectionId === section.id).map(field => {
                  const answer = detail.answers?.find(a => a.fieldId === field.id);
                  return (
                    <div key={field.id} className="p-3 border rounded bg-muted/30">
                      <p className="text-sm font-medium">{field.label}</p>
                      <p className="text-sm text-muted-foreground mt-1">{String(answer?.value ?? '-')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="md:col-span-1">
          <div className="sticky top-20 p-4 border rounded-xl bg-card space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <FileCheck className="size-4 text-primary" />
              การตัดสินใจ
            </h3>
            
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">หมายเหตุ (จำเป็นเมื่อส่งกลับแก้ไข)</label>
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
                onPress={() => handleFinalize('APPROVE')}
                isLoading={finalizeMutation.isPending && finalizeMutation.variables?.data.action === 'APPROVE'}
              >
                <CheckCircle2 className="size-4" />
                อนุมัติผ่าน
              </ButtonLoading>
              
              <ButtonLoading 
                className="w-full gap-2" 
                variant="destructive"
                onPress={() => handleFinalize('RETURN')}
                isLoading={finalizeMutation.isPending && finalizeMutation.variables?.data.action === 'RETURN'}
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
