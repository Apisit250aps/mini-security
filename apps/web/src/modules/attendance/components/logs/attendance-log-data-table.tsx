'use client';

import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { DateRangeField } from '@repo/ui/form';
import { useCompanyAttendanceLogsQueries } from '../../hooks/attendance-queries';
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

  const usersMap = useMemo(() => {
    return new Map((usersQuery.data || []).map((u) => [u.id, u]));
  }, [usersQuery.data]);

  const columns = useMemo(
    () =>
      attendanceLogDataColumns({
        members: membersQuery.data || [],
        usersMap,
      }),
    [membersQuery.data, usersMap],
  );

  const isLoading =
    logsQuery.isLoading || membersQuery.isLoading || usersQuery.isLoading;
  const data = logsQuery.data || [];

  return (
    <div className="flex flex-col gap-4">
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
