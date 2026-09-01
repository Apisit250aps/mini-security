'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema } from '@repo/domains/schema/user';
import type { FormProps } from '@/types';
import { z } from 'zod';
import {
  InputField,
  PasswordField,
} from '@repo/ui/components/shared/form/input-field';
import { SwitchField } from '@repo/ui/components/shared/form/boolean-fields';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';

export type UserFormValues = z.infer<typeof createUserSchema>;

export default function UserForm({
  onSubmit,
  defaultValues,
  isLoading,
}: FormProps<UserFormValues>) {
  const isEdit = Boolean(defaultValues);

  const validationSchema = React.useMemo(() => {
    if (isEdit) {
      return createUserSchema.extend({
        password: z
          .string()
          .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
          .optional()
          .or(z.literal(''))
          .nullable(),
      });
    }

    return createUserSchema.extend({
      password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    });
  }, [isEdit]);

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(validationSchema as never),
    defaultValues: defaultValues ?? {
      name: '',
      email: '',
      password: '',
      isAdmin: false,
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
          label="ชื่อผู้ใช้"
          placeholder="เช่น สมชาย ใจดี"
          control={methods.control}
          required
        />

        <InputField
          name="email"
          label="อีเมล"
          type="email"
          placeholder="user@example.com"
          control={methods.control}
          required
        />

        <PasswordField
          name="password"
          label={isEdit ? 'เปลี่ยนรหัสผ่าน' : 'รหัสผ่าน'}
          placeholder={
            isEdit
              ? 'เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน'
              : 'รหัสผ่านอย่างน้อย 8 ตัวอักษร'
          }
          control={methods.control}
          required={!isEdit}
        />

        <div className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isAdmin"
            label="ผู้ดูแลระบบ (Admin)"
            description="ให้สิทธิ์การจัดการระบบแก่ผู้ใช้นี้"
            control={methods.control}
          />

          <SwitchField
            name="isActive"
            label="เปิดใช้งานบัญชี (Active)"
            description="อนุญาตให้ผู้ใช้นี้เข้าสู่ระบบได้"
            control={methods.control}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={isLoading}>
          บันทึก
        </ButtonLoading>
      </div>
    </form>
  );
}
