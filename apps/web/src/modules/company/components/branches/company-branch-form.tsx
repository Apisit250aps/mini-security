'use client';

import { InputField, SwitchField } from '@repo/ui/form';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCompanyBranchSchema } from '@repo/domains/schema/company';
import type { FormProps } from '@/types';
import { z } from 'zod';

import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';

export type CompanyBranchFormValues = z.infer<typeof createCompanyBranchSchema>;

export default function CompanyBranchForm({
  onSubmit,
  defaultValues,
  isLoading,
}: FormProps<CompanyBranchFormValues>) {
  const methods = useForm<CompanyBranchFormValues>({
    resolver: zodResolver(createCompanyBranchSchema as never),
    defaultValues: defaultValues ?? {
      companyId: '',
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
          label="ชื่อสาขา"
          placeholder="เช่น สำนักงานใหญ่, สาขาพัทยา, สาขาเชียงใหม่"
          control={methods.control}
          required
        />

        <InputField
          name="address"
          label="ที่อยู่ / สถานที่ตั้งสาขา"
          placeholder="ระบุที่อยู่ของสาขา (ถ้ามี)"
          control={methods.control}
        />

        <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานสาขา (Active)"
            description="อนุญาตให้พนักงานสังกัดและปฏิบัติงานที่สาขานี้ได้"
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
