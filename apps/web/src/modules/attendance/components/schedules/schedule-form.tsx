'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField, SwitchField, SelectField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import type { FormProps } from '@/types';

export const scheduleFormSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อตารางเวลา'),
  roleId: z.string().uuid('กรุณาเลือกบทบาท'),
  isActive: z.boolean().default(true),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

type ScheduleFormProps = FormProps<ScheduleFormValues> & {
  companyId: string;
};

export default function ScheduleForm({
  companyId,
  onSubmit,
  defaultValues,
  isLoading,
}: ScheduleFormProps) {
  const rolesQuery = useCompanyRolesQueries(companyId);

  const roleOptions = useMemo(() => {
    return (rolesQuery.data || []).map((r) => ({
      value: r.id,
      label: r.name,
    }));
  }, [rolesQuery.data]);

  const methods = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema as never),
    defaultValues: defaultValues ?? {
      name: '',
      roleId: '',
      isActive: true,
    },
  });

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <InputField
          name="name"
          label="ชื่อตารางเวลาเข้างาน"
          placeholder="เช่น ตารางงานกะเช้า, กะเวรออฟฟิศ"
          control={methods.control}
          required
        />

        <SelectField
          name="roleId"
          label="บทบาทที่ใช้งานตารางนี้ (Target Role)"
          placeholder="เลือกบทบาทพนักงาน..."
          options={roleOptions}
          control={methods.control}
          disabled={rolesQuery.isLoading}
          required
        />

        <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานตารางเวลานี้"
            description="เปิดให้พนักงานในบทบาทนี้ใช้งานและเช็คชื่อตามรอบเวลานี้"
            control={methods.control}
          />
        </FieldGroup>
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={isLoading}>
          บันทึก
        </ButtonLoading>
      </div>
    </form>
  );
}
