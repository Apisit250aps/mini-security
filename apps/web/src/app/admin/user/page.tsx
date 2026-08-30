'use client';
import PageLayout from '@/shared/components/layouts/page-layout';
import { userServicesGetUsers } from '@repo/client';
import { useQuery } from '@tanstack/react-query';

export default function UserPage() {
  const query = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userServicesGetUsers();
      return response;
    },
  });
  return <PageLayout pageId="user"></PageLayout>;
}
