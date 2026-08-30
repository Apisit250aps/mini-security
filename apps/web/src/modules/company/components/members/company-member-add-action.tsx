'use client';

import React from 'react';
import CompanyMemberAddForm from './company-member-add-form';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { UserPlus } from 'lucide-react';

export default function CompanyMemberAddAction({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();
  const handleAddMember = () => {
    ui.dialog.open({
      title: 'เพิ่มสมาชิก / มอบหมายสิทธิ์',
      description: 'เลือกผู้ใช้งานและมอบหมายบทบาทการทำงานในบริษัทนี้',
      size: 'lg',
      children: <CompanyMemberAddForm companyId={companyId} />,
    });
  };

  return (
    <Button onPress={handleAddMember}>
      <UserPlus />
      เพิ่มสมาชิก
    </Button>
  );
}
