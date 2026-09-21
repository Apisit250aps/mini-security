'use client';
import { useCallback } from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { LogIn } from 'lucide-react';
import CheckInForm from './check-in-form';

interface CheckInActionProps {
  organizationId?: string;
}

export default function CheckInAction({ organizationId }: CheckInActionProps) {
  const targetOrgId = organizationId || '';
  const ui = useOverlay();

  const openDialog = useCallback(() => {
    ui.dialog.open({
      title: 'เช็คชื่อลงเวลาเข้างาน (Check In)',
      description: 'เลือกรอบเวลาและบันทึกเวลาเข้าทำงานประจำวัน',
      children: (
        <CheckInForm
          organizationId={targetOrgId}
          onSuccess={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, targetOrgId]);

  return (
    <Button onPress={openDialog}>
      <LogIn className="w-4 h-4 mr-1" />
      ลงชื่อเข้างาน
    </Button>
  );
}
