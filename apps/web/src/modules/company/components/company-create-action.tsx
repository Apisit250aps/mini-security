'use client';

import React from 'react';
import CompanyCreateForm from './form/company-create-form';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';

export default function CompanyCreateAction() {
  const ui = useOverlay();
  const createAction = () => {
    ui.dialog.open({
      title: 'เพิ่มบริษัทใหม่',
      description: 'กรุณากรอกข้อมูลบริษัทใหม่',
      children: <CompanyCreateForm />,
    });
  };
  return (
    <Button onPress={createAction}>
      <Plus />
      เพิ่มบริษัท
    </Button>
  );
}
