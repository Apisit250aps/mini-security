'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';

export default function RoleCreateAction({
  organizationId,
}: {
  organizationId?: string;
}) {
  const orgId = organizationId;
  const router = useRouter();
  const createAction = () => {
    if (orgId) {
      router.push('/organization/role/new');
    } else {
      router.push('/admin/role/new');
    }
  };
  return (
    <Button onPress={createAction}>
      <Plus />
      เพิ่มบทบาท
    </Button>
  );
}
