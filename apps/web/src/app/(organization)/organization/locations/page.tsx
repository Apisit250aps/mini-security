'use client';

import OrganizationLocationsView from '@/modules/location/views/organization-locations-view';
import OrganizationFeatureGuard from '@/shared/components/guards/organization-feature-guard';

export default function Page() {
  return (
    <OrganizationFeatureGuard featureCode="ATTENDANCE_MANAGEMENT">
      <OrganizationLocationsView />
    </OrganizationFeatureGuard>
  );
}
