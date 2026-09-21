'use client';

import React from 'react';
import OrganizationCreateForm from './form/organization-create-form';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';

export default function OrganizationCreateAction() {
  const ui = useOverlay();
  const createAction = () => {
    ui.dialog.open({
      title: 'เพิ่มองค์กรใหม่',
      description: 'กรุณากรอกข้อมูลองค์กรใหม่',
      children: <OrganizationCreateForm />,
    });
  };
  return (
    <Button onPress={createAction}>
      <Plus />
      เพิ่มองค์กร
    </Button>
  );
}
