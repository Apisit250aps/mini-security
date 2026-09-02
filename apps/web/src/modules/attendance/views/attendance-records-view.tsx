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
import { useAttendanceRecordsQueries } from '../hooks/attendance-queries';
import AttendanceRecordTable from '../components/records/attendance-record-table';
import ManualCheckinAction from '../components/records/manual-checkin-action';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Users,
  XCircle,
} from 'lucide-react';

export default function AttendanceRecordsView() {
  const {
    activeCompany,
    activeCompanyId,
    isLoading: isCompanyLoading,
  } = useActiveCompany();

  const { data: records = [], isLoading: isRecordsLoading } =
    useAttendanceRecordsQueries(activeCompanyId);

  const stats = useMemo(() => {
    const total = records.length;
    const approved = records.filter((r) => r.status === 'APPROVED').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const pending = records.filter((r) => r.status === 'PENDING').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;

    return { total, approved, late, pending, absent };
  }, [records]);

  const isLoading = isCompanyLoading || isRecordsLoading;

  return (
    <PageLayout
      pageId="companyAttendance"
      isLoading={isLoading}
      actions={
        activeCompany && <ManualCheckinAction companyId={activeCompanyId} />
      }
    >
      {!activeCompany ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <CalendarCheck className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">ไม่พบบริษัทที่สังกัด</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            กรุณาเลือกหรือสร้างบริษัทก่อนดำเนินการตรวจสอบบันทึกเวลา
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
                    บันทึกทั้งหมด
                  </p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    อนุมัติแล้ว
                  </p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                    {stats.approved}
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
                    มาสาย
                  </p>
                  <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                    {stats.late}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Clock className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    ขาดงาน
                  </p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {stats.absent}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <XCircle className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Records Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>รายการลงเวลาทำงาน</CardTitle>
              <CardDescription>
                ประวัติการเข้า-ออกงานและการตรวจสอบจุดเช็คชื่อของพนักงานในบริษัท{' '}
                {activeCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceRecordTable companyId={activeCompanyId} />
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
