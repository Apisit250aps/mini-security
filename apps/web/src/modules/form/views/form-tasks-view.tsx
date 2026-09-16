'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ClipboardList, Clock } from 'lucide-react';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Badge } from '@repo/ui/components/badge';
import { toast } from '@repo/ui/components/sonner';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useMyAssignmentsQueries } from '../hooks/form-queries';
import { useFormSubmissionStart } from '../hooks/form-mutations';
import { getErrorMessage } from '@/shared/utils';
import { formatDate, formatDateTime } from '@/shared/utils/date';

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

  const startMutation = useFormSubmissionStart(activeCompanyId || '');

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
      }
    );
  };

  const isPageLoading = isCompanyLoading || !activeCompanyId || assignmentsQuery.isLoading;
  const assignments = assignmentsQuery.data || [];

  return (
    <PageLayout
      pageId="companyFormTasks"
      title="งานของฉัน"
      description="รายการแบบฟอร์มที่ต้องบันทึกข้อมูล"
      isLoading={isPageLoading}
    >
      <div className="flex flex-col gap-4">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed">
            <ClipboardList className="size-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">ยังไม่มีงานที่ได้รับมอบหมาย</h3>
            <p className="text-sm text-muted-foreground">คุณไม่มีแบบฟอร์มที่ต้องบันทึกในขณะนี้</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{assignment.templateName || 'แบบฟอร์มตรวจสอบ'}</h4>
                    {assignment.templateDescription && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{assignment.templateDescription}</p>
                    )}
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-1.5">
                      {assignment.dueAt ? (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          กำหนดส่ง: {formatDateTime(assignment.dueAt)}
                        </span>
                      ) : (
                        <span>สร้างเมื่อ: {assignment.createdAt ? formatDate(assignment.createdAt) : '-'}</span>
                      )}
                      <span>•</span>
                      <Badge variant="outline">
                        {assignment.companyMemberId
                          ? 'งานส่วนตัว'
                          : assignment.roleName
                            ? `ตำแหน่ง: ${assignment.roleName}`
                            : 'งานของตำแหน่ง'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <ButtonLoading
                  onPress={() => handleStart(assignment.id)}
                  isLoading={startMutation.isPending && startMutation.variables?.assignmentId === assignment.id}
                >
                  เริ่มทำ
                </ButtonLoading>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
