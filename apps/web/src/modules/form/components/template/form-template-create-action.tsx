'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';
import { buildPageUrl } from '@/shared/utils';

interface FormTemplateCreateActionProps {
  companyId?: string;
}

export default function FormTemplateCreateAction({
  companyId: _companyId,
}: FormTemplateCreateActionProps) {
  return (
    <Link href={buildPageUrl('companyFormCreate')}>
      <Button>
        <Plus className="w-4 h-4 mr-1" />
        สร้างแบบฟอร์มใหม่
      </Button>
    </Link>
  );
}
