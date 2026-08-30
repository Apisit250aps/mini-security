'use client';

import React from 'react';
import PermissionCreateForm from './form/permission-create-form';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';

export default function PermissionCreateAction() {
  const ui = useOverlay();
  const createAction = () => {
    ui.dialog.open({
      title: 'เพิ่มสิทธิ์ใหม่',
      description: 'กรุณากรอกข้อมูลสิทธิ์ใหม่',
      children: <PermissionCreateForm />,
    });
  };
  return (
    <Button onPress={createAction}>
      <Plus />
      เพิ่มสิทธิ์
    </Button>
  );
}
