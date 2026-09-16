'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  ClipboardList,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  RotateCcw,
} from 'lucide-react';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { toast } from '@repo/ui/components/sonner';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import {
  useMyAssignmentsQueries,
  useFormSubmissionsQueries,
  useReviewQueueQueries,
} from '../hooks/form-queries';
import { useFormSubmissionStart } from '../hooks/form-mutations';
import { getErrorMessage } from '@/shared/utils';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import type { FormAssignmentItem, FormSubmission } from '@repo/client';

export default function FormTasksView() {
  const router = useRouter();
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  const { data: sessionData } = useSession();
  const membersQuery = useCompanyMembersQueries(activeCompanyId || '');
  const members = membersQuery.data || [];
  const currentMember = members.find((m) => m.userId === sessionData?.user?.id);

  const assignmentsQuery = useMyAssignmentsQueries({
    companyId: activeCompanyId || '',
    memberId: currentMember?.id || '',
  });

  const submissionsQuery = useFormSubmissionsQueries({
    companyId: activeCompanyId || '',
  });

  const reviewQueueQuery = useReviewQueueQueries({
    companyId: activeCompanyId || '',
  });

  const startMutation = useFormSubmissionStart(activeCompanyId || '');
  const [filterTab, setFilterTab] = useState<'PENDING' | 'COMPLETED' | 'ALL'>('PENDING');
  const [now] = useState(() => Date.now());

  const assignments = useMemo(
    () => assignmentsQuery.data || [],
    [assignmentsQuery.data],
  );

  const submissions = useMemo(
    () => submissionsQuery.data || [],
    [submissionsQuery.data],
  );

  const reviewQueue = useMemo(
    () => reviewQueueQuery.data || [],
    [reviewQueueQuery.data],
  );

  // Map each assignment to its latest submission in lineage
  const assignmentMap = useMemo(() => {
    const subByAssignment = new Map<string, FormSubmission[]>();
    for (const sub of submissions) {
      const list = subByAssignment.get(sub.assignmentId) || [];
      list.push(sub);
      subByAssignment.set(sub.assignmentId, list);
    }

    const map = new Map<
      string,
      {
        assignment: FormAssignmentItem;
        latestSubmission: FormSubmission | null;
        status:
          | 'NOT_STARTED'
          | 'DRAFT'
          | 'CORRECTION_DRAFT'
          | 'IN_REVIEW'
          | 'COMPLETED'
          | 'CANCELLED';
        isOverdue: boolean;
      }
    >();

    for (const assign of assignments) {
      const isCancelled = Boolean(assign.cancelledAt);
      const isOverdue =
        !isCancelled &&
        Boolean(assign.dueAt && new Date(assign.dueAt).getTime() < now);

      const relatedSubs = subByAssignment.get(assign.id) || [];
      // Find latest submission: sort by createdAt desc
      relatedSubs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      const latestSub = relatedSubs[0] || null;

      let status:
        | 'NOT_STARTED'
        | 'DRAFT'
        | 'CORRECTION_DRAFT'
        | 'IN_REVIEW'
        | 'COMPLETED'
        | 'CANCELLED' = 'NOT_STARTED';

      if (isCancelled) {
        status = 'CANCELLED';
      } else if (!latestSub) {
        status = 'NOT_STARTED';
      } else if (!latestSub.submittedAt) {
        status = latestSub.supersedesSubmissionId
          ? 'CORRECTION_DRAFT'
          : 'DRAFT';
      } else {
        const inQueue = reviewQueue.some((q) => q.id === latestSub.id);
        if (inQueue) {
          status = 'IN_REVIEW';
        } else {
          status = 'COMPLETED';
        }
      }

      map.set(assign.id, {
        assignment: assign,
        latestSubmission: latestSub,
        status,
        isOverdue: isOverdue && (!latestSub || !latestSub.submittedAt),
      });
    }

    return map;
  }, [assignments, submissions, reviewQueue, now]);

  const filteredTasks = useMemo(() => {
    const list = Array.from(assignmentMap.values());
    if (filterTab === 'PENDING') {
      return list.filter(
        (item) =>
          item.status === 'NOT_STARTED' ||
          item.status === 'DRAFT' ||
          item.status === 'CORRECTION_DRAFT',
      );
    }
    if (filterTab === 'COMPLETED') {
      return list.filter(
        (item) => item.status === 'IN_REVIEW' || item.status === 'COMPLETED',
      );
    }
    return list;
  }, [assignmentMap, filterTab]);

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

  const isPageLoading =
    isCompanyLoading ||
    !activeCompanyId ||
    assignmentsQuery.isLoading ||
    submissionsQuery.isLoading;

  return (
    <PageLayout
      pageId="companyFormTasks"
      title="งานของฉัน"
      description="รายการแบบฟอร์มการตรวจประเมินที่ต้องบันทึกข้อมูลตามรอบงานที่ได้รับมอบหมาย"
      isLoading={isPageLoading}
    >
      <div className="flex flex-col gap-5">
        {/* Filter Navigation */}
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
              ต้องดำเนินการ (
              {
                Array.from(assignmentMap.values()).filter(
                  (i) =>
                    i.status === 'NOT_STARTED' ||
                    i.status === 'DRAFT' ||
                    i.status === 'CORRECTION_DRAFT',
                ).length
              }
              )
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
              ส่งแล้ว / ตรวจรับ (
              {
                Array.from(assignmentMap.values()).filter(
                  (i) =>
                    i.status === 'IN_REVIEW' || i.status === 'COMPLETED',
                ).length
              }
              )
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
        </div>

        {/* Task Cards List */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed bg-card/40">
            <ClipboardList className="size-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-base font-semibold">ไม่มีรายการงานในหมวดนี้</h3>
            <p className="text-xs text-muted-foreground mt-1">
              คุณไม่มีแบบฟอร์มที่ต้องดำเนินการในขณะนี้
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map(({ assignment, latestSubmission, status, isOverdue }) => (
              <div
                key={assignment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-card gap-4 shadow-xs hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm sm:text-base text-foreground">
                        {assignment.templateName || 'แบบฟอร์มตรวจสอบ'}
                      </h4>

                      {/* Status Badges */}
                      {status === 'NOT_STARTED' && (
                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">
                          ยังไม่เริ่ม
                        </Badge>
                      )}
                      {status === 'DRAFT' && (
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          กำลังกรอก (ฉบับร่าง)
                        </Badge>
                      )}
                      {status === 'CORRECTION_DRAFT' && (
                        <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          กำลังแก้ไข
                        </Badge>
                      )}
                      {status === 'IN_REVIEW' && (
                        <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          รอตรวจรับ
                        </Badge>
                      )}
                      {status === 'COMPLETED' && (
                        <Badge variant="default" className="text-xs bg-emerald-600">
                          ส่งแล้ว / เสร็จสิ้น
                        </Badge>
                      )}
                      {status === 'CANCELLED' && (
                        <Badge variant="destructive" className="text-xs">
                          ยกเลิกแล้ว
                        </Badge>
                      )}

                      {/* Overdue Badge */}
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertTriangle className="size-3" />
                          เลยกำหนดส่ง
                        </Badge>
                      )}
                    </div>

                    {assignment.templateDescription && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {assignment.templateDescription}
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-2">
                      {assignment.dueAt ? (
                        <span className="flex items-center gap-1 text-foreground font-medium">
                          <Clock className="size-3.5 text-muted-foreground" />
                          กำหนดส่ง: {formatDateTime(assignment.dueAt)}
                        </span>
                      ) : (
                        <span>
                          สร้างเมื่อ: {assignment.createdAt ? formatDate(assignment.createdAt) : '-'}
                        </span>
                      )}

                      <span>•</span>

                      <Badge variant="outline" className="text-[10px]">
                        {assignment.companyMemberId
                          ? 'มอบหมายส่วนตัว'
                          : assignment.roleName
                            ? `ตำแหน่ง: ${assignment.roleName}`
                            : 'งานของตำแหน่ง'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {status === 'NOT_STARTED' && (
                    <ButtonLoading
                      size="sm"
                      onPress={() => handleStart(assignment.id)}
                      isLoading={
                        startMutation.isPending &&
                        startMutation.variables?.assignmentId === assignment.id
                      }
                    >
                      <Play data-icon="inline-start" />
                      เริ่มกรอก
                    </ButtonLoading>
                  )}

                  {(status === 'DRAFT' || status === 'CORRECTION_DRAFT') &&
                    latestSubmission && (
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/company/forms/submissions/${latestSubmission.id}`,
                          )
                        }
                      >
                        {status === 'CORRECTION_DRAFT' ? (
                          <>
                            <RotateCcw data-icon="inline-start" />
                            แก้ไขต่อ
                          </>
                        ) : (
                          <>
                            <ArrowRight data-icon="inline-end" />
                            ทำต่อ
                          </>
                        )}
                      </Button>
                    )}

                  {status === 'IN_REVIEW' && latestSubmission && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/company/forms/submissions/${latestSubmission.id}`,
                        )
                      }
                    >
                      <FileSearch data-icon="inline-start" />
                      ดูคำตอบที่ส่ง
                    </Button>
                  )}

                  {status === 'COMPLETED' && latestSubmission && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/company/forms/submissions/${latestSubmission.id}`,
                        )
                      }
                    >
                      <CheckCircle2 data-icon="inline-start" className="text-emerald-600" />
                      ดูรายละเอียด
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
