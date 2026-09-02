'use client';

import React from 'react';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import PageLayout from '@/shared/components/layouts/page-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { useWorkSchedulesQueries } from '../hooks/attendance-queries';
import WorkScheduleCard from '../components/schedules/work-schedule-card';
import WorkScheduleCreateAction from '../components/schedules/work-schedule-create-action';
import RoleScheduleAction from '../components/schedules/role-schedule-action';
import { CalendarRange } from 'lucide-react';

export default function WorkSchedulesView() {
  const {
    activeCompany,
    activeCompanyId,
    isLoading: isCompanyLoading,
  } = useActiveCompany();

  const { data: schedules = [], isLoading: isSchedulesLoading } =
    useWorkSchedulesQueries(activeCompanyId);

  const isLoading = isCompanyLoading || isSchedulesLoading;

  return (
    <PageLayout
      pageId="companyAttendanceSchedules"
      isLoading={isLoading}
      actions={
        activeCompany && (
          <div className="flex items-center gap-2">
            <RoleScheduleAction companyId={activeCompanyId} />
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
          <Card>
            <CardHeader>
              <CardTitle>
                ตารางเวลาทำงานและกะ (Work Schedules & Shifts)
              </CardTitle>
              <CardDescription>
                กำหนดกลุ่มตารางเวลา ช่วงเวลาเริ่ม-สิ้นสุดกะการทำงาน สำหรับบริษัท{' '}
                {activeCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  ยังไม่มีตารางเวลาทำงาน กดปุ่ม &quot;สร้างตารางเวลาใหม่&quot;
                  เพื่อเริ่มต้น
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedules.map((schedule) => (
                    <WorkScheduleCard
                      key={schedule.id}
                      companyId={activeCompanyId}
                      schedule={schedule}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
