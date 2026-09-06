'use client';

import React from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { FilePlus2 } from 'lucide-react';
import { useLeaveRequestSubmit } from '../../hooks/leave-mutations';
import LeaveRequestForm, { LeaveRequestFormValues } from './leave-request-form';

interface LeaveRequestSubmitActionProps {
  companyId: string;
}

export default function LeaveRequestSubmitAction({
  companyId,
}: LeaveRequestSubmitActionProps) {
  const ui = useOverlay();
  const submitMutation = useLeaveRequestSubmit(companyId);

  const openDialog = () => {
    ui.dialog.open({
      title: 'ยื่นคำขอลาหยุดงาน',
      description: 'กรอกรายละเอียดการลา ช่วงวันที่ และเหตุผลความจำเป็น',
      size: 'lg',
      children: (
        <LeaveRequestForm
          companyId={companyId}
          isLoading={submitMutation.isPending}
          onSubmit={(data: LeaveRequestFormValues) => {
            submitMutation.mutate(
              {
                companyMemberId: data.companyMemberId,
                leaveTypeId: data.leaveTypeId,
                startDate: data.startDate,
                endDate: data.endDate,
                totalDays: data.totalDays,
                unit: data.unit,
                reason: data.reason,
                proofUrl: data.proofUrl || null,
              },
              {
                onSuccess: () => {
                  ui.dialog.close();
                },
              },
            );
          }}
        />
      ),
    });
  };

  return (
    <Button onPress={openDialog}>
      <FilePlus2 className="w-4 h-4 mr-1" />
      ยื่นคำขอลา
    </Button>
  );
}
