'use client';

import React, { useMemo, useState } from 'react';
import { attendanceRecordColumns } from './attendance-record-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useAttendanceRecordsQueries } from '../../hooks/attendance-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import { Button } from '@repo/ui/components/button';
import type { CompanyMember, User } from '@repo/domains/entities';

const FILTER_BUTTONS = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'APPROVED', label: 'อนุมัติแล้ว' },
  { value: 'PENDING', label: 'รอตรวจสอบ' },
  { value: 'LATE', label: 'มาสาย' },
  { value: 'ABSENT', label: 'ขาดงาน' },
  { value: 'REJECTED', label: 'ปฏิเสธ' },
];

export default function AttendanceRecordTable({
  companyId,
}: {
  companyId: string;
}) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data = [], isLoading: isRecordsLoading } =
    useAttendanceRecordsQueries(companyId);
  const { data: members = [], isLoading: isMembersLoading } =
    useCompanyMembersQueries(companyId);
  const { data: users = [], isLoading: isUsersLoading } = useUserListQueries();

  const membersMap = useMemo(() => {
    const map = new Map<string, CompanyMember>();
    for (const m of members) {
      map.set(m.id, m);
    }
    return map;
  }, [members]);

  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of users) {
      map.set(u.id, u);
    }
    return map;
  }, [users]);

  const filteredData = useMemo(() => {
    if (statusFilter === 'ALL') return data;
    return data.filter((r) => r.status === statusFilter);
  }, [data, statusFilter]);

  const columns = useMemo(
    () => attendanceRecordColumns({ membersMap, usersMap }),
    [membersMap, usersMap],
  );

  const isLoading = isRecordsLoading || isMembersLoading || isUsersLoading;

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
