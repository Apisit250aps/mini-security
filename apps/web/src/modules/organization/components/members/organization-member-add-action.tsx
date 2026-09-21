'use client';

import React, { useCallback } from 'react';
import OrganizationMemberAddForm from './organization-member-add-form';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { UserPlus } from 'lucide-react';

export default function OrganizationMemberAddAction({
  organizationId,
}: {
  organizationId?: string;
}) {
  const orgId = organizationId || '';
  const ui = useOverlay();
  const handleAddMember = useCallback(() => {
    ui.dialog.open({
      title: 'เพิ่มสมาชิก / มอบหมายสิทธิ์',
      description: 'เลือกผู้ใช้งานและมอบหมายบทบาทการทำงานในองค์กรนี้',
      size: 'lg',
      children: <OrganizationMemberAddForm organizationId={orgId} />,
    });
  }, [ui.dialog, orgId]);

  return (
    <Button onPress={handleAddMember}>
      <UserPlus />
      เพิ่มสมาชิก
    </Button>
  );
}
