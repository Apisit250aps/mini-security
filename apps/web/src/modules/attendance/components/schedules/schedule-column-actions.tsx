'use client';

import React, { useCallback } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { CheckInSchedule } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import ScheduleSlotsModal from './schedule-slots-modal';
import ScheduleEditForm from './schedule-edit-form';

interface ScheduleColumnActionsProps<T extends CheckInSchedule> {
  cell: CellContext<T, unknown>;
  companyId: string;
}

export default function ScheduleColumnActions<T extends CheckInSchedule>({
  cell,
}: ScheduleColumnActionsProps<T>) {
  const ui = useOverlay();
  const schedule = cell.row.original;

  const actionManageSlots = useCallback(() => {
    ui.dialog.open({
      title: `จัดการรอบเวลา - ${schedule.name}`,
      description: 'การแก้รอบเวลามีผลกับทุกบทบาทที่ได้รับมอบหมายตารางนี้',
      size: 'xl',
      children: <ScheduleSlotsModal schedule={schedule} />,
    });
  }, [ui.dialog, schedule]);

  const actionEdit = useCallback(() => {
    ui.dialog.open({
      title: 'แก้ไขตารางเวลาเข้างาน',
      description: 'แก้ไขชื่อ เลือกหลายบทบาท และเปิดหรือปิดตารางเวลา',
      size: 'lg',
      children: (
        <ScheduleEditForm
          schedule={schedule}
          onSuccess={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, schedule]);

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
