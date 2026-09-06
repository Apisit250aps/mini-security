'use client';

import React from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { CheckInSchedule } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useScheduleUpdate } from '../../hooks/attendance-mutations';
import ScheduleSlotsModal from './schedule-slots-modal';
import ScheduleForm, { ScheduleFormValues } from './schedule-form';

interface ScheduleColumnActionsProps<T extends CheckInSchedule> {
  cell: CellContext<T, unknown>;
  companyId: string;
}

export default function ScheduleColumnActions<T extends CheckInSchedule>({
  cell,
  companyId,
}: ScheduleColumnActionsProps<T>) {
  const ui = useOverlay();
  const updateMutation = useScheduleUpdate(companyId);
  const schedule = cell.row.original;

  const actionManageSlots = () => {
    ui.dialog.open({
      title: `จัดการรอบเวลา - ${schedule.name}`,
      description: 'กำหนดรอบการเข้างาน (Slots) ลำดับ และช่วงเวลาสำหรับตารางนี้',
      size: 'xl',
      children: <ScheduleSlotsModal schedule={schedule} />,
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขตารางเวลาเข้างาน',
      description: 'ปรับปรุงชื่อบทบาทหรือสถานะการใช้งานตารางเวลา',
      size: 'lg',
      children: (
        <ScheduleForm
          companyId={companyId}
          isLoading={updateMutation.isPending}
          defaultValues={{
            name: schedule.name,
            roleId: schedule.roleId,
            isActive: schedule.isActive,
          }}
          onSubmit={(data: ScheduleFormValues) => {
            updateMutation.mutate(
              {
                id: schedule.id,
                data: {
                  name: data.name,
                  roleId: data.roleId,
                  isActive: data.isActive,
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
  };

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
