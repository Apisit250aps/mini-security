'use client';

import React, { useMemo } from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { CalendarClock, CheckCircle2, Users } from 'lucide-react';
import { useCompanySchedulesQueries } from '../hooks/attendance-queries';
import ScheduleDataTable from '../components/schedules/schedule-data-table';
import ScheduleCreateAction from '../components/schedules/schedule-create-action';

export default function CompanyAttendanceScheduleView() {
  const { activeCompanyId, isLoading } = useActiveCompany();
  const schedulesQuery = useCompanySchedulesQueries(activeCompanyId || '');
  const schedules = useMemo(
    () => schedulesQuery.data || [],
    [schedulesQuery.data],
  );

  const activeCount = useMemo(
    () => schedules.filter((s) => s.isActive).length,
    [schedules],
  );
  const totalAssignedRoles = useMemo(
    () => schedules.reduce((acc, s) => acc + (s.roleIds?.length ?? 0), 0),
    [schedules],
  );

  const isPageLoading = isLoading || !activeCompanyId;

  return (
    <PageLayout
      pageId="companyAttendanceSchedule"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <ScheduleCreateAction companyId={activeCompanyId} />
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        <DashboardStatsGrid columns={3}>
          <MetricCard
            title="ตารางเวลาทั้งหมด"
            value={`${schedules.length} ตาราง`}
            icon={CalendarClock}
            description="รอบเวลาการลงชื่อเข้างานที่กำหนด"
          />
          <MetricCard
            title="เปิดใช้งาน (Active)"
            value={`${activeCount} ตาราง`}
            icon={CheckCircle2}
            trend={{
              value: `${activeCount}`,
              isPositive: true,
              label: 'กำลังใช้งาน',
            }}
            description="ตารางกะที่เปิดให้ลงเวลาในระบบ"
          />
          <MetricCard
            title="บทบาทที่ผูกตาราง (Roles)"
            value={`${totalAssignedRoles} ตำแหน่ง`}
            icon={Users}
            description="การมอบหมายตารางตามบทบาทงาน"
          />
        </DashboardStatsGrid>

        <ScheduleDataTable companyId={activeCompanyId} />
      </div>
    </PageLayout>
  );
}
