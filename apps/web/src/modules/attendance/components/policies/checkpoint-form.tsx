'use client';

import { InputField, SelectField, SwitchField } from '@repo/ui/form';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceCheckpointSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import {
  useAttendanceCheckpointCreate,
  useAttendanceCheckpointUpdate,
} from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';

import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';
import type { AttendanceCheckpoint } from '@repo/domains/entities';

type FormValues = z.infer<typeof createAttendanceCheckpointSchema>;

const CHECK_TYPE_OPTIONS = [
  { value: 'CHECK_IN', label: 'เข้างาน (Check In)' },
  { value: 'CHECK_OUT', label: 'ออกงาน (Check Out)' },
  { value: 'BREAK_IN', label: 'พักเบรก (Break In)' },
  { value: 'BREAK_OUT', label: 'กลับจากเบรก (Break Out)' },
  { value: 'CUSTOM', label: 'กำหนดเอง (Custom Checkpoint)' },
];

export default function CheckpointForm({
  policyId,
  checkpoint,
}: {
  policyId: string;
  checkpoint?: AttendanceCheckpoint;
}) {
  const ui = useOverlay();
  const createMutation = useAttendanceCheckpointCreate(policyId);
  const updateMutation = useAttendanceCheckpointUpdate(policyId);

  const isEdit = Boolean(checkpoint);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createAttendanceCheckpointSchema as never),
    defaultValues: {
      policyId,
      checkType: checkpoint?.checkType || 'CHECK_IN',
      label: checkpoint?.label || '',
      orderIndex: checkpoint?.orderIndex ?? 1,
      isRequired: checkpoint?.isRequired ?? true,
      windowStart: checkpoint?.windowStart || '',
      windowEnd: checkpoint?.windowEnd || '',
      graceMinutes: checkpoint?.graceMinutes ?? 15,
      requirePhoto: checkpoint?.requirePhoto ?? false,
      requireLocation: checkpoint?.requireLocation ?? true,
    },
  });

  const handleSubmit = async (data: FormValues) => {
    if (isEdit && checkpoint) {
      await updateMutation.mutateAsync({
        id: checkpoint.id,
        data: {
          checkType: data.checkType,
          label: data.label,
          orderIndex: Number(data.orderIndex),
          isRequired: data.isRequired,
          windowStart: data.windowStart || null,
          windowEnd: data.windowEnd || null,
          graceMinutes: Number(data.graceMinutes) || null,
          requirePhoto: data.requirePhoto,
          requireLocation: data.requireLocation,
        },
      });
    } else {
      await createMutation.mutateAsync({
        policyId,
        checkType: data.checkType,
        label: data.label,
        orderIndex: Number(data.orderIndex),
        isRequired: data.isRequired,
        windowStart: data.windowStart || null,
        windowEnd: data.windowEnd || null,
        graceMinutes: Number(data.graceMinutes) || null,
        requirePhoto: data.requirePhoto,
        requireLocation: data.requireLocation,
      });
    }
    ui.hideAll();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <FieldGroup className="grid grid-cols-2 gap-3">
          <SelectField
            name="checkType"
            label="ประเภทการเช็คชื่อ"
            placeholder="เลือกประเภท..."
            options={CHECK_TYPE_OPTIONS}
            control={methods.control}
            required
          />

          <InputField
            name="label"
            label="ชื่อจุดเช็ค (Label)"
            placeholder="เช่น สแกนเข้างานช่วงเช้า"
            control={methods.control}
            required
          />
        </FieldGroup>

        <FieldGroup className="grid grid-cols-3 gap-3">
          <InputField
            name="orderIndex"
            label="ลำดับการเช็ค"
            type="number"
            control={methods.control}
            required
          />
          <InputField
            name="windowStart"
            label="เวลาเปิดเช็ค (HH:mm)"
            placeholder="08:00"
            control={methods.control}
          />
          <InputField
            name="windowEnd"
            label="เวลาปิดเช็ค (HH:mm)"
            placeholder="09:30"
            control={methods.control}
          />
        </FieldGroup>

        <InputField
          name="graceMinutes"
          label="เวลาอนุโลมสาย (นาที)"
          type="number"
          placeholder="15"
          control={methods.control}
        />

        <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-lg border p-3">
          <SwitchField
            name="isRequired"
            label="บังคับเช็ค"
            control={methods.control}
          />
          <SwitchField
            name="requireLocation"
            label="บังคับตรวจสอบพิกัด GPS"
            control={methods.control}
          />
          <SwitchField
            name="requirePhoto"
            label="บังคับถ่ายภาพ Selfie"
            control={methods.control}
          />
        </FieldGroup>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={isLoading}>
          {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มจุดเช็คชื่อ'}
        </ButtonLoading>
      </div>
    </form>
  );
}
