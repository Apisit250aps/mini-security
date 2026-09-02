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
import { useLeaveRequestsQueries } from '../hooks/attendance-queries';
import LeaveRequestTable from '../components/leave/leave-request-table';
import LeaveCreateAction from '../components/leave/leave-create-action';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
} from 'lucide-react';

export default function LeaveRequestsView() {
  const {
    activeCompany,
    activeCompanyId,
    isLoading: isCompanyLoading,
  } = useActiveCompany();

  const { data: leaves = [], isLoading: isLeavesLoading } =
    useLeaveRequestsQueries(activeCompanyId);

  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter((l) => l.status === 'PENDING').length;
    const approved = leaves.filter((l) => l.status === 'APPROVED').length;
    const rejected = leaves.filter((l) => l.status === 'REJECTED').length;

    return { total, pending, approved, rejected };
  }, [leaves]);

  const isLoading = isCompanyLoading || isLeavesLoading;

  return (
    <PageLayout
      pageId="companyAttendanceLeave"
      isLoading={isLoading}
      actions={
        activeCompany && <LeaveCreateAction companyId={activeCompanyId} />
      }
    >
      {!activeCompany ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <CalendarDays className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">ไม่พบบริษัทที่สังกัด</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            กรุณาเลือกหรือสร้างบริษัทก่อนดำเนินการจัดการคำขอลา
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
                    คำขอลาทั้งหมด
                  </p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    รอการพิจารณา
                  </p>
                  <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                    {stats.pending}
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
                    ไม่อนุมัติ / ปฏิเสธ
                  </p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {stats.rejected}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <XCircle className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>รายการคำขอลาหยุดงาน</CardTitle>
              <CardDescription>
                ประวัติการยื่นคำขอลาป่วย ลาพักร้อน ลากิจ
                และผลการอนุมัติสำหรับบริษัท {activeCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveRequestTable companyId={activeCompanyId} />
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
