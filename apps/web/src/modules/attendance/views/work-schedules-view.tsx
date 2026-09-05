'use client';

import React, { useMemo } from 'react';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import PageLayout from '@/shared/components/layouts/page-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import {
  useWorkSchedulesQueries,
  useCompanyWorkShiftsQueries,
  useRoleWorkSchedulesByCompanyQueries,
} from '../hooks/attendance-queries';
import WorkScheduleTable from '../components/schedules/work-schedule-table';
import WorkShiftTable from '../components/schedules/work-shift-table';
import RoleScheduleTable from '../components/schedules/role-schedule-table';
import WorkScheduleCreateAction from '../components/schedules/work-schedule-create-action';
import {
  CalendarRange,
  Clock,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function WorkSchedulesView() {
  const {
    activeCompany,
    activeCompanyId,
    isLoading: isCompanyLoading,
  } = useActiveCompany();

  const { data: schedules = [], isLoading: isSchedulesLoading } =
    useWorkSchedulesQueries(activeCompanyId);
  const { data: shifts = [], isLoading: isShiftsLoading } =
    useCompanyWorkShiftsQueries(activeCompanyId);
  const { data: roleSchedules = [], isLoading: isRoleSchedulesLoading } =
    useRoleWorkSchedulesByCompanyQueries(activeCompanyId);

  const stats = useMemo(() => {
    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter((s) => s.isActive).length;
    const totalShifts = shifts.length;
    const assignedRoles = new Set(roleSchedules.map((r) => r.roleId)).size;

    return { totalSchedules, activeSchedules, totalShifts, assignedRoles };
  }, [schedules, shifts, roleSchedules]);

  const isLoading =
    isCompanyLoading ||
    isSchedulesLoading ||
    isShiftsLoading ||
    isRoleSchedulesLoading;

  return (
    <PageLayout
      pageId="companyAttendanceSchedules"
      isLoading={isLoading}
      actions={
        activeCompany && (
          <div className="flex items-center gap-2">
            <WorkScheduleCreateAction companyId={activeCompanyId} />
          </div>
        )
      }
    >
      {!activeCompany ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <CalendarRange className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">ไม่พบบริษัทที่สังกัด</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            กรุณาเลือกหรือสร้างบริษัทก่อนดำเนินการจัดการตารางงาน
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    ตารางเวลาทั้งหมด
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.totalSchedules}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CalendarRange className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    เปิดใช้งาน
                  </p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                    {stats.activeSchedules}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    กะการทำงานทั้งหมด
                  </p>
                  <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                    {stats.totalShifts}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Clock className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    บทบาทที่กำหนดกะแล้ว
                  </p>
                  <p className="text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">
                    {stats.assignedRoles}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Shield className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Data Tables */}
          <Tabs defaultSelectedKey="schedules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
              <TabsTrigger id="schedules" className="gap-2">
                <CalendarRange className="size-4" />
                ตารางเวลาทำงาน
              </TabsTrigger>
              <TabsTrigger id="shifts" className="gap-2">
                <Clock className="size-4" />
                กะการทำงาน ({stats.totalShifts})
              </TabsTrigger>
              <TabsTrigger id="role-schedules" className="gap-2">
                <Shield className="size-4" />
                การมอบหมายตาม Role
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Work Schedules */}
            <TabsContent id="schedules" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Layers className="size-5 text-primary" />
                    <div>
                      <CardTitle>ตารางเวลาทำงาน (Work Schedules)</CardTitle>
                      <CardDescription>
                        กำหนดกลุ่มตารางเวลาหลักสำหรับบริษัท {activeCompany.name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <WorkScheduleTable companyId={activeCompanyId} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Work Shifts */}
            <TabsContent id="shifts" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    <div>
                      <CardTitle>กะการทำงานทั้งหมด (Work Shifts)</CardTitle>
                      <CardDescription>
                        รายละเอียดเวลาเริ่ม-เลิกงาน และคุณลักษณะของแต่ละกะ
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <WorkShiftTable companyId={activeCompanyId} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Role Schedules */}
            <TabsContent id="role-schedules" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="size-5 text-primary" />
                    <div>
                      <CardTitle>
                        การมอบหมายตารางงานให้แต่ละบทบาท (Role Work Schedules)
                      </CardTitle>
                      <CardDescription>
                        กำหนดว่าพนักงานที่มีบทบาท/ตำแหน่งใดต้องเข้างานตามกะและตารางเวลาใด
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <RoleScheduleTable companyId={activeCompanyId} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </PageLayout>
  );
}
