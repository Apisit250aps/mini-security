'use client';

import React from 'react';
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
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'OWNER', label: 'Owner' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'VIEWER', label: 'Viewer' },
];

type RoleFormProps = FormProps<RoleFormValues> & {
  hideSystemDefault?: boolean;
};

export default function RoleForm({
  onSubmit,
  defaultValues,
  isLoading,
  hideSystemDefault = false,
}: RoleFormProps) {
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
      onSubmit={methods.handleSubmit(onSubmit, (errors) => {
        console.log(errors);
      })}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <InputField
          name="name"
          label="ชื่อบทบาท"
          placeholder="เช่น Manager, Staff, Accountant"
          control={methods.control}
          required
        />

        <TextareaField
          name="description"
          label="คำอธิบาย"
          placeholder="ระบุหน้าที่หรือขอบเขตสิทธิ์ของบทบาทนี้"
          control={methods.control}
        />

        <SelectField
          name="roleType"
          label="ประเภทบทบาท (Role Type)"
          placeholder="เลือกประเภทบทบาท..."
          options={ROLE_TYPE_OPTIONS}
          control={methods.control}
          required
        />

        {!hideSystemDefault && (
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <SwitchField
              name="isSystemDefault"
              label="บทบาทเริ่มต้นของระบบ (System Default)"
              description="กำหนดให้เป็นบทบาทมาตรฐานสำหรับทุกองค์กร"
              control={methods.control}
            />
          </div>
        )}
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={isLoading}>
          บันทึก
        </ButtonLoading>
      </div>
    </form>
  );
}
