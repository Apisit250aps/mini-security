'use client';

import React from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import type {
  Role,
  RoleWorkSchedule,
  WorkSchedule,
  WorkShift,
} from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useRoleWorkScheduleDelete } from '../../hooks/attendance-mutations';
import { formatDate } from '@/shared/utils';
import { Shield, Clock, Calendar } from 'lucide-react';

function RoleScheduleColumnActions<T extends RoleWorkSchedule>({
  row,
}: CellContext<T, unknown>) {
  const ui = useOverlay();
  const roleSchedule = row.original;
  const deleteMutation = useRoleWorkScheduleDelete(roleSchedule.companyId);

  const handleDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการยกเลิกการมอบหมาย',
      description:
        'คุณต้องการยกเลิกการกำหนดตารางเวลานี้ออกจากบทบาทดังกล่าวหรือไม่?',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(roleSchedule.id);
        ui.hideAll();
      },
    });
  };

  return (
    <ColumnActions
      actions={{
        ยกเลิกการมอบหมาย: {
          onAction: handleDelete,
          variant: 'destructive',
        },
      }}
    />
  );
}

export const roleScheduleColumns = ({
  rolesMap,
  shiftsMap,
  schedulesMap,
}: {
  rolesMap?: Map<string, Role>;
  shiftsMap?: Map<string, WorkShift>;
  schedulesMap?: Map<string, WorkSchedule>;
} = {}): ColumnDef<RoleWorkSchedule>[] => [
  {
    accessorKey: 'roleId',
    header: 'ตำแหน่ง / บทบาท (Role)',
    cell: ({ getValue }) => {
      const roleId = getValue<string>();
      const role = rolesMap?.get(roleId);
      return (
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
            <Shield className="size-3.5" />
          </div>
          <span className="font-semibold text-foreground text-sm">
            {role?.name || roleId.slice(0, 8)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'workShiftId',
    header: 'กะและตารางเวลาทำงาน',
    cell: ({ getValue }) => {
      const shiftId = getValue<string>();
      const shift = shiftsMap?.get(shiftId);
      const schedule = shift
        ? schedulesMap?.get(shift.workScheduleId)
        : undefined;

      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            {shift?.color && (
              <div
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: shift.color }}
              />
            )}
            <span>{shift?.name || shiftId.slice(0, 8)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
            <Clock className="size-3 shrink-0" />
            <span>{shift ? `${shift.startTime} - ${shift.endTime}` : '-'}</span>
            {schedule && (
              <span className="text-muted-foreground/70 font-sans">
                ({schedule.name})
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'effectiveDate',
    header: 'ช่วงวันที่เริ่มมีผล',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 text-muted-foreground shrink-0" />
          <span>{formatDate(item.effectiveDate)}</span>
          <span>-</span>
          <span>
            {item.endDate ? formatDate(item.endDate) : 'ต่อเนื่อง (Ongoing)'}
          </span>
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'สถานะ',
    cell: ({ row }) => {
      const item = row.original;
      const now = new Date();
      const start = new Date(item.effectiveDate);
      const end = item.endDate ? new Date(item.endDate) : null;

      const isActive = start <= now && (!end || end >= now);

      return isActive ? (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          มีผลบังคับใช้
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          {end && end < now ? 'หมดอายุ' : 'รอดำเนินการ'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: RoleScheduleColumnActions,
  },
];
