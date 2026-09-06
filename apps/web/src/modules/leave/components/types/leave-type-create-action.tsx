'use client';

import React from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { Plus } from 'lucide-react';
import { useLeaveTypeCreate } from '../../hooks/leave-mutations';
import LeaveTypeForm, { LeaveTypeFormValues } from './leave-type-form';

interface LeaveTypeCreateActionProps {
  companyId: string;
}

export default function LeaveTypeCreateAction({
  companyId,
}: LeaveTypeCreateActionProps) {
  const ui = useOverlay();
  const createMutation = useLeaveTypeCreate(companyId);

  const openCreateDialog = () => {
    ui.dialog.open({
      title: 'เพิ่มประเภทการลาใหม่',
      description: 'กำหนดเงื่อนไขและนโยบายสำหรับประเภทการลาของบริษัท',
      size: 'lg',
      children: (
        <LeaveTypeForm
          isLoading={createMutation.isPending}
          onSubmit={(data: LeaveTypeFormValues) => {
            createMutation.mutate(
              {
                companyId,
                name: data.name,
                description: data.description || null,
                unit: data.unit,
                requiresProof: data.requiresProof,
                maxDaysPerYear: data.maxDaysPerYear ?? null,
                isPaid: data.isPaid,
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
      เพิ่มประเภทการลา
    </Button>
  );
}
