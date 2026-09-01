import AdminLayout from '@/shared/components/layouts/admin-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
