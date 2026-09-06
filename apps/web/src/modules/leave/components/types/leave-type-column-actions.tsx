'use client';

import React from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { LeaveType } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { useLeaveTypeUpdate } from '../../hooks/leave-mutations';
import LeaveTypeForm, { LeaveTypeFormValues } from './leave-type-form';

interface LeaveTypeColumnActionsProps<T extends LeaveType> {
  cell: CellContext<T, unknown>;
  companyId: string;
}

export default function LeaveTypeColumnActions<T extends LeaveType>({
  cell,
  companyId,
}: LeaveTypeColumnActionsProps<T>) {
  const ui = useOverlay();
  const updateMutation = useLeaveTypeUpdate(companyId);
  const leaveType = cell.row.original;

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขประเภทการลา',
      description: 'ปรับปรุงเงื่อนไข โควต้า และสถานะของประเภทการลา',
      size: 'lg',
      children: (
        <LeaveTypeForm
          isLoading={updateMutation.isPending}
          defaultValues={{
            name: leaveType.name,
            description: leaveType.description || '',
            unit: leaveType.unit,
            requiresProof: leaveType.requiresProof,
            maxDaysPerYear: leaveType.maxDaysPerYear ?? null,
            isPaid: leaveType.isPaid,
            isActive: leaveType.isActive,
          }}
          onSubmit={(data: LeaveTypeFormValues) => {
            updateMutation.mutate(
              {
                id: leaveType.id,
                data: {
                  name: data.name,
                  description: data.description || null,
                  unit: data.unit,
                  requiresProof: data.requiresProof,
                  maxDaysPerYear: data.maxDaysPerYear ?? null,
                  isPaid: data.isPaid,
                  isActive: data.isActive,
                },
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
    <ColumnActions
      actions={{
        แก้ไข: {
          onAction: actionEdit,
        },
      }}
    />
  );
}
