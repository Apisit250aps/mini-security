'use client';

import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField, SwitchField } from '@repo/ui/form';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Button } from '@repo/ui/components/button';
import {
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import type { FormProps } from '@/types';

export const scheduleFormSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อตารางเวลา'),
  roleIds: z.array(z.string().uuid()),
  isActive: z.boolean(),
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
    return (rolesQuery.data || [])
      .filter(
        (role) =>
          role.companyId === companyId ||
          (role.companyId == null && role.isSystemDefault),
      )
      .map((r) => ({
        value: r.id,
        label: r.name,
      }));
  }, [rolesQuery.data, companyId]);

  const methods = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: defaultValues ?? {
      name: '',
      roleIds: [],
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

        <Controller
          name="roleIds"
          control={methods.control}
          render={({ field, fieldState }) => (
            <FieldSet disabled={isLoading || rolesQuery.isLoading}>
              <FieldLegend>บทบาทที่ได้รับมอบหมาย</FieldLegend>
              <FieldDescription>
                เลือกได้หลายบทบาท หรือยังไม่มอบหมายก็ได้
                เอาเครื่องหมายออกเพื่อปิดการมอบหมายเฉพาะบทบาทนั้น
              </FieldDescription>
              {rolesQuery.isLoading ? (
                <p role="status">กำลังโหลดบทบาท...</p>
              ) : rolesQuery.isError ? (
                <div role="alert">
                  โหลดบทบาทไม่สำเร็จ
                  <Button
                    variant="outline"
                    onPress={() => void rolesQuery.refetch()}
                  >
                    ลองอีกครั้ง
                  </Button>
                </div>
              ) : roleOptions.length ? (
                <div className="flex max-h-60 flex-col gap-3 overflow-y-auto rounded-lg border p-3">
                  {roleOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-3">
                      <Checkbox
                        aria-label={option.label}
                        isSelected={field.value.includes(option.value)}
                        isDisabled={isLoading}
                        onBlur={field.onBlur}
                        onChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...field.value, option.value]
                              : field.value.filter((id) => id !== option.value),
                          )
                        }
                      />
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>ยังไม่มีบทบาทของบริษัทนี้</p>
              )}
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />

        <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานตารางเวลานี้"
            description="มีผลกับทุกบทบาทที่ได้รับมอบหมายตารางนี้"
            control={methods.control}
          />
        </FieldGroup>
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading
          type="submit"
          isLoading={isLoading}
          isDisabled={rolesQuery.isLoading || rolesQuery.isError}
        >
          บันทึก
        </ButtonLoading>
      </div>
    </form>
  );
}
