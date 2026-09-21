'use client';

import React, { useMemo } from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { CalendarClock, CheckCircle2, Users } from 'lucide-react';
import { useGetCheckInSchedulesByOrganization } from '../hooks/attendance-queries';
import ScheduleDataTable from '../components/schedules/schedule-data-table';
import ScheduleCreateAction from '../components/schedules/schedule-create-action';

export default function OrganizationAttendanceScheduleView() {
  const { activeOrganizationId, isLoading } = useActiveOrganization();
  const schedulesQuery = useGetCheckInSchedulesByOrganization(
    activeOrganizationId || '',
  );
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

  const isPageLoading = isLoading || !activeOrganizationId;

  return (
    <PageLayout
      pageId="organizationAttendanceSchedule"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <ScheduleCreateAction organizationId={activeOrganizationId} />
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

        <ScheduleDataTable organizationId={activeOrganizationId} />
      </div>
    </PageLayout>
  );
}
