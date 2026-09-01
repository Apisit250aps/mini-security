'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPermissionSchema } from '@repo/domains/schema/permission';
import type { FormProps } from '@/types';
import { z } from 'zod';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';

export type PermissionFormValues = z.infer<typeof createPermissionSchema>;

export default function PermissionForm({
  onSubmit,
  defaultValues,
  isLoading,
}: FormProps<PermissionFormValues>) {
  const methods = useForm<PermissionFormValues>({
    resolver: zodResolver(createPermissionSchema as never),
    defaultValues: defaultValues ?? {
      action: '',
      module: '',
      description: '',
    },
  });

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <InputField
          name="module"
          label="โมดูล (Module / Resource)"
          placeholder="เช่น user, company, role"
          control={methods.control}
          required
        />

        <InputField
          name="action"
          label="การกระทำ (Action)"
          placeholder="เช่น create, read, update, delete"
          control={methods.control}
          required
        />

        <TextareaField
          name="description"
          label="คำอธิบาย"
          placeholder="ระบุรายละเอียดของสิทธิ์นี้"
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={isLoading}>
          บันทึก
        </ButtonLoading>
      </div>
    </form>
  );
}
