'use client';

import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { ClipboardCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { DateRangeField } from '@repo/ui/form';
import {
  useCompanyAttendanceLogsQueries,
  useCompanySchedulesQueries,
  useAssignedScheduleSlotsQueries,
} from '../../hooks/attendance-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import attendanceLogDataColumns from './attendance-log-data-columns';

interface AttendanceLogDataTableProps {
  companyId: string;
}

export default function AttendanceLogDataTable({
  companyId,
}: AttendanceLogDataTableProps) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]!;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0]!;

  const methods = useForm<{ range: { start: string; end: string } }>({
    defaultValues: {
      range: { start: firstDay, end: lastDay },
    },
  });

  const range = useWatch({ control: methods.control, name: 'range' });
  const startDate = range?.start || firstDay;
  const endDate = range?.end || lastDay;

  const logsQuery = useCompanyAttendanceLogsQueries(companyId, {
    startDate,
    endDate,
  });
  const membersQuery = useCompanyMembersQueries(companyId);
  const usersQuery = useUserListQueries();
  const schedulesQuery = useCompanySchedulesQueries(companyId);
  const slotsQuery = useAssignedScheduleSlotsQueries(schedulesQuery.data ?? []);

  const usersMap = useMemo(() => {
    return new Map((usersQuery.data || []).map((u) => [u.id, u]));
  }, [usersQuery.data]);

  const columns = useMemo(
    () =>
      attendanceLogDataColumns({
        members: membersQuery.data || [],
        usersMap,
        slots: slotsQuery.data,
      }),
    [membersQuery.data, usersMap, slotsQuery.data],
  );

  const isLoading =
    logsQuery.isLoading || membersQuery.isLoading || usersQuery.isLoading;
  const data = logsQuery.data || [];

  const presentCount = useMemo(
    () => data.filter((l) => l.status === 'present').length,
    [data],
  );
  const lateCount = useMemo(
    () => data.filter((l) => l.status === 'late').length,
    [data],
  );
  const absentExcusedCount = useMemo(
    () =>
      data.filter((l) => l.status === 'absent' || l.status === 'excused')
        .length,
    [data],
  );
  const onTimeRate = useMemo(
    () =>
      data.length > 0 ? Math.round((presentCount / data.length) * 100) : 100,
    [data.length, presentCount],
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardStatsGrid columns={4}>
        <MetricCard
          title="บันทึกทั้งหมด"
          value={`${data.length} รายการ`}
          icon={ClipboardCheck}
          description="การลงเวลาในช่วงวันที่เลือก"
        />
        <MetricCard
          title="ตรงเวลา (Present)"
          value={`${presentCount} ครั้ง`}
          icon={CheckCircle2}
          trend={{
            value: `${onTimeRate}%`,
            isPositive: onTimeRate >= 80,
            label: 'อัตราตรงเวลา',
          }}
          description="เข้างานตรงตามรอบเวลา"
        />
        <MetricCard
          title="มาสาย (Late)"
          value={`${lateCount} ครั้ง`}
          icon={Clock}
          description="เข้างานช้ากว่าเวลาที่กำหนด"
        />
        <MetricCard
          title="ขาด/ลา (Absent/Excused)"
          value={`${absentExcusedCount} ครั้ง`}
          icon={AlertCircle}
          description="ขาดงานหรือได้รับการอนุมัติการลา"
        />
      </DashboardStatsGrid>

      <div className="flex flex-wrap items-center gap-4 bg-muted/40 p-3 rounded-lg border">
        <div className="w-72">
          <DateRangeField
            name="range"
            label="ช่วงวันที่ลงเวลา"
            control={methods.control}
            valueFormat="string"
          />
        </div>
      </div>

      <DataTable data={data} columns={columns} isLoading={isLoading} />
    </div>
  );
}
