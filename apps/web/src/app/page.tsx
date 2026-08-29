'use client';
import React from 'react';
import { Button } from '@repo/ui/components/button';
import { useSession } from '@/modules/auth/hooks/session-provider';

export default function Page() {
  const { data, status } = useSession();
  return (
    <div>
      <Button className="mt-auto btn">Bottom Content</Button>
      <pre>{JSON.stringify({ data, status }, null, 2)}</pre>
    </div>
  );
}
