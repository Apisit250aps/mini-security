'use client';

import React from 'react';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { ShieldCheck } from 'lucide-react';
import RoleScheduleForm from './role-schedule-form';

export default function RoleScheduleAction({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();

  const handleOpenAssign = () => {
    ui.dialog.open({
      title: 'กำหนดกะการทำงานให้ Role',
      description: 'เลือก Role และกะการทำงานที่ต้องการกำหนดให้พนักงานในสังกัด',
      size: 'lg',
      children: <RoleScheduleForm companyId={companyId} />,
    });
  };

  return (
    <Button variant="outline" onPress={handleOpenAssign} className="gap-2">
      <ShieldCheck className="size-4" />
      กำหนดกะให้ Role
    </Button>
  );
}
