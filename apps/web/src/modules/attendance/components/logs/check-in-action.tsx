'use client';
import { useCallback } from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { LogIn } from 'lucide-react';
import CheckInForm from './check-in-form';
interface CheckInActionProps {
  companyId: string;
}

export default function CheckInAction({ companyId }: CheckInActionProps) {
  const ui = useOverlay();

  const openDialog = useCallback(() => {
    ui.dialog.open({
      title: 'เช็คชื่อลงเวลาเข้างาน (Check In)',
      description: 'เลือกรอบเวลาและบันทึกเวลาเข้าทำงานประจำวัน',
      children: (
        <CheckInForm
          companyId={companyId}
          onSuccess={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, companyId]);

  return (
    <Button onPress={openDialog}>
      <LogIn className="w-4 h-4 mr-1" />
      ลงชื่อเข้างาน
    </Button>
  );
}
