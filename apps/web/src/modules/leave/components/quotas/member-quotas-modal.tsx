'use client';

import React, { useMemo, useState } from 'react';
import type { OrganizationMember, LeaveQuota } from '@repo/client';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Button } from '@repo/ui/components/button';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { Plus } from 'lucide-react';
import {
  useMemberLeaveQuotasQueries,
  useOrganizationLeaveTypesQueries,
} from '../../hooks/leave-queries';
import {
  useLeaveQuotaCreate,
  useLeaveQuotaUpdate,
} from '../../hooks/leave-mutations';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import QuotaForm, { QuotaFormValues } from './quota-form';

interface MemberQuotasModalProps {
  member: OrganizationMember;
  organizationId?: string;
  userName?: string;
}

export default function MemberQuotasModal({
  member,
  organizationId,
  userName,
}: MemberQuotasModalProps) {
  const targetOrgId = organizationId || '';
  const ui = useOverlay();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const quotasQuery = useMemberLeaveQuotasQueries(member.id, selectedYear);
  const typesQuery = useOrganizationLeaveTypesQueries(targetOrgId);
  const usersQuery = useUserListQueries();

  const user = useMemo(() => {
    return (usersQuery.data || []).find((u) => u.id === member.userId);
  }, [usersQuery.data, member.userId]);

  const memberDisplayName = useMemo(() => {
    if (userName) return userName;
    if (user) return `${user.name} (${user.email})`;
    return `พนักงาน #${member.id.slice(0, 6)}`;
  }, [userName, user, member.id]);

  const createMutation = useLeaveQuotaCreate(member.id, selectedYear);
  const updateMutation = useLeaveQuotaUpdate(member.id, selectedYear);

  const typeMap = useMemo(() => {
    return new Map((typesQuery.data || []).map((t) => [t.id, t.name]));
  }, [typesQuery.data]);

  const openCreateQuota = React.useCallback(() => {
    ui.dialog.open({
      title: `กำหนดโควต้าวันลา: ${memberDisplayName}`,
      description: `กำหนดจำนวนวันลาที่สามารถใช้ได้ในปี ${selectedYear}`,
      children: (
        <QuotaForm
          organizationId={targetOrgId}
          defaultValues={{
            leaveTypeId: '',
            year: selectedYear,
            totalDays: 10,
          }}
          isLoading={createMutation.isPending}
          onSubmit={(data: QuotaFormValues) => {
            createMutation.mutate(
              {
                organizationMemberId: member.id,
                leaveTypeId: data.leaveTypeId,
                year: data.year,
                totalDays: data.totalDays,
              },
              {
                onSuccess: () => {
                  ui.dialog.close();
                },
              },
            );
          }}
        />
      ),
    });
  }, [
    ui,
    memberDisplayName,
    selectedYear,
    targetOrgId,
    createMutation,
    member.id,
  ]);

  const openEditQuota = React.useCallback(
    (quota: LeaveQuota) => {
      ui.dialog.open({
        title: `แก้ไขโควต้า: ${typeMap.get(quota.leaveTypeId) || 'ประเภทการลา'}`,
        description: 'ปรับปรุงจำนวนวันลาทั้งหมด',
        children: (
          <QuotaForm
            organizationId={targetOrgId}
            isEditing
            defaultValues={{
              leaveTypeId: quota.leaveTypeId,
              year: quota.year,
              totalDays: quota.totalDays,
            }}
            isLoading={updateMutation.isPending}
            onSubmit={(data: QuotaFormValues) => {
              updateMutation.mutate(
                {
                  id: quota.id,
                  data: {
                    totalDays: data.totalDays,
                  },
                },
                {
                  onSuccess: () => {
                    ui.dialog.close();
                  },
                },
              );
            }}
          />
        ),
      });
    },
    [ui, typeMap, targetOrgId, updateMutation],
  );

  const columns = useMemo<ColumnDef<LeaveQuota>[]>(() => {
    return [
      {
        accessorKey: 'leaveTypeId',
        header: 'ประเภทการลา',
        cell: ({ getValue }) => {
          const typeId = getValue<string>();
          const typeName = typeMap.get(typeId) || 'ประเภทการลาทั่วไป';
          return <span className="font-semibold">{typeName}</span>;
        },
      },
      {
        accessorKey: 'year',
        header: 'ปี (พ.ศ./ค.ศ.)',
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue<number>()}</span>
        ),
      },
      {
        accessorKey: 'totalDays',
        header: 'โควต้าทั้งหมด',
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue<number>()} วัน</span>
        ),
      },
      {
        id: 'actions',
        header: 'จัดการ',
        cell: ({ row }) => (
          <ColumnActions
            actions={{
              แก้ไขโควต้า: {
                onAction: () => openEditQuota(row.original),
              },
            }}
          />
        ),
      },
    ];
  }, [typeMap, openEditQuota]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-foreground">
            พนักงาน: <span className="font-semibold">{memberDisplayName}</span>
          </span>
          <span className="text-xs text-muted-foreground">|</span>
          <span className="text-xs text-muted-foreground">เลือกปี:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-8 px-2 rounded-md border text-xs bg-background"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" onPress={openCreateQuota}>
          <Plus className="w-4 h-4 mr-1" />
          กำหนดโควต้า
        </Button>
      </div>

      <DataTable
        data={quotasQuery.data || []}
        columns={columns}
        isLoading={quotasQuery.isLoading || typesQuery.isLoading}
      />
    </div>
  );
}
