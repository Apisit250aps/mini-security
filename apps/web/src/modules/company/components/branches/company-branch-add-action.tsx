'use client';

import React from 'react';
import CompanyBranchAddForm from './company-branch-add-form';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';

export default function CompanyBranchAddAction({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();
  const handleAddBranch = () => {
    ui.dialog.open({
      title: 'เพิ่มสาขาใหม่ (Add Branch)',
      description: 'ระบุชื่อและข้อมูลสถานที่ตั้งของสาขาสำหรับองค์กรนี้',
      size: 'md',
      children: <CompanyBranchAddForm companyId={companyId} />,
    });
  };

  return (
    <Button onPress={handleAddBranch} className="gap-1.5">
      <Plus />
      เพิ่มสาขาใหม่
    </Button>
  );
}
