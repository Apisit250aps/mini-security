'use client';

import {
  OptionsSelect,
  type OptionsSelectProps,
} from '@/shared/components/form/options-select';
import { useAttendanceLocationsQueries } from '../../hooks/attendance-queries';

export function AttendanceLocationSelect({
  companyId,
  excludeIds,
  ...props
}: Omit<OptionsSelectProps, 'options' | 'isLoading' | 'loadError'> & {
  companyId: string;
  excludeIds: Set<string>;
}) {
  const query = useAttendanceLocationsQueries(companyId);
  return (
    <OptionsSelect
      {...props}
      isLoading={query.isLoading}
      loadError={query.isError}
      options={(query.data ?? [])
        .filter((location) => !excludeIds.has(location.id))
        .map((location) => ({
          value: location.id,
          label: `${location.name} (${location.locationType} - ${location.radiusMeters ?? 0}m)`,
        }))}
    />
  );
}
