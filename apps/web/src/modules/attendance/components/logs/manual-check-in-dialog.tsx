'use client';
import { useAttendanceManualCheckIn } from '../../hooks/attendance-mutations';
import ManualCheckInForm from './manual-check-in-form';

export default function ManualCheckInDialog({
  organizationId,
  onSuccess,
}: {
  organizationId?: string;
  onSuccess: () => void;
}) {
  const targetOrgId = organizationId || '';
  const mutation = useAttendanceManualCheckIn(targetOrgId);
  return (
    <ManualCheckInForm
      organizationId={targetOrgId}
      isLoading={mutation.isPending}
      onSubmit={(data) =>
        mutation.mutate(
          {
            organizationId: targetOrgId,
            organizationMemberId: data.organizationMemberId,
            scheduleSlotId: data.scheduleSlotId,
            workDate: data.workDate,
            status: data.status,
            note: data.note || undefined,
          },
          { onSuccess },
        )
      }
    />
  );
}
