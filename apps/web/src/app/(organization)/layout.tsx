import OrganizationLayout from '@/shared/components/layouts/organization-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OrganizationLayout>{children}</OrganizationLayout>;
}
