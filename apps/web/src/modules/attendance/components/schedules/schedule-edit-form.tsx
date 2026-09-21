'use client';
import type { CheckInSchedule } from '@repo/client';
import { useScheduleUpdate } from '../../hooks/attendance-mutations';
import ScheduleForm from './schedule-form';

export default function ScheduleEditForm({
  schedule,
  onSuccess,
}: {
  schedule: CheckInSchedule;
  onSuccess: () => void;
}) {
  const mutation = useScheduleUpdate(schedule.organizationId);
  return (
    <ScheduleForm
      organizationId={schedule.organizationId}
      isLoading={mutation.isPending}
      defaultValues={{
        name: schedule.name,
        roleIds: schedule.roleIds,
        isActive: schedule.isActive,
      }}
      onSubmit={(data) =>
        mutation.mutate({ id: schedule.id, data }, { onSuccess })
      }
    />
  );
}
