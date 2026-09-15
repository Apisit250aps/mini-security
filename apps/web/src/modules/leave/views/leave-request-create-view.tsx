'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import FormPageLayout from '@/shared/components/layouts/form-page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import {
  useCompanyLeaveTypesQueries,
  useMemberLeaveQuotasQueries,
} from '../hooks/leave-queries';
import { useLeaveRequestSubmit } from '../hooks/leave-mutations';
import LeaveRequestForm, { LeaveRequestFormValues } from '../components/requests/leave-request-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { CalendarCheck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export default function LeaveRequestCreateView() {
  const router = useRouter();
  const { data: session } = useSession();
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();

  const membersQuery = useCompanyMembersQueries(activeCompanyId || '');
  const currentMember = useMemo(() => {
    const userId = session?.user?.id;
    if (!userId || !membersQuery.data) return null;
    return membersQuery.data.find((m) => m.userId === userId) || null;
  }, [session?.user?.id, membersQuery.data]);

  const leaveTypesQuery = useCompanyLeaveTypesQueries(activeCompanyId || '', true);
  const quotasQuery = useMemberLeaveQuotasQueries(currentMember?.id);
  const submitMutation = useLeaveRequestSubmit(activeCompanyId || '');

  const handleSubmit = (data: LeaveRequestFormValues) => {
    submitMutation.mutate(
      {
        companyMemberId: data.companyMemberId,
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        unit: data.unit,
        reason: data.reason,
        proofUrl: data.proofUrl || null,
      },
      {
        onSuccess: () => {
          router.push('/company/leave/requests');
        },
      },
    );
  };

  const quotasWithTypes = useMemo(() => {
    if (!leaveTypesQuery.data) return [];
    return leaveTypesQuery.data.map((type) => {
      const quota = quotasQuery.data?.find((q) => q.leaveTypeId === type.id);
      const totalDays = quota?.totalDays ?? type.maxDaysPerYear ?? 0;
      return {
        type,
        totalDays,
      };
    });
  }, [leaveTypesQuery.data, quotasQuery.data]);

  return (
    <FormPageLayout
      title="ยื่นคำขอลาหยุดงาน"
      description="ระบุประเภทวันลา ช่วงวันที่ และเหตุผลความจำเป็น พร้อมตรวจสอบโควต้าคงเหลือ"
      backHref="/company/leave/requests"
      isLoading={isCompanyLoading || !activeCompanyId}
      maxWidth="3xl"
      sidebar={
        <div className="flex flex-col gap-4">
          {/* Quota Summary Card */}
          <Card className="border-border/80 bg-muted/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="size-5 text-primary" />
                <CardTitle className="text-base">โควต้าวันลาประจำปี</CardTitle>
              </div>
              <CardDescription>
                จำนวนสิทธิ์วันลาที่คุณได้รับในปีปัจจุบัน
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {quotasWithTypes.length === 0 ? (
                <p className="text-xs text-muted-foreground">ยังไม่มีการกำหนดประเภทวันลา</p>
              ) : (
                quotasWithTypes.map(({ type, totalDays }) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{type.name}</p>
                      <p className="text-muted-foreground">
                        หน่วย: {type.unit === 'day' ? 'วัน' : type.unit === 'half_day' ? 'ครึ่งวัน' : 'ชั่วโมง'}
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="font-medium"
                    >
                      {totalDays ? `${totalDays} วัน/ปี` : 'ตามที่อนุมัติ'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Policy Guidelines Card */}
          <Card className="border-border/80 bg-muted/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-amber-600" />
                <CardTitle className="text-sm">เงื่อนไขการยื่นคำขอลา</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 text-primary shrink-0" />
                <span>
                  การลาป่วยติดต่อกันเกิน 3 วัน ควรแนบใบรับรองแพทย์ในช่องเอกสารแนบ
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-3.5 text-primary shrink-0" />
                <span>
                  การลาพักร้อนควรยื่นล่วงหน้าอย่างน้อย 3 วันทำการเพื่อให้หัวหน้างานจัดกะทดแทน
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Card>
        <CardContent className="p-6">
          <LeaveRequestForm
            companyId={activeCompanyId || ''}
            isLoading={submitMutation.isPending}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </FormPageLayout>
  );
}
