'use client';

import React, { useMemo, useState } from 'react';
import { leaveRequestColumns } from './leave-request-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useLeaveRequestsQueries } from '../../hooks/attendance-queries';
import { Button } from '@repo/ui/components/button';

const FILTER_BUTTONS = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'PENDING', label: 'รอพิจารณา' },
  { value: 'APPROVED', label: 'อนุมัติแล้ว' },
  { value: 'REJECTED', label: 'ไม่อนุมัติ' },
  { value: 'CANCELLED', label: 'ยกเลิกแล้ว' },
];

export default function LeaveRequestTable({
  companyId,
}: {
  companyId: string;
}) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data = [], isLoading } = useLeaveRequestsQueries(companyId);

  const filteredData = useMemo(() => {
    if (statusFilter === 'ALL') return data;
    return data.filter((l) => l.status === statusFilter);
  }, [data, statusFilter]);

  const columns = useMemo(() => leaveRequestColumns(), []);

  const table = useMemo(
    () => ({
      data: filteredData,
      columns,
      isLoading,
    }),
    [filteredData, columns, isLoading],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground mr-1">
          กรองสถานะ:
        </span>
        {FILTER_BUTTONS.map((btn) => (
          <Button
            key={btn.value}
            variant={statusFilter === btn.value ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onPress={() => setStatusFilter(btn.value)}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      <DataTable {...table} />
    </div>
  );
}
