'use client';

import React, { useCallback } from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { Plus } from 'lucide-react';
import ScheduleCreateForm from './schedule-create-form';

interface ScheduleCreateActionProps {
  companyId: string;
}

export default function ScheduleCreateAction({
  companyId,
}: ScheduleCreateActionProps) {
  const ui = useOverlay();
  const openCreateDialog = useCallback(() => {
    ui.dialog.open({
      title: 'เพิ่มตารางเวลาเช็คชื่อใหม่',
      description:
        'ตั้งชื่อตารางและเลือกบทบาท จากนั้นจัดการรอบเวลาในรายการตาราง',
      size: 'lg',
      children: (
        <ScheduleCreateForm
          companyId={companyId}
          onSuccess={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, companyId]);

  return (
    <Button onPress={openCreateDialog}>
      <Plus className="w-4 h-4 mr-1" />
      เพิ่มตารางเวลา
    </Button>
  );
}
