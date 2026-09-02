'use client';

import React from 'react';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';
import PolicyForm from './policy-form';

export default function PolicyCreateAction({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();

  const handleOpenCreate = () => {
    ui.dialog.open({
      title: 'สร้างนโยบายการลงเวลาใหม่',
      description: 'กำหนดกลุ่มนโยบายและเงื่อนไข Checkpoint สำหรับพนักงาน',
      size: 'lg',
      children: <PolicyForm companyId={companyId} />,
    });
  };

  return (
    <Button onPress={handleOpenCreate} className="gap-2">
      <Plus className="size-4" />
      สร้างนโยบายใหม่
    </Button>
  );
}
