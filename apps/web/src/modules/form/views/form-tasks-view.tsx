'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  ClipboardList,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  RotateCcw,
  FileSearch,
  Search,
  RefreshCw,
  CalendarCheck2,
} from 'lucide-react';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Input } from '@repo/ui/components/input';
import { toast } from '@repo/ui/components/sonner';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useMyAssignmentsQueries } from '../hooks/form-queries';
import {
  useFormSubmissionStart,
  useFormSubmissionCreateCorrectionMutation,
} from '../hooks/form-mutations';
import { getErrorMessage } from '@/shared/utils';
import { formatDateTime } from '@/shared/utils/date';
import type { FormAssignmentItem, FormTaskWorkflowStatus } from '@repo/client';

export default function FormTasksView() {
  const router = useRouter();
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  const { data: sessionData } = useSession();
  const { hasPermission, isSuperAdmin } = usePermission();

  const membersQuery = useCompanyMembersQueries(activeCompanyId || '');
  const members = membersQuery.data || [];
  const currentMember = members.find((m) => m.userId === sessionData?.user?.id);

  const assignmentsQuery = useMyAssignmentsQueries({
    companyId: activeCompanyId || '',
    memberId: currentMember?.id,
  });

  const startMutation = useFormSubmissionStart(activeCompanyId || '');
  const correctionMutation = useFormSubmissionCreateCorrectionMutation(
    activeCompanyId || '',
  );

  const [filterTab, setFilterTab] = useState<'PENDING' | 'COMPLETED' | 'ALL'>(
    'PENDING',
  );
  const [searchQuery, setSearchQuery] = useState('');

  const assignments: FormAssignmentItem[] = useMemo(
    () => assignmentsQuery.data || [],
    [assignmentsQuery.data],
  );

  // Filter tasks based on tabs and search query
  const filteredTasks = useMemo(() => {
    return assignments.filter((item) => {
      const status: FormTaskWorkflowStatus =
        item.workflowStatus || 'NOT_STARTED';

      // Tab matching
      if (filterTab === 'PENDING') {
        const isPending =
          status === 'NOT_STARTED' ||
          status === 'DRAFT' ||
          status === 'RETURNED' ||
          status === 'CORRECTION_DRAFT';
        if (!isPending) return false;
      } else if (filterTab === 'COMPLETED') {
        const isCompleted =
          status === 'IN_REVIEW' ||
          status === 'APPROVED' ||
          status === 'COMPLETED';
        if (!isCompleted) return false;
      }

      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const planName = (item.planName || '').toLowerCase();
        const templateName = (item.templateName || '').toLowerCase();
        const recipient = (item.recipientLabel || '').toLowerCase();
        if (
          !planName.includes(query) &&
          !templateName.includes(query) &&
          !recipient.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [assignments, filterTab, searchQuery]);

  const pendingCount = useMemo(() => {
    return assignments.filter((item) => {
      const s = item.workflowStatus || 'NOT_STARTED';
      return (
        s === 'NOT_STARTED' ||
        s === 'DRAFT' ||
        s === 'RETURNED' ||
        s === 'CORRECTION_DRAFT'
      );
    }).length;
  }, [assignments]);

  const completedCount = useMemo(() => {
    return assignments.filter((item) => {
      const s = item.workflowStatus || 'NOT_STARTED';
      return s === 'IN_REVIEW' || s === 'APPROVED' || s === 'COMPLETED';
    }).length;
  }, [assignments]);

  const handleStart = (assignmentId: string) => {
    startMutation.mutate(
      { assignmentId },
      {
        onSuccess: (res) => {
          const sub = res?.data;
          if (sub?.id) {
            router.push(`/company/forms/submissions/${sub.id}`);
          }
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, 'ไม่สามารถเปิดแบบฟอร์มได้'));
        },
      },
    );
  };

  const handleCreateCorrection = (submissionId: string) => {
    correctionMutation.mutate(submissionId, {
      onSuccess: (res) => {
        const sub = res?.data;
        if (sub?.id) {
          router.push(`/company/forms/submissions/${sub.id}`);
        }
      },
      onError: (err) => {
        toast.error(getErrorMessage(err, 'ไม่สามารถสร้างฉบับแก้ไขได้'));
      },
    });
  };

  const renderWorkflowStatusBadge = (status?: FormTaskWorkflowStatus) => {
    switch (status) {
      case 'NOT_STARTED':
        return (
          <Badge
            variant="outline"
            className="text-xs border-amber-400 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20"
          >
            ยังไม่เริ่ม
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          >
            กำลังบันทึก (ฉบับร่าง)
          </Badge>
        );
      case 'IN_REVIEW':
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
          >
            รอตรวจรับ
          </Badge>
        );
      case 'RETURNED':
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
          >
            ส่งกลับแก้ไข
          </Badge>
        );
      case 'CORRECTION_DRAFT':
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          >
            กำลังแก้ไขฉบับใหม่
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge
            variant="default"
            className="text-xs bg-emerald-600 hover:bg-emerald-600"
          >
            อนุมัติแล้ว
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge
            variant="default"
            className="text-xs bg-emerald-600 hover:bg-emerald-600"
          >
            เสร็จสมบูรณ์
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive" className="text-xs">
            ยกเลิกแล้ว
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            ยังไม่เริ่ม
          </Badge>
        );
    }
  };

  const isPageLoading =
    isCompanyLoading || !activeCompanyId || assignmentsQuery.isLoading;

  const canManagePlans = isSuperAdmin || hasPermission('form_plan:manage');

  return (
    <PageLayout
      pageId="companyFormTasks"
      title="งานตรวจของฉัน"
      description="รายการงานตรวจที่ได้รับมอบหมายตามรอบการตรวจที่เปิดอยู่"
      isLoading={isPageLoading}
    >
      <div className="flex flex-col gap-5">
        {/* Error Notification */}
        {assignmentsQuery.isError && (
          <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-xl bg-destructive/10 text-destructive text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 shrink-0" />
              <span>
                เกิดข้อผิดพลาดในการโหลดงานตรวจ:{' '}
                {getErrorMessage(assignmentsQuery.error)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => assignmentsQuery.refetch()}
              className="shrink-0 gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        )}

        {/* Toolbar: Search and Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex rounded-lg border p-1 bg-muted/20 text-xs w-fit">
            <button
              type="button"
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterTab === 'PENDING'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ต้องดำเนินการ ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('COMPLETED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterTab === 'COMPLETED'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ส่งแล้ว / รอผล ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterTab === 'ALL'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ทั้งหมด ({assignments.length})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาแผนงาน หรือแบบฟอร์ม..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </div>

        {/* Task Cards List */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-card/40">
            <ClipboardList className="size-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              {searchQuery.trim()
                ? 'ไม่พบรายการงานตรวจที่ตรงกับคำค้นหา'
                : 'ไม่มีรายการงานตรวจในหมวดนี้'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchQuery.trim()
                ? 'ลองเปลี่ยนคำค้นหา หรือสลับแท็บเพื่อดูรายการงานตรวจอื่น'
                : 'คุณไม่มีแบบฟอร์มที่ต้องดำเนินการในขณะนี้'}
            </p>
            {canManagePlans && !searchQuery.trim() && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/company/forms/plans')}
                >
                  <CalendarCheck2 data-icon="inline-start" />
                  ไปยังแผนการตรวจ
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map((assignment) => {
              const actions = assignment.availableActions;
              const isDeniedLate =
                assignment.isOverdue && assignment.latePolicy === 'DENY';
              const isAllowedLate =
                assignment.isOverdue && assignment.latePolicy === 'ALLOW';

              return (
                <div
                  key={assignment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-card gap-4 shadow-xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Header Hierarchy: Plan Name Primary, Template Name Secondary */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {assignment.planName || 'แบบฟอร์มตรวจสอบ'}
                        </h4>

                        {/* Workflow Status Badge */}
                        {renderWorkflowStatusBadge(assignment.workflowStatus)}

                        {/* Overdue Badge */}
                        {isDeniedLate && (
                          <Badge
                            variant="destructive"
                            className="text-xs gap-1"
                          >
                            <AlertTriangle className="size-3" />
                            หมดเวลากรอก (ไม่อนุญาตส่งช้า)
                          </Badge>
                        )}
                        {isAllowedLate && (
                          <Badge
                            variant="outline"
                            className="text-xs gap-1 border-amber-500 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20"
                          >
                            <AlertTriangle className="size-3" />
                            เลยกำหนดส่ง (อนุญาตส่งช้า)
                          </Badge>
                        )}
                      </div>

                      {/* Secondary Template Name */}
                      {assignment.templateName && (
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                          แบบฟอร์ม: {assignment.templateName}
                        </p>
                      )}

                      {assignment.templateDescription && (
                        <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">
                          {assignment.templateDescription}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-2">
                        {assignment.dueAt ? (
                          <span className="flex items-center gap-1 text-foreground font-medium">
                            <Clock className="size-3.5 text-muted-foreground" />
                            กำหนดส่ง: {formatDateTime(assignment.dueAt)}
                          </span>
                        ) : assignment.opensAt ? (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5 text-muted-foreground" />
                            เปิดตรวจ: {formatDateTime(assignment.opensAt)}
                          </span>
                        ) : null}

                        <span>•</span>

                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {assignment.recipientLabel ||
                            (assignment.companyMemberId
                              ? 'งานส่วนตัว'
                              : assignment.roleName
                                ? `ตำแหน่ง: ${assignment.roleName}`
                                : 'งานของตำแหน่ง')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Primary Capability Action Button */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    {actions?.canStart && (
                      <ButtonLoading
                        size="sm"
                        onPress={() => handleStart(assignment.id)}
                        isLoading={
                          startMutation.isPending &&
                          startMutation.variables?.assignmentId ===
                            assignment.id
                        }
                      >
                        <Play data-icon="inline-start" />
                        เริ่มตรวจ
                      </ButtonLoading>
                    )}

                    {actions?.canContinue && assignment.latestSubmissionId && (
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/company/forms/submissions/${assignment.latestSubmissionId}`,
                          )
                        }
                      >
                        <ArrowRight data-icon="inline-end" />
                        บันทึกต่อ
                      </Button>
                    )}

                    {actions?.canCreateCorrection &&
                      assignment.latestSubmissionId && (
                        <ButtonLoading
                          size="sm"
                          variant="default"
                          className="bg-amber-600 hover:bg-amber-700"
                          onPress={() =>
                            handleCreateCorrection(
                              assignment.latestSubmissionId!,
                            )
                          }
                          isLoading={
                            correctionMutation.isPending &&
                            correctionMutation.variables ===
                              assignment.latestSubmissionId
                          }
                        >
                          <RotateCcw data-icon="inline-start" />
                          สร้างฉบับแก้ไข
                        </ButtonLoading>
                      )}

                    {actions?.canView && assignment.latestSubmissionId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/company/forms/submissions/${assignment.latestSubmissionId}`,
                          )
                        }
                      >
                        <FileSearch data-icon="inline-start" />
                        ดูผลการตรวจ
                      </Button>
                    )}

                    {!actions?.canStart &&
                      !actions?.canContinue &&
                      !actions?.canCreateCorrection &&
                      !actions?.canView && (
                        <span className="text-xs text-muted-foreground italic">
                          {actions?.disabledReason ||
                            'ไม่สามารถดำเนินการได้ในขณะนี้'}
                        </span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
