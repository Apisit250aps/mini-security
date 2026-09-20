'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import FormPlanEditDialog from '../components/plan/form-plan-edit-dialog';
import {
  useFormPlanDetailQueries,
  useFormTemplateQueries,
  useFormSchedulePreviewQueries,
  useFormOccurrencesQueries,
  useOccurrenceAssignmentsQueries,
} from '../hooks/form-queries';
import {
  useFormPlanActivate,
  useFormPlanPause,
  useFormOccurrencesOpen,
  useFormOccurrenceCancel,
  useFormSubmissionStart,
} from '../hooks/form-mutations';
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
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Badge } from '@repo/ui/components/badge';
import { Input } from '@repo/ui/components/input';
import { toast } from '@repo/ui/components/sonner';
import { useOverlay } from '@repo/ui/hooks';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import { getErrorMessage } from '@/shared/utils';
import {
  Calendar,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  ExternalLink,
  Layers,
  Pause,
  Play,
  ArrowRight,
  Settings2,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';

interface FormPlanDetailViewProps {
  planId: string;
}

function OccurrenceAssignmentsList({
  occurrenceId,
  companyId,
}: {
  occurrenceId: string;
  companyId: string;
}) {
  const router = useRouter();
  const assignmentsQuery = useOccurrenceAssignmentsQueries(occurrenceId);
  const assignments = assignmentsQuery.data || [];
  const startMutation = useFormSubmissionStart(companyId);

  if (assignmentsQuery.isLoading) {
    return (
      <div className="py-2 text-xs text-muted-foreground">
        กำลังโหลดรายการผู้รับมอบหมาย...
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="py-1 text-xs text-muted-foreground italic">
        ไม่มีรายการงานที่มอบหมายในรอบนี้
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return (
          <Badge
            variant="outline"
            className="text-[10px] border-amber-400 text-amber-600"
          >
            ยังไม่เริ่ม
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge
            variant="secondary"
            className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          >
            ฉบับร่าง
          </Badge>
        );
      case 'IN_REVIEW':
        return (
          <Badge
            variant="secondary"
            className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
          >
            รอตรวจรับ
          </Badge>
        );
      case 'RETURNED':
        return (
          <Badge
            variant="secondary"
            className="text-[10px] bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
          >
            ส่งกลับแก้ไข
          </Badge>
        );
      case 'CORRECTION_DRAFT':
        return (
          <Badge
            variant="secondary"
            className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          >
            กำลังแก้ไข
          </Badge>
        );
      case 'APPROVED':
      case 'COMPLETED':
        return (
          <Badge variant="default" className="text-[10px] bg-emerald-600">
            เสร็จสิ้น
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive" className="text-[10px]">
            ยกเลิก
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/60">
      <span className="text-xs font-medium text-foreground">
        ผู้รับผิดชอบและสถานะงาน ({assignments.length}):
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {assignments.map((item) => (
          <div
            key={item.assignmentId}
            className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs gap-2"
          >
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-foreground truncate">
                  {item.recipientLabel}
                </span>
                {renderStatusBadge(item.workflowStatus)}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {item.canStart && (
                <ButtonLoading
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onPress={() =>
                    startMutation.mutate(
                      { assignmentId: item.assignmentId },
                      {
                        onSuccess: (res) => {
                          const sub = res?.data;
                          if (sub?.id) {
                            router.push(`/company/forms/submissions/${sub.id}`);
                          }
                        },
                        onError: (err) => {
                          toast.error(
                            getErrorMessage(err, 'ไม่สามารถเปิดแบบฟอร์มได้'),
                          );
                        },
                      },
                    )
                  }
                  isLoading={
                    startMutation.isPending &&
                    startMutation.variables?.assignmentId === item.assignmentId
                  }
                >
                  <Play className="size-3 mr-1" />
                  เริ่มตรวจ
                </ButtonLoading>
              )}

              {item.canContinue && item.latestSubmissionId && (
                <Button
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() =>
                    router.push(
                      `/company/forms/submissions/${item.latestSubmissionId}`,
                    )
                  }
                >
                  <ArrowRight className="size-3 mr-1" />
                  บันทึกต่อ
                </Button>
              )}

              {item.canView && item.latestSubmissionId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() =>
                    router.push(
                      `/company/forms/submissions/${item.latestSubmissionId}`,
                    )
                  }
                >
                  <ExternalLink className="size-3 mr-1" />
                  ดูผล
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FormPlanDetailView({
  planId,
}: FormPlanDetailViewProps) {
  const router = useRouter();
  const ui = useOverlay();
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();

  const planQuery = useFormPlanDetailQueries(planId);
  const planDetail = planQuery.data;
  const plan = planDetail?.plan;
  const planTargets = useMemo(
    () => planDetail?.targets || [],
    [planDetail?.targets],
  );
  const planPeriods = useMemo(
    () => planDetail?.periods || [],
    [planDetail?.periods],
  );

  const rolesQuery = useCompanyRolesQueries(activeCompanyId || '');
  const membersQuery = useCompanyMembersQueries(activeCompanyId || '');
  const roles = useMemo(() => rolesQuery.data || [], [rolesQuery.data]);
  const members = useMemo(() => membersQuery.data || [], [membersQuery.data]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [now] = useState(() => Date.now());

  const templateQuery = useFormTemplateQueries(plan?.formTemplateId);
  const templateDetail = templateQuery.data;

  const previewQuery = useFormSchedulePreviewQueries(planId);
  const previewTimes = previewQuery.data || [];

  const occurrencesQuery = useFormOccurrencesQueries({
    companyId: activeCompanyId || '',
    planId,
  });
  const occurrences = occurrencesQuery.data || [];

  const activateMutation = useFormPlanActivate(activeCompanyId || '', planId);
  const pauseMutation = useFormPlanPause(activeCompanyId || '', planId);
  const openOccurrencesMutation = useFormOccurrencesOpen(activeCompanyId || '');
  const cancelOccurrenceMutation = useFormOccurrenceCancel(
    activeCompanyId || '',
  );

  const [activeTab, setActiveTab] = useState('overview');

  // Cancel Occurrence Modal State
  const [cancellingOccurrenceId, setCancellingOccurrenceId] = useState<
    string | null
  >(null);
  const [cancelReason, setCancelReason] = useState('');

  const isActive = Boolean(plan?.effectiveFrom && !plan?.effectiveUntil);
  const isPaused = Boolean(plan?.effectiveUntil);
  const isDraft = !plan?.effectiveFrom;

  const handleActivate = () => {
    if (!plan) return;
    ui.alert.open({
      title: 'ยืนยันการเปิดใช้งานแผนการตรวจ',
      description: `ต้องการเปิดใช้งานแผน "${plan.name}" หรือไม่? แผนจะมีผลเริ่มทำงานตั้งแต่บัดนี้`,
      confirmVariant: 'default',
      onConfirm: () => {
        activateMutation.mutate(
          { expectedRevision: plan.revision },
          {
            onSuccess: (response) => {
              ui.alert.close();
              if (response.data?.id && response.data.id !== plan.id) {
                router.push(`/company/forms/plans/${response.data.id}`);
              }
            },
            onError: (err) => {
              toast.error(getErrorMessage(err, 'ไม่สามารถเปิดใช้งานแผนได้'));
            },
          },
        );
      },
    });
  };

  const handlePause = () => {
    if (!plan) return;
    ui.alert.open({
      title: 'ยืนยันการพักแผนการตรวจ',
      description: `ต้องการระงับแผน "${plan.name}" ชั่วคราวหรือไม่? รอบงานจะไม่ถูกเปิดจนกว่าจะเริ่มใช้งานใหม่อีกครั้ง`,
      confirmVariant: 'destructive',
      onConfirm: () => {
        pauseMutation.mutate(
          { expectedRevision: plan.revision },
          {
            onSuccess: () => {
              ui.alert.close();
            },
            onError: (err) => {
              toast.error(getErrorMessage(err, 'ไม่สามารถระงับแผนได้'));
            },
          },
        );
      },
    });
  };

  const handleTriggerOccurrences = () => {
    if (!activeCompanyId) return;

    ui.alert.open({
      title: 'ประมวลผลเปิดรอบงานที่ถึงเวลา',
      description:
        'ระบบจะตรวจสอบและสร้างรอบงาน (Occurrences) สำหรับทุกแผนงานที่เปิดใช้งานในบริษัทที่มีรอบถึงเวลาเปิด ณ ตอนนี้ คุณต้องการดำเนินการหรือไม่?',
      onConfirm: () => {
        openOccurrencesMutation.mutate(
          { companyId: activeCompanyId },
          {
            onSuccess: (res) => {
              const count = res?.data?.length || 0;
              if (count > 0) {
                toast.success(`ประมวลผลสำเร็จ เปิดรอบงานใหม่แล้ว ${count} รอบ`);
              } else {
                toast.info('ไม่มีรอบงานใหม่ที่ถึงเวลาเปิดในขณะนี้');
              }
              ui.alert.close();
            },
          },
        );
      },
    });
  };

  const handleConfirmCancelOccurrence = (
    occurrenceId: string,
    revision: number,
  ) => {
    if (!cancelReason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการยกเลิกรอบงาน');
      return;
    }

    cancelOccurrenceMutation.mutate(
      {
        id: occurrenceId,
        data: {
          cancelReason: cancelReason.trim(),
          expectedRevision: revision,
        },
      },
      {
        onSuccess: () => {
          toast.success('ยกเลิกรอบงานเรียบร้อย');
          setCancellingOccurrenceId(null);
          setCancelReason('');
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, 'ไม่สามารถยกเลิกรอบงานได้'));
        },
      },
    );
  };

  const isPageLoading =
    isCompanyLoading || !activeCompanyId || planQuery.isLoading;

  if (!isPageLoading && !plan) {
    return (
      <PageLayout pageId="companyFormPlanDetail" title="ไม่พบแผนการตรวจ">
        <div className="py-20 text-center border rounded-xl border-dashed">
          <CalendarClock className="size-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">ไม่พบแผนการตรวจที่คุณค้นหา</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            แผนการตรวจอาจถูกลบหรือไม่มีอยู่ในระบบ
          </p>
          <Link href="/company/forms/plans">
            <Button variant="outline">
              <ChevronLeft data-icon="inline-start" />
              กลับไปหน้ารายการแผน
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const cfg = plan?.scheduleConfig as Record<string, unknown> | null;
  const frequency = (cfg?.frequency as string) || 'DAILY';
  const openTime = (cfg?.openLocalTime as string) || '08:00';
  const dueOffset = cfg?.dueOffset as
    | { amount?: number; unit?: string }
    | undefined;
  const dueHours = dueOffset?.amount || 8;

  return (
    <PageLayout
      pageId="companyFormPlanDetail"
      title={plan?.name || 'แผนการตรวจ'}
      description={
        templateDetail
          ? `ใช้แม่แบบ: ${templateDetail.template.name}`
          : 'ภาพรวมและการจัดการรอบงานตรวจประเมิน'
      }
      isLoading={isPageLoading}
      loadingText="กำลังโหลดรายละเอียดแผนการตรวจ..."
      actions={
        <div className="flex items-center gap-2">
          <Link href="/company/forms/plans">
            <Button variant="outline" size="sm">
              <ChevronLeft data-icon="inline-start" />
              กลับ
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Settings2 data-icon="inline-start" />
            ตั้งค่าแผนการตรวจ
          </Button>

          {isActive ? (
            <Button
              variant="outline"
              size="sm"
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
              onClick={handlePause}
            >
              <Pause data-icon="inline-start" />
              พักแผน (Pause)
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              onClick={handleActivate}
            >
              <Play data-icon="inline-start" />
              เปิดใช้งาน (Activate)
            </Button>
          )}

          {isActive && (
            <ButtonLoading
              variant="default"
              size="sm"
              onPress={handleTriggerOccurrences}
              isLoading={openOccurrencesMutation.isPending}
            >
              <Zap data-icon="inline-start" className="text-amber-400" />
              ประมวลผลรอบที่ถึงเวลา
            </ButtonLoading>
          )}
        </div>
      }
    >
      {plan && (
        <div className="flex flex-col gap-6">
          {/* Header Card with Status and Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border bg-card shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                <CalendarClock className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  {isActive ? (
                    <Badge variant="default" className="bg-emerald-600">
                      เปิดใช้งาน (Active)
                    </Badge>
                  ) : isPaused ? (
                    <Badge variant="secondary">พักแผนชั่วคราว (Paused)</Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-400 text-amber-600"
                    >
                      ฉบับร่าง (ยังไม่เปิดใช้งาน)
                    </Badge>
                  )}
                  <Badge variant="outline" className="font-mono">
                    v{plan.revision}
                  </Badge>
                </div>
                {templateDetail && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <span>แม่แบบฟอร์ม:</span>
                    <Link
                      href={`/company/forms/templates/${templateDetail.template.id}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      {templateDetail.template.name}
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:items-end text-xs text-muted-foreground gap-1">
              <span>สร้างเมื่อ: {formatDate(plan.createdAt)}</span>
              {plan.effectiveFrom && (
                <span className="text-emerald-600 font-medium">
                  เริ่มมีผล: {formatDateTime(plan.effectiveFrom)}
                </span>
              )}
              {plan.effectiveUntil && (
                <span className="text-amber-600 font-medium">
                  พักแผนเมื่อ: {formatDateTime(plan.effectiveUntil)}
                </span>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(k) => setActiveTab(String(k))}
          >
            <TabsList>
              <TabsTrigger id="overview">
                <Settings2 data-icon="inline-start" />
                ภาพรวมและการตั้งค่า
              </TabsTrigger>
              <TabsTrigger id="preview">
                <Clock data-icon="inline-start" />
                พรีวิวรอบเวลาถัดไป ({previewTimes.length})
              </TabsTrigger>
              <TabsTrigger id="occurrences">
                <CalendarDays data-icon="inline-start" />
                รอบงานที่เปิดจริง ({occurrences.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent id="overview" className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schedule Config Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="size-4 text-primary" />
                      กำหนดการและรอบเวลา
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 text-xs">
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-muted-foreground">
                        รูปแบบกำหนดการ:
                      </span>
                      <span className="font-semibold">
                        {plan.scheduleKind === 'RECURRING'
                          ? 'ทำซ้ำตามรอบ (Recurring)'
                          : 'กำหนดช่วงเวลาเฉพาะ (Explicit)'}
                      </span>
                    </div>

                    {plan.scheduleKind === 'RECURRING' && (
                      <>
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-muted-foreground">
                            ความถี่:
                          </span>
                          <span className="font-semibold">
                            {frequency} (ทุก {(cfg?.interval as number) || 1}{' '}
                            รอบ)
                          </span>
                        </div>
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-muted-foreground">
                            เวลาเปิดรอบ:
                          </span>
                          <span className="font-semibold">{openTime} น.</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-muted-foreground">
                            กำหนดส่งหลังเปิด:
                          </span>
                          <span className="font-semibold">
                            {dueHours} ชั่วโมง
                          </span>
                        </div>
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-muted-foreground">
                            วันที่เริ่มต้นฐาน:
                          </span>
                          <span className="font-semibold">
                            {(cfg?.anchorLocalDate as string) || '-'}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-muted-foreground">
                        เขตเวลา (Timezone):
                      </span>
                      <span className="font-semibold">{plan.timezone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        นโยบาย Missed Policy:
                      </span>
                      <span className="font-semibold">{plan.missedPolicy}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Policy Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="size-4 text-primary" />
                      นโยบายการตรวจรับและแบบฟอร์ม
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 text-xs">
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-muted-foreground">
                        โหมดการตรวจรับ:
                      </span>
                      <Badge variant="outline">รอผู้ตรวจอนุมัติ</Badge>
                    </div>
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-muted-foreground">
                        นโยบายส่งงานช้า:
                      </span>
                      <Badge
                        variant={
                          plan.latePolicy === 'ALLOW' ? 'secondary' : 'default'
                        }
                      >
                        {plan.latePolicy === 'ALLOW'
                          ? 'อนุญาต (ALLOW)'
                          : 'ไม่อนุญาต (DENY)'}
                      </Badge>
                    </div>
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-muted-foreground">
                        เวอร์ชันแบบฟอร์ม:
                      </span>
                      <span className="font-semibold">
                        {plan.fixedVersionId
                          ? `ล็อกเวอร์ชัน (ID: ${plan.fixedVersionId.slice(0, 8)})`
                          : 'ใช้เวอร์ชันล่าสุดเสมอ (Latest Published)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Revision Token:
                      </span>
                      <span className="font-mono">{plan.revision}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Targets Card */}
                <Card className="md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="size-4 text-primary" />
                        ผู้รับมอบหมายตามแผน ({planTargets.length} รายการ)
                      </CardTitle>
                      <CardDescription>
                        ตำแหน่งหรือพนักงานที่จะได้รับมอบหมายงานในแต่ละรอบเวลา
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditDialogOpen(true)}
                    >
                      <Settings2 data-icon="inline-start" />
                      แก้ไขการตั้งค่า
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {planTargets.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
                        ยังไม่มีการกำหนดผู้รับมอบหมาย คลิก
                        &quot;แก้ไขการตั้งค่า&quot; เพื่อเพิ่มตำแหน่งหรือพนักงาน
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {planTargets.map((t) => {
                          const roleName = t.roleId
                            ? roles.find((r) => r.id === t.roleId)?.name ||
                              `ตำแหน่ง: ${t.roleId.slice(0, 8)}`
                            : null;
                          const memberName = t.companyMemberId
                            ? `พนักงาน: ${t.companyMemberId.slice(0, 8)}`
                            : null;
                          return (
                            <div
                              key={t.id}
                              className="p-3 border rounded-lg bg-card flex items-center gap-3 text-xs"
                            >
                              <div className="p-2 rounded-md bg-muted text-muted-foreground shrink-0">
                                <Users className="size-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-foreground truncate">
                                  {roleName || memberName}
                                </span>
                                <span className="text-muted-foreground text-[11px]">
                                  {t.roleId
                                    ? t.roleDistribution === 'SHARED'
                                      ? 'งานกองกลางกลุ่ม (SHARED)'
                                      : 'แยกงานรายบุคคล (PER_MEMBER)'
                                    : 'มอบหมายรายบุคคล'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 2: Schedule Preview */}
            <TabsContent id="preview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    พรีวิวรอบเวลาที่จะเปิดถัดไป (Schedule Preview)
                  </CardTitle>
                  <CardDescription>
                    รอบเวลาที่ระบบคำนวณล่วงหน้าสำหรับแผนนี้ (10 รอบถัดไป)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewTimes.length === 0 ? (
                    <div className="p-8 text-center border rounded-xl border-dashed text-muted-foreground text-xs">
                      ไม่มีข้อมูลรอบเวลาพรีวิวสำหรับแผนนี้
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {previewTimes.map((timeStr, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 border rounded-xl bg-muted/10 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="size-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-foreground">
                              {formatDateTime(timeStr)}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {plan.timezone}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Occurrences */}
            <TabsContent id="occurrences" className="mt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">
                    รอบงานที่เปิดแล้ว (Occurrences)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    รายการรอบงานที่ถูกสร้างจริง
                    พร้อมให้ผู้รับผิดชอบเริ่มบันทึกแบบฟอร์ม
                  </p>
                </div>
                {isActive && (
                  <ButtonLoading
                    variant="outline"
                    size="sm"
                    onPress={handleTriggerOccurrences}
                    isLoading={openOccurrencesMutation.isPending}
                  >
                    <Zap data-icon="inline-start" className="text-amber-500" />
                    ประมวลผลรอบที่ถึงเวลา
                  </ButtonLoading>
                )}
              </div>

              {occurrences.length === 0 ? (
                <div className="py-16 text-center border rounded-xl border-dashed bg-muted/10">
                  <CalendarDays className="size-10 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium text-sm">ยังไม่มีรอบงานที่เปิด</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto mb-4">
                    เมื่อถึงเวลาเปิดรอบ
                    ระบบจะสร้างรอบงานและงานที่มอบหมายให้ผู้ปฏิบัติงานโดยอัตโนมัติ
                    หรือสามารถกด &quot;ประมวลผลรอบที่ถึงเวลา&quot;
                    เพื่อสร้างรอบที่ถึงกำหนด
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {occurrences.map((occ) => {
                    const isCancelled = Boolean(occ.cancelledAt);
                    const isExpired =
                      !isCancelled && new Date(occ.dueAt).getTime() < now;
                    const isCancellingThis = cancellingOccurrenceId === occ.id;

                    return (
                      <div
                        key={occ.id}
                        className="p-4 border rounded-xl bg-card flex flex-col gap-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CalendarDays className="size-4 text-primary" />
                            <span className="font-semibold text-sm">
                              รอบงาน #{occ.id.slice(0, 8)}
                            </span>
                            {isCancelled ? (
                              <Badge variant="destructive" className="text-xs">
                                ยกเลิกแล้ว
                              </Badge>
                            ) : isExpired ? (
                              <Badge
                                variant={
                                  plan?.latePolicy === 'DENY'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {plan?.latePolicy === 'DENY'
                                  ? 'หมดเวลากรอก (ปิดรับ)'
                                  : 'เลยกำหนดส่ง (อนุญาตส่งช้า)'}
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="text-xs bg-emerald-600"
                              >
                                กำลังเปิดรับคำตอบ
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              v{occ.revision}
                            </Badge>
                          </div>

                          {!isCancelled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive self-end sm:self-center"
                              onClick={() => {
                                setCancellingOccurrenceId(
                                  isCancellingThis ? null : occ.id,
                                );
                                setCancelReason('');
                              }}
                            >
                              <Trash2 className="size-3.5 mr-1" />
                              ยกเลิกรอบนี้
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground block">
                              เวลาเปิดรอบ:
                            </span>
                            {formatDateTime(occ.opensAt)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">
                              กำหนดส่ง:
                            </span>
                            {formatDateTime(occ.dueAt)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">
                              สร้างเมื่อ:
                            </span>
                            {formatDate(occ.createdAt)}
                          </div>
                        </div>

                        <OccurrenceAssignmentsList
                          occurrenceId={occ.id}
                          companyId={activeCompanyId || ''}
                        />

                        {occ.cancelReason && (
                          <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
                            <span className="font-semibold">
                              เหตุผลการยกเลิก:
                            </span>{' '}
                            {occ.cancelReason}
                          </div>
                        )}

                        {isCancellingThis && (
                          <div className="p-3 border rounded-xl bg-destructive/5 flex flex-col gap-3">
                            <span className="font-semibold text-xs text-destructive">
                              ระบุเหตุผลในการยกเลิกรอบงานนี้:
                            </span>
                            <Input
                              placeholder="เช่น อาคารปิดซ่อมบำรุง, สภาพอากาศไม่เอื้ออำนวย..."
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCancellingOccurrenceId(null)}
                              >
                                ยกเลิก
                              </Button>
                              <ButtonLoading
                                size="sm"
                                variant="destructive"
                                onPress={() =>
                                  handleConfirmCancelOccurrence(
                                    occ.id,
                                    occ.revision,
                                  )
                                }
                                isLoading={cancelOccurrenceMutation.isPending}
                              >
                                ยืนยันยกเลิกรอบ
                              </ButtonLoading>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {plan && (
        <FormPlanEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          plan={plan}
          initialTargets={planTargets}
          initialPeriods={planPeriods}
          companyId={activeCompanyId || ''}
          templateDetail={templateDetail}
        />
      )}
    </PageLayout>
  );
}
