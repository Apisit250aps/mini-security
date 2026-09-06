'use client';

import React, { useCallback } from 'react';
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

  const handleSubmit = useCallback(
    (data: LeaveTypeFormValues) => {
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
    },
    [createMutation, companyId, ui.dialog],
  );

  const openCreateDialog = useCallback(() => {
    ui.dialog.open({
      title: 'เพิ่มประเภทการลาใหม่',
      description: 'กำหนดเงื่อนไขและนโยบายสำหรับประเภทการลาของบริษัท',
      size: 'lg',
      children: (
        <LeaveTypeForm
          isLoading={createMutation.isPending}
          onSubmit={handleSubmit}
        />
      ),
    });
  }, [ui.dialog, createMutation.isPending, handleSubmit]);

  return (
    <Button onPress={openCreateDialog}>
      <Plus className="w-4 h-4 mr-1" />
      เพิ่มประเภทการลา
    </Button>
  );
}
