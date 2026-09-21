'use client';

import { InputField, SwitchField } from '@repo/ui/form';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationSchema } from '@repo/domains/schema/organization';
import type { FormProps } from '@/types';
import { z } from 'zod';

import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';

export type OrganizationFormValues = z.infer<typeof createOrganizationSchema>;

export default function OrganizationForm({
  onSubmit,
  defaultValues,
  isLoading,
}: FormProps<OrganizationFormValues>) {
  const methods = useForm<OrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema as never),
    defaultValues: defaultValues ?? {
      name: '',
      slug: '',
      logo: '',
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
          label="ชื่อองค์กร"
          placeholder="เช่น บริษัท อินโนเวชั่น จำกัด หรือ องค์กรตัวอย่าง"
          control={methods.control}
          required
        />

        <InputField
          name="slug"
          label="รหัสประจำองค์กร (Slug)"
          placeholder="เช่น innovation-tech"
          control={methods.control}
          required
        />

        <InputField
          name="logo"
          label="URL โลโก้"
          placeholder="https://example.com/logo.png"
          control={methods.control}
        />

        <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานองค์กร (Active)"
            description="อนุญาตให้เข้าใช้งานในนามองค์กรนี้ได้"
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
