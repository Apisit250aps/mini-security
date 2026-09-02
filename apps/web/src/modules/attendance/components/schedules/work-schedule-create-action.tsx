'use client';

import React from 'react';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';
import WorkScheduleForm from './work-schedule-form';

export default function WorkScheduleCreateAction({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();

  const handleOpenCreate = () => {
    ui.dialog.open({
      title: 'สร้างตารางเวลาทำงานใหม่',
      description: 'กำหนดกลุ่มตารางเวลาเพื่อสร้างกะการทำงาน',
      size: 'lg',
      children: <WorkScheduleForm companyId={companyId} />,
    });
  };

  return (
    <Button onPress={handleOpenCreate} className="gap-2">
      <Plus className="size-4" />
      สร้างตารางเวลาใหม่
    </Button>
  );
}
