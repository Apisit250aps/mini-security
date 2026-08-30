'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCompanySchema } from '@repo/domains/schema/company';
import type { FormProps } from '@/types';
import { z } from 'zod';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { SwitchField } from '@repo/ui/components/shared/form/boolean-fields';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';

export type CompanyFormValues = z.infer<typeof createCompanySchema>;

export default function CompanyForm({
  onSubmit,
  defaultValues,
  isLoading,
}: FormProps<CompanyFormValues>) {
  const methods = useForm<CompanyFormValues>({
    resolver: zodResolver(createCompanySchema as never),
    defaultValues: defaultValues ?? {
      name: '',
      slug: '',
      logo: '',
      isActive: true,
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
          label="ชื่อบริษัท"
          placeholder="เช่น บริษัท อินโนเวชั่น จำกัด"
          control={methods.control}
          required
        />

        <InputField
          name="slug"
          label="รหัสประจำบริษัท (Slug)"
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

        <div className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานบริษัท (Active)"
            description="อนุญาตให้เข้าใช้งานในนามบริษัทนี้ได้"
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
