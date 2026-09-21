'use client';
import { useScheduleCreate } from '../../hooks/attendance-mutations';
import ScheduleForm from './schedule-form';

export default function ScheduleCreateForm({
  organizationId,
  onSuccess,
}: {
  organizationId?: string;
  onSuccess: () => void;
}) {
  const targetOrgId = organizationId || '';
  const mutation = useScheduleCreate(targetOrgId);
  return (
    <ScheduleForm
      organizationId={targetOrgId}
      isLoading={mutation.isPending}
      onSubmit={(data) =>
        mutation.mutate({ ...data, organizationId: targetOrgId }, { onSuccess })
      }
    />
  );
}
