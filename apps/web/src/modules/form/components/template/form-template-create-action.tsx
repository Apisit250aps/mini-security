'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';
import { buildPageUrl } from '@/shared/utils';

interface FormTemplateCreateActionProps {
  organizationId?: string;
}

export default function FormTemplateCreateAction({
  organizationId: _organizationId,
}: FormTemplateCreateActionProps) {
  return (
    <Link href={buildPageUrl('organizationFormCreate')}>
      <Button>
        <Plus className="w-4 h-4 mr-1" />
        สร้างแบบฟอร์มใหม่
      </Button>
    </Link>
  );
}
