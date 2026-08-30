'use client';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { client } from '@repo/client/gen';

const queryClient = new QueryClient();

const ClientWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const q = useQuery({
    queryKey: ['TOKEN'],
    queryFn: async (): Promise<{ token: string }> => {
      const res = await fetch('/api/auth/token');
      const data = await res.json();

      return data;
    },
  });

  client.setConfig({
    baseURL: '/api',
    headers: {
      Authorization: `Bearer ${q.data?.token}`,
    },
  });
  return <>{children}</>;
};

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientWrapper>{children}</ClientWrapper>
    </QueryClientProvider>
  );
}
