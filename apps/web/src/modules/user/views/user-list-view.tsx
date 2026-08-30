'use client';
import React from 'react';
import UserDataTable from '../components/table/user-data-table';
import UserCreateForm from '../components/form/user-create-form';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';

export default function UserListView() {
  const ui = useOverlay();
  const createAction = () => {
    ui.dialog.open({
      title: 'เพิ่มผู้ใช้',
      description: 'กรุณากรอกข้อมูลผู้ใช้ใหม่',
      children: <UserCreateForm />,
    });
  };

  return (
    <PageLayout
      pageId="user"
      actions={<Button onPress={createAction}>เพิ่มผู้ใช้</Button>}
    >
      <UserDataTable />
    </PageLayout>
  );
}
