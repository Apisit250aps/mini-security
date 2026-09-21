'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { toast } from '@repo/ui/components/sonner';
import {
  CalendarClock,
  CheckCircle2,
  FileEdit,
  PauseCircle,
  Plus,
  Zap,
} from 'lucide-react';
import { useFormPlansQueries } from '../hooks/form-queries';
import { useFormOccurrencesOpen } from '../hooks/form-mutations';
import FormPlanDataTable from '../components/plan/form-plan-data-table';
import { useOverlay } from '@repo/ui/hooks';

export default function FormPlansView() {
  const { activeOrganizationId, isLoading: isOrganizationLoading } =
    useActiveOrganization();
  const plansQuery = useFormPlansQueries(activeOrganizationId || '');
  const openOccurrencesMutation = useFormOccurrencesOpen(
    activeOrganizationId || '',
  );
  const ui = useOverlay();

  const plans = useMemo(() => plansQuery.data || [], [plansQuery.data]);

  const activeCount = useMemo(
    () => plans.filter((p) => p.effectiveFrom && !p.effectiveUntil).length,
    [plans],
  );

  const draftCount = useMemo(
    () => plans.filter((p) => !p.effectiveFrom).length,
    [plans],
  );

  const pausedCount = useMemo(
    () => plans.filter((p) => Boolean(p.effectiveUntil)).length,
    [plans],
  );

  const handleTriggerOccurrences = () => {
    if (!activeOrganizationId) return;

    ui.alert.open({
      title: 'ประมวลผลเปิดรอบงานที่ถึงเวลา',
      description:
        'ระบบจะตรวจสอบและสร้างรอบงาน (Occurrences) และงานที่ได้รับมอบหมาย (Assignments) สำหรับทุกแผนงานที่เปิดใช้งานในบริษัทที่มีรอบถึงเวลาเปิด ณ ตอนนี้ คุณต้องการดำเนินการหรือไม่?',
      onConfirm: () => {
        openOccurrencesMutation.mutate(
          { organizationId: activeOrganizationId },
          {
            onSuccess: (res) => {
              const count = res?.data?.length || 0;
              if (count > 0) {
                toast.success(`ประมวลผลสำเร็จ เปิดรอบงานใหม่แล้ว ${count} รอบ`);
              } else {
                toast.info('ไม่มีรอบงานใหม่ที่ถึงเวลาเปิดในขณะนี้');
              }
              ui.alert.close();
            },
          },
        );
      },
    });
  };

  const isPageLoading = isOrganizationLoading || !activeOrganizationId;

  return (
    <PageLayout
      pageId="organizationFormPlans"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลแผนการตรวจ..."
      actions={
        !isPageLoading ? (
          <div className="flex items-center gap-2">
            <ButtonLoading
              variant="outline"
              size="sm"
              onPress={handleTriggerOccurrences}
              isLoading={openOccurrencesMutation.isPending}
            >
              <Zap data-icon="inline-start" className="text-amber-500" />
              ประมวลผลรอบที่ถึงเวลา
            </ButtonLoading>
            <Link href="/organization/forms/plans/new">
              <Button size="sm">
                <Plus data-icon="inline-start" />
                สร้างแผนการตรวจใหม่
              </Button>
            </Link>
          </div>
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        <DashboardStatsGrid columns={4}>
          <MetricCard
            title="แผนการตรวจทั้งหมด"
            value={`${plans.length} แผน`}
            icon={CalendarClock}
            description="แผนงานตรวจความปลอดภัยและรอบการทำงาน"
          />
          <MetricCard
            title="เปิดใช้งาน (Active)"
            value={`${activeCount} แผน`}
            icon={CheckCircle2}
            trend={{
              value: `${activeCount}`,
              isPositive: true,
              label: 'กำลังทำงาน',
            }}
            description="แผนที่มีผลบังคับใช้และพร้อมเปิดรอบตามกำหนด"
          />
          <MetricCard
            title="ฉบับร่าง (Draft)"
            value={`${draftCount} แผน`}
            icon={FileEdit}
            description="แผนที่บันทึกแล้วแต่ยังไม่ได้เปิดใช้งาน"
          />
          <MetricCard
            title="พักแผน (Paused)"
            value={`${pausedCount} แผน`}
            icon={PauseCircle}
            description="แผนที่หยุดเปิดรอบงานชั่วคราว"
          />
        </DashboardStatsGrid>

        <FormPlanDataTable organizationId={activeOrganizationId || ''} />
      </div>
    </PageLayout>
  );
}
