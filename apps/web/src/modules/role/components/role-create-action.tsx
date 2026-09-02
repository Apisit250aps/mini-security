'use client';

import React from 'react';
import RoleCreateForm from './form/role-create-form';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';

export default function RoleCreateAction({
  companyId,
}: {
  companyId?: string;
}) {
  const ui = useOverlay();
  const createAction = () => {
    ui.dialog.open({
      title: 'เพิ่มบทบาทใหม่',
      description: companyId
        ? 'กำหนดบทบาทและตำแหน่งพนักงานสำหรับองค์กรนี้'
        : 'กรุณากรอกข้อมูลบทบาทใหม่',
      size: 'xl',
      children: <RoleCreateForm companyId={companyId} />,
    });
  };
  return (
    <Button onPress={createAction}>
      <Plus />
      เพิ่มบทบาท
    </Button>
  );
}
