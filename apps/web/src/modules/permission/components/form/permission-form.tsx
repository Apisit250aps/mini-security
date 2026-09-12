'use client';

import { InputField, TextareaField } from '@repo/ui/form';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPermissionSchema,
  updatePermissionSchema,
} from '@repo/domains/schema/permission';
import type { FormProps } from '@/types';
import { z } from 'zod';

import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';

export type PermissionFormValues = z.infer<typeof createPermissionSchema>;

interface PermissionFormProps extends FormProps<PermissionFormValues> {
  hideModuleAndAction?: boolean;
}

export default function PermissionForm({
  onSubmit,
  defaultValues,
  isLoading,
  hideModuleAndAction = false,
}: PermissionFormProps) {
  const methods = useForm<PermissionFormValues>({
    resolver: zodResolver(
      (hideModuleAndAction
        ? updatePermissionSchema
        : createPermissionSchema) as never,
    ),
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
        {!hideModuleAndAction && (
          <>
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
          </>
        )}

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
