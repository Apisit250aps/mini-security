'use client';

import React, { useMemo } from 'react';
import type { CheckInSchedule, ScheduleSlot } from '@repo/domains/entities';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { Plus } from 'lucide-react';
import { useScheduleSlotsQueries } from '../../hooks/attendance-queries';
import {
  useSlotCreate,
  useSlotUpdate,
  useSlotDelete,
} from '../../hooks/attendance-mutations';
import SlotForm, { SlotFormValues } from './slot-form';

interface ScheduleSlotsModalProps {
  schedule: CheckInSchedule;
}

export default function ScheduleSlotsModal({
  schedule,
}: ScheduleSlotsModalProps) {
  const ui = useOverlay();
  const slotsQuery = useScheduleSlotsQueries(schedule.id);
  const createMutation = useSlotCreate(schedule.id);
  const updateMutation = useSlotUpdate(schedule.id);
  const deleteMutation = useSlotDelete(schedule.id);

  const openCreateSlot = () => {
    ui.dialog.open({
      title: `เพิ่มรอบเวลา: ${schedule.name}`,
      description: 'กำหนดช่วงเวลาและลำดับของรอบการลงชื่อเข้างาน',
      children: (
        <SlotForm
          isLoading={createMutation.isPending}
          onSubmit={(data: SlotFormValues) => {
            createMutation.mutate(
              {
                checkInScheduleId: schedule.id,
                label: data.label,
                slotOrder: data.slotOrder,
                windowStart: data.windowStart,
                windowEnd: data.windowEnd,
                isRequired: data.isRequired,
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

  const openEditSlot = React.useCallback(
    (slot: ScheduleSlot) => {
      ui.dialog.open({
        title: `แก้ไขรอบเวลา: ${slot.label}`,
        description: 'ปรับปรุงช่วงเวลาและเงื่อนไขของรอบการลงชื่อ',
        children: (
          <SlotForm
            isLoading={updateMutation.isPending}
            defaultValues={{
              label: slot.label,
              slotOrder: slot.slotOrder,
              windowStart: slot.windowStart,
              windowEnd: slot.windowEnd,
              isRequired: slot.isRequired,
            }}
            onSubmit={(data: SlotFormValues) => {
              updateMutation.mutate(
                {
                  id: slot.id,
                  data: {
                    label: data.label,
                    slotOrder: data.slotOrder,
                    windowStart: data.windowStart,
                    windowEnd: data.windowEnd,
                    isRequired: data.isRequired,
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
    [ui, updateMutation],
  );

  const confirmDeleteSlot = React.useCallback(
    (slot: ScheduleSlot) => {
      ui.alert.open({
        title: 'ยืนยันการลบรอบเวลา',
        description: `คุณต้องการลบรอบเวลา "${slot.label}" ใช่หรือไม่? ข้อมูลรอบเวลานี้จะไม่สามารถกู้คืนได้`,
        confirmVariant: 'destructive',
        onConfirm: () => {
          deleteMutation.mutate(slot.id, {
            onSuccess: () => {
              ui.alert.close();
            },
          });
        },
      });
    },
    [ui, deleteMutation],
  );

  const columns = useMemo<ColumnDef<ScheduleSlot>[]>(() => {
    return [
      {
        accessorKey: 'slotOrder',
        header: 'ลำดับ',
        cell: ({ getValue }) => (
          <span className="font-semibold text-center block w-8">
            {getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: 'label',
        header: 'ชื่อรอบเวลา',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<string>()}</span>
        ),
      },
      {
        id: 'timeWindow',
        header: 'ช่วงเวลา',
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.windowStart} - {row.original.windowEnd}
          </span>
        ),
      },
      {
        accessorKey: 'isRequired',
        header: 'ความจำเป็น',
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <Badge variant="default">จำเป็น</Badge>
          ) : (
            <Badge variant="outline">ทางเลือก</Badge>
          ),
      },
      {
        id: 'actions',
        header: 'จัดการ',
        cell: ({ row }) => (
          <ColumnActions
            actions={{
              แก้ไข: {
                onAction: () => openEditSlot(row.original),
              },
              ลบ: {
                onAction: () => confirmDeleteSlot(row.original),
                variant: 'destructive',
              },
            }}
          />
        ),
      },
    ];
  }, [openEditSlot, confirmDeleteSlot]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <div>
          <h3 className="text-sm font-medium">
            รอบเวลาทั้งหมด ({slotsQuery.data?.length || 0})
          </h3>
          <p className="text-xs text-muted-foreground">
            ตารางเวลา: {schedule.name}
          </p>
        </div>
        <Button size="sm" onPress={openCreateSlot}>
          <Plus className="w-4 h-4 mr-1" />
          เพิ่มรอบเวลา
        </Button>
      </div>

      <DataTable
        data={slotsQuery.data || []}
        columns={columns}
        isLoading={slotsQuery.isLoading}
      />
    </div>
  );
}
