'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { RouterProvider } from 'react-aria-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { client } from '@repo/client/gen';
client.setConfig({
  baseURL: '/api',
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </RouterProvider>
  );
}
