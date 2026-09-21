'use client';

import React, { useState, useMemo } from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useOrganizationListQueries } from '@/modules/organization/hooks/organization-queries';
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
import { Clock, CalendarCheck2, CalendarRange, Building2 } from 'lucide-react';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { useGetCheckInSchedulesByOrganization } from '../hooks/attendance-queries';
import ScheduleDataTable from '../components/schedules/schedule-data-table';
import ScheduleCreateAction from '../components/schedules/schedule-create-action';
import AttendanceLogDataTable from '../components/logs/attendance-log-data-table';
import ManualCheckInAction from '../components/logs/manual-check-in-action';

export default function AdminAttendanceView() {
  const organizationsQuery = useOrganizationListQueries();
  const organizations = useMemo(
    () => organizationsQuery.data || [],
    [organizationsQuery.data],
  );

  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  const activeOrganizationId = selectedOrgId || organizations[0]?.id || '';
  const selectedOrg = organizations.find((c) => c.id === activeOrganizationId);
  const schedulesQuery =
    useGetCheckInSchedulesByOrganization(activeOrganizationId);
  const schedulesCount = schedulesQuery.data?.length || 0;

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
              value={activeOrganizationId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="h-9 px-3 rounded-md border text-sm bg-background"
            >
              {organizations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    >
      {!activeOrganizationId ? (
        <div className="p-12 text-center text-muted-foreground">
          ไม่พบองค์กรในระบบ
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top Metric Cards */}
          <DashboardStatsGrid columns={3}>
            <MetricCard
              title="องค์กรปัจจุบัน"
              value={selectedOrg?.name || '-'}
              icon={Building2}
              description={`Slug: ${selectedOrg?.slug || '-'}`}
            />
            <MetricCard
              title="ตารางกะ / เวลาเข้างาน"
              value={`${schedulesCount} กะ`}
              icon={CalendarRange}
              description="ตารางเวลาที่เปิดใช้งานในองค์กร"
            />
            <MetricCard
              title="ระบบบันทึกเวลา"
              value="พร้อมบันทึก"
              icon={Clock}
              trend={{
                value: 'Online',
                isPositive: true,
                label: 'ปกติ',
              }}
              description="ตรวจสอบพิกัดและรอบเวลาเรียลไทม์"
            />
          </DashboardStatsGrid>

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
                      ตารางเวลาและรอบการลงเวลาที่ผูกกับบทบาทขององค์กรนี้
                    </CardDescription>
                  </div>
                  <CardAction>
                    <ScheduleCreateAction
                      organizationId={activeOrganizationId}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <ScheduleDataTable organizationId={activeOrganizationId} />
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
                    <ManualCheckInAction
                      organizationId={activeOrganizationId}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <AttendanceLogDataTable
                    organizationId={activeOrganizationId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </PageLayout>
  );
}
