import CompanyLocationsView from '@/modules/location/views/company-locations-view';
import CompanyFeatureGuard from '@/shared/components/guards/company-feature-guard';

export default function Page() {
  return (
    <CompanyFeatureGuard featureCode="ATTENDANCE_MANAGEMENT">
      <CompanyLocationsView />
    </CompanyFeatureGuard>
  );
}
