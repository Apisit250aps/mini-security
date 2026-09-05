'use client';

import {
  OptionsSelect,
  type OptionsSelectProps,
} from '@/shared/components/form/options-select';
import { useWorkSchedulesQueries } from '../../hooks/attendance-queries';

export function WorkScheduleSelect({
  companyId,
  ...props
}: Omit<OptionsSelectProps, 'options' | 'isLoading' | 'loadError'> & {
  companyId: string;
}) {
  const query = useWorkSchedulesQueries(companyId);
  return (
    <OptionsSelect
      {...props}
      isLoading={query.isLoading}
      loadError={query.isError}
      options={(query.data ?? []).map((schedule) => ({
        value: schedule.id,
        label: schedule.name,
      }))}
    />
  );
}
