'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CellContext } from '@tanstack/react-table';
import type { CheckInSchedule } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import ScheduleEditForm from './schedule-edit-form';

interface ScheduleColumnActionsProps<T extends CheckInSchedule> {
  cell: CellContext<T, unknown>;
  companyId: string;
}

export default function ScheduleColumnActions<T extends CheckInSchedule>({
  cell,
}: ScheduleColumnActionsProps<T>) {
  const router = useRouter();
  const ui = useOverlay();
  const schedule = cell.row.original;

  const actionManageSlots = useCallback(() => {
    router.push(`/company/attendance/schedules/${schedule.id}`);
  }, [router, schedule.id]);

  const actionEdit = useCallback(() => {
    ui.sheet.open({
      title: 'แก้ไขตารางเวลาเข้างาน',
      description: 'แก้ไขชื่อ เลือกหลายบทบาท และเปิดหรือปิดตารางเวลา',
      size: 'lg',
      children: (
        <ScheduleEditForm
          schedule={schedule}
          onSuccess={() => ui.sheet.close()}
        />
      ),
    });
  }, [ui.sheet, schedule]);

  return (
    <ColumnActions
      actions={{
        'จัดการรอบเวลา (Slots)': {
          onAction: actionManageSlots,
        },
        แก้ไขตารางเวลา: {
          onAction: actionEdit,
        },
      }}
    />
  );
}
