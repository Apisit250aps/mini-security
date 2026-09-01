import auth from '@repo/infrastructures/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.isAdmin) {
    redirect('/admin');
  }

  if (session) {
    redirect('/');
  }

  return <>{children}</>;
}
