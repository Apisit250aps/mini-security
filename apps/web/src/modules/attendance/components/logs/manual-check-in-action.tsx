'use client';

import React, { useCallback } from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { UserCheck } from 'lucide-react';
import ManualCheckInDialog from './manual-check-in-dialog';

interface ManualCheckInActionProps {
  companyId: string;
}

export default function ManualCheckInAction({
  companyId,
}: ManualCheckInActionProps) {
  const ui = useOverlay();
  const openDialog = useCallback(() => {
    ui.dialog.open({
      title: 'บันทึกเวลาเข้างานแทนพนักงาน (Manual Check-In)',
      description:
        'สำหรับหัวหน้างานหรือแอดมินเพื่อบันทึกหรือแก้ไขสถานะการลงเวลาของพนักงาน',
      size: 'lg',
      children: (
        <ManualCheckInDialog
          companyId={companyId}
          onSuccess={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, companyId]);

  return (
    <Button variant="outline" onPress={openDialog}>
      <UserCheck className="w-4 h-4 mr-1" />
      บันทึกเวลาแทนพนักงาน
    </Button>
  );
}
