import CompanyLayout from '@/shared/components/layouts/company-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CompanyLayout>{children}</CompanyLayout>;
}
