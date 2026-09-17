'use client';

import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  FileCheck2,
} from 'lucide-react';
import PageLayout from '@/shared/components/layouts/page-layout';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useFormSubmissionsQueries } from '../hooks/form-queries';
import FormSubmissionDataTable from '../components/submission/form-submission-data-table';
import type { FormSubmissionItem } from '@repo/client';

export default function FormSubmissionsView() {
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();

  const submissionsQuery = useFormSubmissionsQueries(
    activeCompanyId ? { companyId: activeCompanyId } : undefined,
  );

  const submissions: FormSubmissionItem[] = useMemo(
    () => (submissionsQuery.data || []) as FormSubmissionItem[],
    [submissionsQuery.data],
  );

  const approvedCount = useMemo(
    () => submissions.filter((s) => s.finalReviewAction === 'APPROVE').length,
    [submissions],
  );

  const returnedCount = useMemo(
    () => submissions.filter((s) => s.finalReviewAction === 'RETURN').length,
    [submissions],
  );

  const inReviewCount = useMemo(
    () =>
      submissions.filter(
        (s) => Boolean(s.submittedAt) && !s.finalReviewAction,
      ).length,
    [submissions],
  );

  const draftCount = useMemo(
    () => submissions.filter((s) => !s.submittedAt).length,
    [submissions],
  );

  const isPageLoading =
    isCompanyLoading || !activeCompanyId || submissionsQuery.isLoading;

  return (
    <PageLayout
      pageId="companyFormSubmissions"
      title="ประวัติและผลการตรวจ"
      description="ประวัติผลการตรวจที่เคยส่งแล้วและการพิจารณาอนุมัติ"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดประวัติผลการตรวจ..."
    >
      <div className="flex flex-col gap-6">
        {/* Metric Cards Grid */}
        <DashboardStatsGrid columns={4}>
          <MetricCard
            title="ตรวจอนุมัติแล้ว"
            value={`${approvedCount} ฉบับ`}
            icon={CheckCircle2}
            description="ผลการตรวจผ่านเกณฑ์เรียบร้อย"
          />
          <MetricCard
            title="รอตรวจรับ"
            value={`${inReviewCount} ฉบับ`}
            icon={FileCheck2}
            description="รอหัวหน้างานหรือผู้ตรวจอนุมัติ"
          />
          <MetricCard
            title="ส่งกลับแก้ไข"
            value={`${returnedCount} ฉบับ`}
            icon={RotateCcw}
            description="จำเป็นต้องแก้ไขคำตอบและส่งใหม่"
          />
          <MetricCard
            title="ฉบับร่างค้างส่ง"
            value={`${draftCount} ฉบับ`}
            icon={Clock}
            description="แบบฟอร์มที่อยู่ระหว่างการบันทึก"
          />
        </DashboardStatsGrid>

        {/* History Table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                ตารางประวัติการตรวจและผลคำตอบทั้งหมด
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                ตรวจสอบสถานะแบบฟอร์มที่ส่งแล้ว การอนุมัติ และลำดับฉบับย้อนหลัง
              </p>
            </div>
          </div>

          <FormSubmissionDataTable companyId={activeCompanyId || ''} />
        </div>
      </div>
    </PageLayout>
  );
}
