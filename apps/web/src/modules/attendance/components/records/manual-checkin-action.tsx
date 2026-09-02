'use client';

import React from 'react';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';
import AttendanceRecordCreateForm from './attendance-record-create-form';

export default function ManualCheckinAction({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();

  const handleOpenCreate = () => {
    ui.dialog.open({
      title: 'บันทึกเวลาทำงานรายวัน',
      description: 'เพิ่มรายการลงเวลาหรือบันทึกเวลาทำงานย้อนหลัง',
      size: 'lg',
      children: <AttendanceRecordCreateForm companyId={companyId} />,
    });
  };

  return (
    <Button onPress={handleOpenCreate} className="gap-2">
      <Plus className="size-4" />
      บันทึกเวลาทำงาน
    </Button>
  );
}
