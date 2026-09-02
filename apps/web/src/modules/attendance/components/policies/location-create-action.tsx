'use client';

import React from 'react';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { MapPinPlus } from 'lucide-react';
import LocationForm from './location-form';

export default function LocationCreateAction({
  companyId,
}: {
  companyId: string;
}) {
  const ui = useOverlay();

  const handleOpenCreate = () => {
    ui.dialog.open({
      title: 'เพิ่มสถานที่ลงเวลา (GPS Check-in Location)',
      description: 'กำหนดพิกัดละติจูด/ลองจิจูด และรัศมีสำหรับการเช็คชื่อ',
      size: 'lg',
      children: <LocationForm companyId={companyId} />,
    });
  };

  return (
    <Button variant="outline" onPress={handleOpenCreate} className="gap-2">
      <MapPinPlus className="size-4" />
      เพิ่มสถานที่ลงเวลา
    </Button>
  );
}
