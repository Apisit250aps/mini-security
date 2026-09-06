'use client';

import React from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { Plus } from 'lucide-react';
import { useScheduleCreate } from '../../hooks/attendance-mutations';
import ScheduleForm, { ScheduleFormValues } from './schedule-form';

interface ScheduleCreateActionProps {
  companyId: string;
}

export default function ScheduleCreateAction({
  companyId,
}: ScheduleCreateActionProps) {
  const ui = useOverlay();
  const createMutation = useScheduleCreate(companyId);

  const openCreateDialog = () => {
    ui.dialog.open({
      title: 'เพิ่มตารางเวลาเช็คชื่อใหม่',
      description: 'กำหนดบทบาทและเงื่อนไขของตารางเวลาเข้างาน',
      size: 'lg',
      children: (
        <ScheduleForm
          companyId={companyId}
          isLoading={createMutation.isPending}
          onSubmit={(data: ScheduleFormValues) => {
            createMutation.mutate(
              {
                companyId,
                name: data.name,
                roleId: data.roleId,
                isActive: data.isActive,
              },
              {
                onSuccess: () => {
                  ui.dialog.close();
                },
              },
            );
          }}
        />
      ),
    });
  };

  return (
    <Button onPress={openCreateDialog}>
      <Plus className="w-4 h-4 mr-1" />
      เพิ่มตารางเวลา
    </Button>
  );
}
