'use client';

import { useSession } from '@/modules/auth/hooks/session-provider';
import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const session = useSession();
  console.log(session);
  return children;
}
