'use client';

import React from 'react';
import SiteAddForm from './site-add-form';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';

export default function SiteAddAction({
  organizationId,
}: {
  organizationId?: string;
}) {
  const orgId = organizationId || '';
  const ui = useOverlay();
  const handleAddSite = () => {
    ui.dialog.open({
      title: 'เพิ่มไซต์ใหม่ (Add Site)',
      description: 'ระบุชื่อและข้อมูลสถานที่ตั้งของไซต์สำหรับองค์กรนี้',
      size: 'md',
      children: <SiteAddForm organizationId={orgId} />,
    });
  };

  return (
    <Button onPress={handleAddSite} className="gap-1.5">
      <Plus />
      เพิ่มไซต์ใหม่
    </Button>
  );
}
