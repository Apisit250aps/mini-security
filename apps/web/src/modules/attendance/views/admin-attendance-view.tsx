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
import { Clock, CalendarCheck2 } from 'lucide-react';
import ScheduleDataTable from '../components/schedules/schedule-data-table';
import ScheduleCreateAction from '../components/schedules/schedule-create-action';
import AttendanceLogDataTable from '../components/logs/attendance-log-data-table';
import ManualCheckInAction from '../components/logs/manual-check-in-action';

export default function AdminAttendanceView() {
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
      pageId="adminAttendance"
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

          <Tabs defaultSelectedKey="schedules" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger id="schedules" className="gap-2">
                <Clock className="size-4" />
                ตารางเวลาเข้างาน (Schedules)
              </TabsTrigger>
              <TabsTrigger id="logs" className="gap-2">
                <CalendarCheck2 className="size-4" />
                ประวัติการลงเวลา (Logs)
              </TabsTrigger>
            </TabsList>

            <TabsContent id="schedules" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>ตารางเวลาเช็คชื่อ</CardTitle>
                    <CardDescription>
                      ตารางเวลาและรอบการลงเวลาที่ผูกกับบทบาทของบริษัทนี้
                    </CardDescription>
                  </div>
                  <CardAction>
                    <ScheduleCreateAction companyId={activeCompanyId} />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <ScheduleDataTable companyId={activeCompanyId} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent id="logs" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>บันทึกเวลาเข้างาน</CardTitle>
                    <CardDescription>
                      ประวัติการลงเวลาและการเข้างานของพนักงานในองค์กร
                    </CardDescription>
                  </div>
                  <CardAction>
                    <ManualCheckInAction companyId={activeCompanyId} />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <AttendanceLogDataTable companyId={activeCompanyId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </PageLayout>
  );
}
