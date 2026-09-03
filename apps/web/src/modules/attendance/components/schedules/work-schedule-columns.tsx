'use client';

import React from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import type { WorkSchedule } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useWorkScheduleDelete } from '../../hooks/attendance-mutations';
import WorkScheduleForm from './work-schedule-form';
import WorkShiftForm from './work-shift-form';
import { formatDate } from '@/shared/utils';
import { CalendarRange, Clock } from 'lucide-react';

function WorkScheduleColumnActions<T extends WorkSchedule>({
  row,
}: CellContext<T, unknown>) {
  const ui = useOverlay();
  const schedule = row.original;
  const deleteMutation = useWorkScheduleDelete(schedule.companyId);

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขตารางเวลาทำงาน',
      description: 'ปรับปรุงข้อมูลตารางเวลาทำงานและสถานะ',
      size: 'lg',
      children: (
        <WorkScheduleForm companyId={schedule.companyId} schedule={schedule} />
      ),
    });
  };

  const handleAddShift = () => {
    ui.dialog.open({
      title: 'เพิ่มกะการทำงาน',
      description: `สร้างกะทำงานใหม่ภายใต้ตาราง "${schedule.name}"`,
      size: 'lg',
      children: (
        <WorkShiftForm
          companyId={schedule.companyId}
          workScheduleId={schedule.id}
        />
      ),
    });
  };

  const handleDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบตารางเวลา',
      description: `คุณต้องการลบตารางเวลา "${schedule.name}" หรือไม่? (กะทำงานทั้งหมดในตารางนี้จะถูกลบด้วย)`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(schedule.id);
        ui.hideAll();
      },
    });
  };

  return (
    <ColumnActions
      actions={{
        เพิ่มกะทำงาน: {
          onAction: handleAddShift,
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

export const workScheduleColumns = ({
  shiftCountsMap,
}: {
  shiftCountsMap?: Map<string, number>;
} = {}): ColumnDef<WorkSchedule>[] => [
  {
    accessorKey: 'name',
    header: 'ชื่อตารางเวลาทำงาน',
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <CalendarRange className="size-4" />
        </div>
        <span className="font-semibold text-foreground text-sm">
          {getValue<string>()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'คำอธิบาย',
    cell: ({ getValue }) => {
      const desc = getValue<string | null>();
      return desc ? (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
          {desc}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground italic">-</span>
      );
    },
  },
  {
    id: 'shiftsCount',
    header: 'จำนวนกะ',
    cell: ({ row }) => {
      const count = shiftCountsMap?.get(row.original.id) ?? 0;
      return (
        <div className="flex items-center gap-1 text-xs">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="font-mono font-medium">{count} กะ</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'สถานะ',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          เปิดใช้งาน
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          ปิดใช้งาน
        </Badge>
      ),
  },
  {
    accessorKey: 'createdAt',
    header: 'วันที่สร้าง',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(getValue<Date>())}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: WorkScheduleColumnActions,
  },
];
