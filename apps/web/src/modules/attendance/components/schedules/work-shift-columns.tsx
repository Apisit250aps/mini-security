'use client';

import React from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import type { WorkSchedule, WorkShift } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useWorkShiftDelete } from '../../hooks/attendance-mutations';
import WorkShiftForm from './work-shift-form';
import RoleScheduleForm from './role-schedule-form';
import { Clock, Moon } from 'lucide-react';

function WorkShiftColumnActions<T extends WorkShift>({
  row,
}: CellContext<T, unknown>) {
  const ui = useOverlay();
  const shift = row.original;
  const deleteMutation = useWorkShiftDelete(shift.workScheduleId);

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขกะการทำงาน',
      description: 'ปรับปรุงเวลาเริ่ม-เลิกงานและสีประจำกะ',
      size: 'lg',
      children: (
        <WorkShiftForm
          companyId={shift.companyId}
          workScheduleId={shift.workScheduleId}
          shift={shift}
        />
      ),
    });
  };

  const handleDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบกะทำงาน',
      description: `คุณต้องการลบกะ "${shift.name}" (${shift.startTime} - ${shift.endTime}) หรือไม่?`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(shift.id);
        ui.hideAll();
      },
    });
  };

  const handleAssignRole = () => {
    ui.dialog.open({
      title: `กำหนด Role: ${shift.name}`,
      description: 'เลือก Role ที่ต้องใช้กะการทำงานนี้',
      size: 'lg',
      children: (
        <RoleScheduleForm companyId={shift.companyId} workShiftId={shift.id} />
      ),
    });
  };

  return (
    <ColumnActions
      actions={{
        กำหนดให้Role: {
          onAction: handleAssignRole,
        },
        แก้ไข: {
          onAction: handleEdit,
        },
        ลบ: {
          onAction: handleDelete,
          variant: 'destructive',
        },
      }}
    />
  );
}

export const workShiftColumns = ({
  schedulesMap,
}: {
  schedulesMap?: Map<string, WorkSchedule>;
} = {}): ColumnDef<WorkShift>[] => [
  {
    accessorKey: 'name',
    header: 'ชื่อกะการทำงาน',
    cell: ({ row }) => {
      const shift = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <div
            className="size-3.5 rounded-full shrink-0 shadow-sm border"
            style={{ backgroundColor: shift.color || '#3b82f6' }}
          />
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground text-sm">
              {shift.name}
            </span>
            {shift.isOvernight && (
              <Badge
                variant="outline"
                className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px] py-0 px-1.5"
              >
                <Moon className="size-2.5" /> ข้ามคืน
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'workScheduleId',
    header: 'ตารางเวลาที่สังกัด',
    cell: ({ getValue }) => {
      const scheduleId = getValue<string>();
      const schedule = schedulesMap?.get(scheduleId);
      return (
        <span className="text-xs font-medium text-foreground">
          {schedule?.name || scheduleId.slice(0, 8)}
        </span>
      );
    },
  },
  {
    id: 'workHours',
    header: 'ช่วงเวลาทำงาน',
    cell: ({ row }) => {
      const shift = row.original;
      return (
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Clock className="size-3.5 text-muted-foreground shrink-0" />
          <span>
            {shift.startTime} - {shift.endTime}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: WorkShiftColumnActions,
  },
];
