'use client';

import React, { useState, useMemo } from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useCompanyListQueries } from '@/modules/company/hooks/company-queries';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@repo/ui/components/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@repo/ui/components/card';
import { CalendarRange, Sliders } from 'lucide-react';
import LeaveRequestDataTable from '../components/requests/leave-request-data-table';
import LeaveRequestSubmitAction from '../components/requests/leave-request-submit-action';
import LeaveTypeDataTable from '../components/types/leave-type-data-table';
import LeaveTypeCreateAction from '../components/types/leave-type-create-action';

export default function AdminLeaveView() {
  const companiesQuery = useCompanyListQueries();
  const companies = useMemo(
    () => companiesQuery.data || [],
    [companiesQuery.data],
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  const activeCompanyId = selectedCompanyId || companies[0]?.id || '';
  const selectedCompany = companies.find((c) => c.id === activeCompanyId);

  return (
    <PageLayout
      pageId="adminLeave"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              เลือกองค์กร:
            </span>
            <select
              value={activeCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="h-9 px-3 rounded-md border text-sm bg-background"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    >
      {!activeCompanyId ? (
        <div className="p-12 text-center text-muted-foreground">
          ไม่พบบริษัทในระบบ
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold text-lg">{selectedCompany?.name}</h2>
            <p className="text-xs text-muted-foreground">
              รหัสประจำบริษัท: {selectedCompany?.slug} | ID: {activeCompanyId}
            </p>
          </div>

          <Tabs defaultSelectedKey="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger id="requests" className="gap-2">
                <CalendarRange className="size-4" />
                คำขอลาหยุดงาน (Requests)
              </TabsTrigger>
              <TabsTrigger id="types" className="gap-2">
                <Sliders className="size-4" />
                ประเภทและนโยบายการลา (Types)
              </TabsTrigger>
            </TabsList>

            <TabsContent id="requests" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>รายการคำขอลาหยุดงาน</CardTitle>
                    <CardDescription>
                      คำขอลาทั้งหมดของพนักงานในบริษัทนี้
                    </CardDescription>
                  </div>
                  <CardAction>
                    <LeaveRequestSubmitAction companyId={activeCompanyId} />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <LeaveRequestDataTable companyId={activeCompanyId} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent id="types" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>ประเภทการลาและโควต้า</CardTitle>
                    <CardDescription>
                      นโยบายการลาและโควต้าวันลาประจำปีของบริษัทนี้
                    </CardDescription>
                  </div>
                  <CardAction>
                    <LeaveTypeCreateAction companyId={activeCompanyId} />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <LeaveTypeDataTable companyId={activeCompanyId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </PageLayout>
  );
}
