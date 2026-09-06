'use client';

import React, { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { LeaveRequestStatus } from '@repo/domains/schema/leave';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { DateRangeField } from '@repo/ui/form';
import {
  useCompanyLeaveRequestsQueries,
  useCompanyLeaveTypesQueries,
} from '../../hooks/leave-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import leaveRequestDataColumns from './leave-request-data-columns';

interface LeaveRequestDataTableProps {
  companyId: string;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอพิจารณา (Pending)' },
  { value: 'approved', label: 'อนุมัติแล้ว (Approved)' },
  { value: 'rejected', label: 'ปฏิเสธ (Rejected)' },
  { value: 'cancelled', label: 'ยกเลิกแล้ว (Cancelled)' },
];

export default function LeaveRequestDataTable({
  companyId,
}: LeaveRequestDataTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const methods = useForm<{
    range: { start?: string; end?: string } | null;
  }>({
    defaultValues: { range: null },
  });

  const range = useWatch({ control: methods.control, name: 'range' });

  const statusParam =
    selectedStatus === 'ALL'
      ? undefined
      : (selectedStatus as LeaveRequestStatus);

  const requestsQuery = useCompanyLeaveRequestsQueries(companyId, {
    status: statusParam,
    startDate: range?.start,
    endDate: range?.end,
  });
  const typesQuery = useCompanyLeaveTypesQueries(companyId);
  const membersQuery = useCompanyMembersQueries(companyId);
  const usersQuery = useUserListQueries();

  const usersMap = useMemo(() => {
    return new Map((usersQuery.data || []).map((u) => [u.id, u]));
  }, [usersQuery.data]);

  const columns = useMemo(
    () =>
      leaveRequestDataColumns({
        companyId,
        types: typesQuery.data || [],
        members: membersQuery.data || [],
        usersMap,
      }),
    [companyId, typesQuery.data, membersQuery.data, usersMap],
  );

  const isLoading =
    requestsQuery.isLoading ||
    typesQuery.isLoading ||
    membersQuery.isLoading ||
    usersQuery.isLoading;
  const data = requestsQuery.data || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            กรองตามสถานะ:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => {
              const isSelected = selectedStatus === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setSelectedStatus(f.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-72">
          <DateRangeField
            name="range"
            placeholder="กรองตามช่วงวันที่ลา..."
            control={methods.control}
            valueFormat="string"
          />
        </div>
      </div>

      <DataTable data={data} columns={columns} isLoading={isLoading} />
    </div>
  );
}
