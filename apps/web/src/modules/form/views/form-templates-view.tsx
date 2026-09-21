'use client';

import React, { useMemo } from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { FileSpreadsheet, CheckCircle2, FileEdit } from 'lucide-react';
import { useOrganizationFormTemplatesQueries } from '../hooks/form-queries';
import FormTemplateDataTable from '../components/template/form-template-data-table';
import FormTemplateCreateAction from '../components/template/form-template-create-action';

export default function FormTemplatesView() {
  const { activeOrganizationId, isLoading } = useActiveOrganization();
  const templatesQuery = useOrganizationFormTemplatesQueries(
    activeOrganizationId || '',
  );
  const templates = useMemo(
    () => templatesQuery.data || [],
    [templatesQuery.data],
  );

  const activeCount = useMemo(
    () => templates.filter((t) => t.isActive).length,
    [templates],
  );
  const inactiveCount = useMemo(
    () => templates.filter((t) => !t.isActive).length,
    [templates],
  );

  const isPageLoading = isLoading || !activeOrganizationId;

  return (
    <PageLayout
      pageId="organizationFormTemplates"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        !isPageLoading ? (
          <FormTemplateCreateAction organizationId={activeOrganizationId} />
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        <DashboardStatsGrid columns={3}>
          <MetricCard
            title="แม่แบบฟอร์มทั้งหมด"
            value={`${templates.length} ฟอร์ม`}
            icon={FileSpreadsheet}
            description="รายการฟอร์มตรวจความปลอดภัยและงานทั่วไป"
          />
          <MetricCard
            title="เปิดใช้งาน (Active)"
            value={`${activeCount} ฟอร์ม`}
            icon={CheckCircle2}
            trend={{
              value: `${activeCount}`,
              isPositive: true,
              label: 'พร้อมให้กรอก',
            }}
            description="ฟอร์มที่เปิดให้พนักงานในกะสามารถกรอกได้"
          />
          <MetricCard
            title="ฉบับร่าง/ปิดใช้งาน"
            value={`${inactiveCount} ฟอร์ม`}
            icon={FileEdit}
            description="ฟอร์มที่อยู่ระหว่างแก้ไขหรือพักการใช้งาน"
          />
        </DashboardStatsGrid>

        <FormTemplateDataTable organizationId={activeOrganizationId} />
      </div>
    </PageLayout>
  );
}
