'use client';

import React, { useCallback } from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { UserCheck } from 'lucide-react';
import { useAttendanceManualCheckIn } from '../../hooks/attendance-mutations';
import ManualCheckInForm, {
  ManualCheckInFormValues,
} from './manual-check-in-form';

interface ManualCheckInActionProps {
  companyId: string;
}

export default function ManualCheckInAction({
  companyId,
}: ManualCheckInActionProps) {
  const ui = useOverlay();
  const manualMutation = useAttendanceManualCheckIn(companyId);

  const handleSubmit = useCallback(
    (data: ManualCheckInFormValues) => {
      manualMutation.mutate(
        {
          companyMemberId: data.companyMemberId,
          scheduleSlotId: data.scheduleSlotId,
          workDate: data.workDate,
          status: data.status,
          note: data.note || undefined,
        },
        {
          onSuccess: () => {
            ui.dialog.close();
          },
        },
      );
    },
    [manualMutation, ui.dialog],
  );

  const openDialog = useCallback(() => {
    ui.dialog.open({
      title: 'บันทึกเวลาเข้างานแทนพนักงาน (Manual Check-In)',
      description:
        'สำหรับหัวหน้างานหรือแอดมินเพื่อบันทึกหรือแก้ไขสถานะการลงเวลาของพนักงาน',
      size: 'lg',
      children: (
        <ManualCheckInForm
          companyId={companyId}
          isLoading={manualMutation.isPending}
          onSubmit={handleSubmit}
        />
      ),
    });
  }, [ui.dialog, companyId, manualMutation.isPending, handleSubmit]);

  return (
    <Button variant="outline" onPress={openDialog}>
      <UserCheck className="w-4 h-4 mr-1" />
      บันทึกเวลาแทนพนักงาน
    </Button>
  );
}
