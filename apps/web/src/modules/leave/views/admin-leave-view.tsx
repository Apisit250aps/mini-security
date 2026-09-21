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
import { CalendarRange, Sliders, Building2, Clock } from 'lucide-react';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import {
  useOrganizationLeaveRequestsQueries,
  useOrganizationLeaveTypesQueries,
} from '../hooks/leave-queries';
import LeaveRequestDataTable from '../components/requests/leave-request-data-table';
import LeaveRequestSubmitAction from '../components/requests/leave-request-submit-action';
import LeaveTypeDataTable from '../components/types/leave-type-data-table';
import LeaveTypeCreateAction from '../components/types/leave-type-create-action';

export default function AdminLeaveView() {
  const organizationsQuery = useOrganizationListQueries();
  const organizations = useMemo(
    () => organizationsQuery.data || [],
    [organizationsQuery.data],
  );

  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>('');

  const activeOrganizationId =
    selectedOrganizationId || organizations[0]?.id || '';
  const selectedOrganization = organizations.find(
    (c) => c.id === activeOrganizationId,
  );

  const requestsQuery =
    useOrganizationLeaveRequestsQueries(activeOrganizationId);
  const typesQuery = useOrganizationLeaveTypesQueries(activeOrganizationId);

  const requests = requestsQuery.data || [];
  const types = typesQuery.data || [];

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests],
  );

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
              value={activeOrganizationId}
              onChange={(e) => setSelectedOrganizationId(e.target.value)}
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
          <DashboardStatsGrid columns={4}>
            <MetricCard
              title="องค์กรปัจจุบัน"
              value={selectedOrganization?.name || '-'}
              icon={Building2}
              description={`Slug: ${selectedOrganization?.slug || '-'}`}
            />
            <MetricCard
              title="คำขอลาทั้งหมด"
              value={`${requests.length} รายการ`}
              icon={CalendarRange}
              description="ประวัติคำขอลาในระบบ"
            />
            <MetricCard
              title="รออนุมัติ (Pending)"
              value={`${pendingCount} รายการ`}
              icon={Clock}
              trend={{
                value: `${pendingCount}`,
                isPositive: pendingCount === 0,
                label: 'รายการรอตรวจ',
              }}
              description="คำขอลาที่รอการพิจารณา"
            />
            <MetricCard
              title="ประเภทการลาที่เปิดใช้"
              value={`${types.length} ประเภท`}
              icon={Sliders}
              description="นโยบายวันลาขององค์กร"
            />
          </DashboardStatsGrid>

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
                      คำขอลาทั้งหมดของพนักงานในองค์กรนี้
                    </CardDescription>
                  </div>
                  <CardAction>
                    <LeaveRequestSubmitAction
                      organizationId={activeOrganizationId}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <LeaveRequestDataTable
                    organizationId={activeOrganizationId}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent id="types" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>ประเภทการลาและโควต้า</CardTitle>
                    <CardDescription>
                      นโยบายการลาและโควต้าวันลาประจำปีขององค์กรนี้
                    </CardDescription>
                  </div>
                  <CardAction>
                    <LeaveTypeCreateAction
                      organizationId={activeOrganizationId}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <LeaveTypeDataTable organizationId={activeOrganizationId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </PageLayout>
  );
}
