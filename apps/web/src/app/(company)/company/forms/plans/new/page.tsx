'use client';

import React, { Suspense } from 'react';
import FormPlanWizardView from '@/modules/form/views/form-plan-wizard-view';
import { Spinner } from '@repo/ui/components/spinner';

export default function PlanCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      }
    >
      <FormPlanWizardView />
    </Suspense>
  );
}
