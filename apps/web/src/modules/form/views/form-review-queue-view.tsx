'use client';

import React from 'react';
import Link from 'next/link';
import { FileCheck, Search } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useReviewQueueQueries } from '../hooks/form-queries';
import { formatDate } from '@/shared/utils/date';

export default function FormReviewQueueView() {
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  
  const queueQuery = useReviewQueueQueries({
    companyId: activeCompanyId || '',
  });

  const isPageLoading = isCompanyLoading || !activeCompanyId || queueQuery.isLoading;
  const submissions = queueQuery.data || [];

  return (
    <PageLayout
      pageId="companyFormReviewQueue"
      title="คิวตรวจ"
      description="รายการแบบฟอร์มที่รอการตรวจอนุมัติ"
      isLoading={isPageLoading}
    >
      <div className="flex flex-col gap-4">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed">
            <Search className="size-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">ไม่พบรายการรอตรวจ</h3>
            <p className="text-sm text-muted-foreground">ไม่มีแบบฟอร์มที่รอการพิจารณาอนุมัติในขณะนี้</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
                    <FileCheck className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{sub.templateName || `แบบฟอร์ม #${sub.id.slice(0, 8)}`}</h4>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <span>ส่งเมื่อ: {sub.submittedAt ? formatDate(sub.submittedAt) : '-'}</span>
                      <span>•</span>
                      <span>โดย: {sub.submitterName || sub.submittedBy || 'ไม่ทราบชื่อ'}</span>
                      <Badge variant="outline">ฉบับที่ {sub.revision}</Badge>
                    </div>
                  </div>
                </div>
                <Link href={`/company/forms/submissions/${sub.id}/review`}>
                  <Button variant="default">
                    ตรวจแบบฟอร์ม
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
