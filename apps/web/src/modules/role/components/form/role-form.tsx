'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleSchema } from '@repo/domains/schema/permission';
import type { FormProps } from '@/types';
import { z } from 'zod';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { SwitchField } from '@repo/ui/components/shared/form/boolean-fields';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';

export type RoleFormValues = z.infer<typeof createRoleSchema>;

const ROLE_TYPE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'ผู้ดูแลระบบสูงสุด (Super Admin)' },
  { value: 'OWNER', label: 'เจ้าของ (Owner)' },
  { value: 'ADMIN', label: 'ผู้ดูแลระบบ (Admin)' },
  { value: 'MEMBER', label: 'สมาชิก (Member)' },
  { value: 'VIEWER', label: 'ผู้เยี่ยมชม (Viewer)' },
];

type RoleFormProps = FormProps<RoleFormValues> & {
  hideSystemDefault?: boolean;
  readOnly?: boolean;
};

export default function RoleForm({
  onSubmit,
  defaultValues,
  isLoading,
  hideSystemDefault = false,
  readOnly = false,
}: RoleFormProps) {
  const roleTypeOptions = useMemo(() => {
    if (hideSystemDefault) {
      return ROLE_TYPE_OPTIONS.filter((opt) => opt.value !== 'SUPER_ADMIN');
    }
    return ROLE_TYPE_OPTIONS;
  }, [hideSystemDefault]);

  const methods = useForm<RoleFormValues>({
    resolver: zodResolver(createRoleSchema as never),
    defaultValues: defaultValues ?? {
      name: '',
      description: '',
      companyId: null,
      roleType: 'MEMBER',
      isSystemDefault: false,
    },
  });

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      {readOnly && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <span className="font-semibold">
            บทบาทมาตรฐานของระบบ (System Default):
          </span>{' '}
          แสดงในโหมดดูข้อมูลเท่านั้น ไม่สามารถแก้ไขได้
        </div>
      )}

      <FieldGroup className="flex flex-col gap-3">
        <InputField
          name="name"
          label="ชื่อบทบาท"
          placeholder="เช่น Manager, Staff, Accountant"
          control={methods.control}
          disabled={readOnly}
          required
        />

        <TextareaField
          name="description"
          label="คำอธิบาย"
          placeholder="ระบุหน้าที่หรือขอบเขตสิทธิ์ของบทบาทนี้"
          control={methods.control}
          disabled={readOnly}
        />

        <SelectField
          name="roleType"
          label="ประเภทบทบาท (Role Type)"
          placeholder="เลือกประเภทบทบาท..."
          options={roleTypeOptions}
          control={methods.control}
          disabled={readOnly}
          required
        />

        {!hideSystemDefault && (
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <SwitchField
              name="isSystemDefault"
              label="บทบาทเริ่มต้นของระบบ (System Default)"
              description="กำหนดให้เป็นบทบาทมาตรฐานสำหรับทุกองค์กร"
              control={methods.control}
              disabled={readOnly}
            />
          </div>
        )}
      </FieldGroup>

      {!readOnly && (
        <div className="flex justify-end">
          <ButtonLoading type="submit" isLoading={isLoading}>
            บันทึก
          </ButtonLoading>
        </div>
      )}
    </form>
  );
}
