'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CellContext } from '@tanstack/react-table';
import type { FormPlan } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { toast } from '@repo/ui/components/sonner';
import { getErrorMessage } from '@/shared/utils';
import {
  useFormPlanActivate,
  useFormPlanPause,
} from '../../hooks/form-mutations';

interface FormPlanColumnActionsProps<T extends FormPlan> {
  cell: CellContext<T, unknown>;
  organizationId: string;
}

export default function FormPlanColumnActions<T extends FormPlan>({
  cell,
  organizationId,
}: FormPlanColumnActionsProps<T>) {
  const router = useRouter();
  const ui = useOverlay();
  const plan = cell.row.original;

  const activateMutation = useFormPlanActivate(organizationId, plan.id);
  const pauseMutation = useFormPlanPause(organizationId, plan.id);

  const isActive = Boolean(plan.effectiveFrom && !plan.effectiveUntil);

  const handleActivate = useCallback(() => {
    ui.alert.open({
      title: 'ยืนยันการเปิดใช้งานแผนการตรวจ',
      description: `ต้องการเปิดใช้งานแผน "${plan.name}" หรือไม่? ระบบจะเริ่มประมวลผลรอบงานเมื่อถึงเวลาที่กำหนด`,
      confirmVariant: 'default',
      onConfirm: () => {
        activateMutation.mutate(
          { expectedRevision: plan.revision },
          {
            onSuccess: () => {
              ui.alert.close();
            },
            onError: (err) => {
              toast.error(getErrorMessage(err, 'ไม่สามารถเปิดใช้งานแผนได้'));
            },
          },
        );
      },
    });
  }, [ui.alert, plan, activateMutation]);

  const handlePause = useCallback(() => {
    ui.alert.open({
      title: 'ยืนยันการพักแผนการตรวจ',
      description: `ต้องการระงับแผน "${plan.name}" ชั่วคราวหรือไม่? รอบงานใหม่จะไม่ถูกเปิดจนกว่าจะเริ่มใช้งานอีกครั้ง`,
      confirmVariant: 'destructive',
      onConfirm: () => {
        pauseMutation.mutate(
          { expectedRevision: plan.revision },
          {
            onSuccess: () => {
              ui.alert.close();
            },
            onError: (err) => {
              toast.error(getErrorMessage(err, 'ไม่สามารถระงับแผนได้'));
            },
          },
        );
      },
    });
  }, [ui.alert, plan, pauseMutation]);

  const actions: Record<
    string,
    { onAction: () => void; isDestructive?: boolean }
  > = {
    ดูรายละเอียดและการตั้งค่าแผน: {
      onAction: () => router.push(`/organization/forms/plans/${plan.id}`),
    },
  };

  if (!isActive) {
    actions['เปิดใช้งานแผน (Activate)'] = {
      onAction: handleActivate,
    };
  } else {
    actions['พักแผนชั่วคราว (Pause)'] = {
      onAction: handlePause,
      isDestructive: true,
    };
  }

  actions['ดูประวัติรอบงาน'] = {
    onAction: () => router.push(`/organization/forms/plans/${plan.id}`),
  };

  return <ColumnActions actions={actions} />;
}
