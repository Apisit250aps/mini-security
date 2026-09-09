'use client';

import React, { useCallback } from 'react';
import type { FormTemplate } from '@repo/domains/entities';
import { useFormTemplateUpdate } from '../../hooks/form-mutations';
import FormTemplateForm, { FormTemplateFormValues } from './form-template-form';

interface FormTemplateEditDialogProps {
  companyId: string;
  template: FormTemplate;
  onClose: () => void;
}

export default function FormTemplateEditDialog({
  companyId,
  template,
  onClose,
}: FormTemplateEditDialogProps) {
  const updateMutation = useFormTemplateUpdate(companyId);

  const handleSubmit = useCallback(
    (values: FormTemplateFormValues) => {
      updateMutation.mutate(
        {
          id: template.id,
          data: {
            name: values.name,
            description: values.description || null,
            isActive: values.isActive,
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    },
    [updateMutation, template.id, onClose],
  );

  return (
    <FormTemplateForm
      defaultValues={{
        name: template.name,
        description: template.description || '',
        isActive: template.isActive,
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
      submitLabel="อัปเดตแบบฟอร์ม"
    />
  );
}
