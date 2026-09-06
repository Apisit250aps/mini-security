import { getCachedSession } from '@/modules/auth/lib/get-cached-session';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();

  if (session?.user.isAdmin) {
    redirect('/admin');
  }

  if (session) {
    redirect('/');
  }

  return <>{children}</>;
}
