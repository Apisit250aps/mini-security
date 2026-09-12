'use client';
import { useScheduleCreate } from '../../hooks/attendance-mutations';
import ScheduleForm from './schedule-form';

export default function ScheduleCreateForm({
  companyId,
  onSuccess,
}: {
  companyId: string;
  onSuccess: () => void;
}) {
  const mutation = useScheduleCreate(companyId);
  return (
    <ScheduleForm
      companyId={companyId}
      isLoading={mutation.isPending}
      onSubmit={(data) =>
        mutation.mutate({ ...data, companyId }, { onSuccess })
      }
    />
  );
}
