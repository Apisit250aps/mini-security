'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';

export default function RoleCreateAction({
  companyId,
}: {
  companyId?: string;
}) {
  const router = useRouter();
  const createAction = () => {
    if (companyId) {
      router.push('/company/role/new');
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
