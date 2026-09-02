'use client';

import React from 'react';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';
import LeaveForm from './leave-form';

export default function LeaveCreateAction({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();

  const handleOpenCreate = () => {
    ui.dialog.open({
      title: 'ยื่นคำขอลาหยุดงาน',
      description: 'กรอกข้อมูลประเภทการลาและช่วงเวลาที่ต้องการขอลา',
      size: 'lg',
      children: <LeaveForm companyId={companyId} />,
    });
  };

  return (
    <Button onPress={handleOpenCreate} className="gap-2">
      <Plus className="size-4" />
      ยื่นคำขอลา
    </Button>
  );
}
