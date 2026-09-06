'use client';

import React, { useMemo, useState } from 'react';
import type { CompanyMember, LeaveQuota } from '@repo/domains/entities';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { Plus } from 'lucide-react';
import {
  useMemberLeaveQuotasQueries,
  useCompanyLeaveTypesQueries,
} from '../../hooks/leave-queries';
import {
  useLeaveQuotaCreate,
  useLeaveQuotaUpdate,
} from '../../hooks/leave-mutations';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import QuotaForm, { QuotaFormValues } from './quota-form';

interface MemberQuotasModalProps {
  member: CompanyMember;
  companyId: string;
  userName?: string;
}

export default function MemberQuotasModal({
  member,
  companyId,
  userName,
}: MemberQuotasModalProps) {
  const ui = useOverlay();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const quotasQuery = useMemberLeaveQuotasQueries(member.id, selectedYear);
  const typesQuery = useCompanyLeaveTypesQueries(companyId);
  const usersQuery = useUserListQueries();

  const user = useMemo(() => {
    return (usersQuery.data || []).find((u) => u.id === member.userId);
  }, [usersQuery.data, member.userId]);

  const memberDisplayName = useMemo(() => {
    if (userName) return userName;
    if (user) return `${user.name} (${user.email})`;
    return member.userId || member.id;
  }, [userName, user, member.userId, member.id]);

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
          companyId={companyId}
          defaultValues={{
            leaveTypeId: '',
            year: selectedYear,
            totalDays: 10,
            usedDays: 0,
          }}
          isLoading={createMutation.isPending}
          onSubmit={(data: QuotaFormValues) => {
            createMutation.mutate(
              {
                companyMemberId: member.id,
                leaveTypeId: data.leaveTypeId,
                year: data.year,
                totalDays: data.totalDays,
                usedDays: data.usedDays,
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
    companyId,
    createMutation,
    member.id,
  ]);

  const openEditQuota = React.useCallback(
    (quota: LeaveQuota) => {
      ui.dialog.open({
        title: `แก้ไขโควต้า: ${typeMap.get(quota.leaveTypeId) || 'ประเภทการลา'}`,
        description: 'ปรับปรุงจำนวนวันลาทั้งหมดและจำนวนวันที่ใช้ไป',
        children: (
          <QuotaForm
            companyId={companyId}
            isEditing
            defaultValues={{
              leaveTypeId: quota.leaveTypeId,
              year: quota.year,
              totalDays: quota.totalDays,
              usedDays: quota.usedDays,
            }}
            isLoading={updateMutation.isPending}
            onSubmit={(data: QuotaFormValues) => {
              updateMutation.mutate(
                {
                  id: quota.id,
                  data: {
                    totalDays: data.totalDays,
                    usedDays: data.usedDays,
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
    [ui, typeMap, companyId, updateMutation],
  );

  const columns = useMemo<ColumnDef<LeaveQuota>[]>(() => {
    return [
      {
        accessorKey: 'leaveTypeId',
        header: 'ประเภทการลา',
        cell: ({ getValue }) => {
          const typeId = getValue<string>();
          const typeName = typeMap.get(typeId) || typeId;
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
        accessorKey: 'usedDays',
        header: 'ใช้ไปแล้ว',
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-amber-600 dark:text-amber-400">
            {getValue<number>()} วัน
          </span>
        ),
      },
      {
        id: 'remaining',
        header: 'คงเหลือ',
        cell: ({ row }) => {
          const remaining = row.original.totalDays - row.original.usedDays;
          return (
            <Badge variant={remaining > 0 ? 'default' : 'destructive'}>
              {remaining} วัน
            </Badge>
          );
        },
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
