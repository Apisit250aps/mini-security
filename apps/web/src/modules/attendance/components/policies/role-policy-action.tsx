'use client';

import React from 'react';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { ShieldCheck } from 'lucide-react';
import RolePolicyForm from './role-policy-form';

export default function RolePolicyAction({
  companyId,
  policyId,
}: {
  companyId: string;
  policyId?: string;
}) {
  const ui = useOverlay();

  const handleOpenAssign = () => {
    ui.dialog.open({
      title: 'กำหนดนโยบายการลงเวลาให้ Role',
      description: 'เลือก Role ที่ต้องการบังคับใช้นโยบายการลงเวลานี้',
      size: 'lg',
      children: <RolePolicyForm companyId={companyId} policyId={policyId} />,
    });
  };

  return (
    <Button variant="outline" onPress={handleOpenAssign} className="gap-2">
      <ShieldCheck className="size-4" />
      กำหนดนโยบายให้ Role
    </Button>
  );
}
