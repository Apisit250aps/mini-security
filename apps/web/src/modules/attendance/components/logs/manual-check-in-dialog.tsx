'use client';
import { useAttendanceManualCheckIn } from '../../hooks/attendance-mutations';
import ManualCheckInForm from './manual-check-in-form';

export default function ManualCheckInDialog({
  companyId,
  onSuccess,
}: {
  companyId: string;
  onSuccess: () => void;
}) {
  const mutation = useAttendanceManualCheckIn(companyId);
  return (
    <ManualCheckInForm
      companyId={companyId}
      isLoading={mutation.isPending}
      onSubmit={(data) =>
        mutation.mutate(
          {
            companyMemberId: data.companyMemberId,
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
