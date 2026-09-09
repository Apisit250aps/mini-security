'use client';

import React, { useCallback } from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { Plus } from 'lucide-react';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useFormTemplateCreate } from '../../hooks/form-mutations';
import FormTemplateForm, { FormTemplateFormValues } from './form-template-form';

interface FormTemplateCreateActionProps {
  companyId: string;
}

export default function FormTemplateCreateAction({
  companyId,
}: FormTemplateCreateActionProps) {
  const ui = useOverlay();
  const createMutation = useFormTemplateCreate(companyId);

  const { data: session } = useSession();
  const membersQuery = useCompanyMembersQueries(companyId);
  const currentMember = membersQuery.data?.find(
    (m) => m.userId === session?.user.id && m.isActive,
  );
  const createdBy = currentMember?.id || session?.user.id || '';

  const handleSubmit = useCallback(
    (values: FormTemplateFormValues) => {
      createMutation.mutate(
        {
          companyId,
          name: values.name,
          description: values.description || null,
          isActive: values.isActive ?? true,
          createdBy,
        },
        {
          onSuccess: () => {
            ui.dialog.close();
          },
        },
      );
    },
    [createMutation, companyId, createdBy, ui.dialog],
  );

  const openDialog = useCallback(() => {
    ui.dialog.open({
      title: 'สร้างเทมเพลตแบบฟอร์มใหม่',
      description:
        'กำหนดชื่อและคำอธิบายสำหรับแบบฟอร์มเพื่อเริ่มออกแบบฟิลด์คำถาม',
      size: 'lg',
      children: (
        <FormTemplateForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          submitLabel="สร้างแบบฟอร์ม"
        />
      ),
    });
  }, [ui.dialog, handleSubmit, createMutation.isPending]);

  return (
    <Button onPress={openDialog}>
      <Plus className="w-4 h-4 mr-1" />
      สร้างแบบฟอร์มใหม่
    </Button>
  );
}
