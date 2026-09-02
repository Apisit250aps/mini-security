'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendancePolicySchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import {
  useAttendancePolicyCreate,
  useAttendancePolicyUpdate,
} from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { SwitchField } from '@repo/ui/components/shared/form/boolean-fields';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';
import type { AttendancePolicy } from '@repo/domains/entities';

type FormValues = z.infer<typeof createAttendancePolicySchema>;

export default function PolicyForm({
  companyId,
  policy,
}: {
  companyId: string;
  policy?: AttendancePolicy;
}) {
  const ui = useOverlay();
  const createMutation = useAttendancePolicyCreate(companyId);
  const updateMutation = useAttendancePolicyUpdate(companyId);

  const isEdit = Boolean(policy);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createAttendancePolicySchema as never),
    defaultValues: {
      companyId,
      name: policy?.name || '',
      description: policy?.description || '',
      isActive: policy?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: FormValues) => {
    if (isEdit && policy) {
      await updateMutation.mutateAsync({
        id: policy.id,
        data: {
          name: data.name,
          description: data.description || null,
          isActive: data.isActive,
        },
      });
    } else {
      await createMutation.mutateAsync({
        companyId,
        name: data.name,
        description: data.description || null,
        isActive: data.isActive,
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
        <InputField
          name="name"
          label="ชื่อนโยบายการลงเวลา"
          placeholder="เช่น นโยบายเช็คชื่อพนักงานสำนักงานใหญ่"
          control={methods.control}
          required
        />

        <TextareaField
          name="description"
          label="คำอธิบาย"
          placeholder="ระบุรายละเอียดหรือข้อกำหนดของนโยบายนี้"
          control={methods.control}
        />

        <div className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานนโยบายนี้"
            description="กำหนดให้มีผลบังคับใช้กับบทบาทที่ผูกไว้"
            control={methods.control}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={isLoading}>
          {isEdit ? 'บันทึกการแก้ไข' : 'สร้างนโยบาย'}
        </ButtonLoading>
      </div>
    </form>
  );
}
