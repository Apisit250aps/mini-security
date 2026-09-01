'use client';
import React from 'react';
import UserCreateForm from '../components/form/user-create-form';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';

export default function UserCreateAction() {
  const ui = useOverlay();
  const createAction = () => {
    ui.dialog.open({
      title: 'เพิ่มผู้ใช้',
      description: 'กรุณากรอกข้อมูลผู้ใช้ใหม่',
      children: <UserCreateForm />,
    });
  };
  return (
    <Button onPress={createAction}>
      <Plus />
      เพิ่มผู้ใช้
    </Button>
  );
}
