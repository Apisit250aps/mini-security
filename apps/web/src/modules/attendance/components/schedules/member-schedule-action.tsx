'use client';

import React from 'react';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { UserCheck } from 'lucide-react';
import MemberScheduleForm from './member-schedule-form';

export default function MemberScheduleAction({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();

  const handleOpenAssign = () => {
    ui.dialog.open({
      title: 'มอบหมายกะการทำงานให้พนักงาน',
      description: 'เลือกพนักงานและกะการทำงานที่ต้องการให้ปฏิบัติหน้าที่',
      size: 'lg',
      children: <MemberScheduleForm companyId={companyId} />,
    });
  };

  return (
    <Button variant="outline" onPress={handleOpenAssign} className="gap-2">
      <UserCheck className="size-4" />
      มอบหมายกะให้พนักงาน
    </Button>
  );
}
