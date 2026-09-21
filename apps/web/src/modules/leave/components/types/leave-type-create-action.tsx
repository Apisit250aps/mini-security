'use client';

import React, { useCallback } from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { Plus } from 'lucide-react';
import { useLeaveTypeCreate } from '../../hooks/leave-mutations';
import LeaveTypeForm, { LeaveTypeFormValues } from './leave-type-form';

interface LeaveTypeCreateActionProps {
  organizationId?: string;
}

export default function LeaveTypeCreateAction({
  organizationId,
}: LeaveTypeCreateActionProps) {
  const activeOrgId = organizationId || '';
  const ui = useOverlay();
  const createMutation = useLeaveTypeCreate(activeOrgId);

  const handleSubmit = useCallback(
    (data: LeaveTypeFormValues) => {
      createMutation.mutate(
        {
          organizationId: activeOrgId,
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
    [createMutation, activeOrgId, ui.dialog],
  );

  const openCreateDialog = useCallback(() => {
    ui.dialog.open({
      title: 'เพิ่มประเภทการลาใหม่',
      description: 'กำหนดเงื่อนไขและนโยบายสำหรับประเภทการลาขององค์กร',
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
