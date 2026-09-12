'use client';
import type { CheckInSchedule } from '@repo/domains/entities/attendance';
import { useScheduleUpdate } from '../../hooks/attendance-mutations';
import ScheduleForm from './schedule-form';

export default function ScheduleEditForm({
  schedule,
  onSuccess,
}: {
  schedule: CheckInSchedule;
  onSuccess: () => void;
}) {
  const mutation = useScheduleUpdate(schedule.companyId);
  return (
    <ScheduleForm
      companyId={schedule.companyId}
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
