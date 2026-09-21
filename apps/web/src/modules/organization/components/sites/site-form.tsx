'use client';

import { InputField, SwitchField } from '@repo/ui/form';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSiteSchema } from '@repo/domains/schema/organization';
import type { FormProps } from '@/types';
import { z } from 'zod';

import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';

export type SiteFormValues = z.infer<typeof createSiteSchema>;

export default function SiteForm({
  onSubmit,
  defaultValues,
  isLoading,
}: FormProps<SiteFormValues>) {
  const methods = useForm<SiteFormValues>({
    resolver: zodResolver(createSiteSchema as never),
    defaultValues: defaultValues ?? {
      organizationId: '',
      name: '',
      address: '',
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
          label="ชื่อไซต์"
          placeholder="เช่น สำนักงานใหญ่, ไซต์พัทยา, ไซต์เชียงใหม่"
          control={methods.control}
          required
        />

        <InputField
          name="address"
          label="ที่อยู่ / สถานที่ตั้งไซต์"
          placeholder="ระบุที่อยู่ของไซต์ (ถ้ามี)"
          control={methods.control}
        />

        <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานไซต์ (Active)"
            description="อนุญาตให้พนักงานสังกัดและปฏิบัติงานที่ไซต์นี้ได้"
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
