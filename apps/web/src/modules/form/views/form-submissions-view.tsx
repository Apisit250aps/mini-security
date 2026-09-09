'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Shield, Clock } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { toast } from '@repo/ui/components/sonner';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import {
  useCompanyFormTemplatesQueries,
  useFormSubmissionsQueries,
} from '../hooks/form-queries';
import { useFormSubmissionStart } from '../hooks/form-mutations';
import { getErrorMessage } from '@/shared/utils';
import type { FormSubmission } from '@repo/domains/entities';

import FormSubmissionDataTable from '../components/submission/form-submission-data-table';
import ActiveFormTable from '../components/submission/active-form-table';

export default function FormSubmissionsView() {
  const router = useRouter();
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'forms' | 'history'>('forms');

  const membersQuery = useCompanyMembersQueries(activeCompanyId || '');
  const rolesQuery = useCompanyRolesQueries(activeCompanyId || '');
  const templatesQuery = useCompanyFormTemplatesQueries(activeCompanyId || '');
  const submissionsQuery = useFormSubmissionsQueries({
    companyId: activeCompanyId || '',
  });

  const startMutation = useFormSubmissionStart(activeCompanyId || '');

  const currentMember = membersQuery.data?.find(
    (m) => m.userId === session?.user.id && m.isActive,
  );
  const currentRoleId = currentMember?.roleId;
  const roles = rolesQuery.data || [];
  const currentRole = roles.find((r) => r.id === currentRoleId);

  const activeTemplates = useMemo(() => {
    return (templatesQuery.data || []).filter((t) => t.isActive);
  }, [templatesQuery.data]);

  // Find active shared drafts per template for current role
  const activeDraftsByTemplate = useMemo(() => {
    const map = new Map<string, FormSubmission>();
    if (!submissionsQuery.data || !currentRoleId) return map;

    for (const sub of submissionsQuery.data) {
      if (sub.roleId === currentRoleId && sub.status === 'DRAFT') {
        map.set(sub.formTemplateId, sub);
      }
    }
    return map;
  }, [submissionsQuery.data, currentRoleId]);

  const handleStartOrJoin = useCallback(
    (templateId: string) => {
      if (!currentMember || !activeCompanyId) {
        toast.error('ไม่พบข้อมูลสมาชิกองค์กรของคุณ');
        return;
      }

      startMutation.mutate(
        {
          formTemplateId: templateId,
          roleId: currentMember.roleId,
          memberId: currentMember.id,
        },
        {
          onSuccess: (res) => {
            const sub = res?.data;
            if (sub?.id) {
              router.push(`/company/forms/submissions/${sub.id}`);
            }
          },
          onError: (err) => {
            toast.error(
              getErrorMessage(
                err,
                'ไม่สามารถเปิดหรือสร้างแบบฟอร์มสำหรับบทบาทของคุณได้',
              ),
            );
          },
        },
      );
    },
    [currentMember, activeCompanyId, startMutation, router],
  );

  const isPageLoading =
    isCompanyLoading ||
    !activeCompanyId ||
    membersQuery.isLoading ||
    templatesQuery.isLoading;

  return (
    <PageLayout
      pageId="companyFormSubmissions"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดรายการแบบฟอร์มและผลการตรวจ..."
    >
      <div className="flex flex-col gap-6">
        {/* Role Context Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/70 bg-muted/20">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Shield className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  บทบาทของคุณในการตรวจ:
                </span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {currentRole?.name || 'สมาชิกทั่วไป'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                รายการแบบฟอร์มที่เปิดใช้งานตามบทบาทของคุณ
                สามารถเลือกแบบฟอร์มเพื่อเริ่มหรือบันทึกข้อมูลต่อได้ทันที
              </p>
            </div>
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-1 shrink-0 self-start sm:self-auto">
            <Button
              variant={activeTab === 'forms' ? 'default' : 'ghost'}
              size="sm"
              className="gap-1.5 text-xs h-8"
              onPress={() => setActiveTab('forms')}
            >
              <ClipboardCheck className="size-3.5" />
              แบบฟอร์มที่ต้องตรวจ ({activeTemplates.length})
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              size="sm"
              className="gap-1.5 text-xs h-8"
              onPress={() => setActiveTab('history')}
            >
              <Clock className="size-3.5" />
              ประวัติและผลการตรวจทั้งหมด
            </Button>
          </div>
        </div>

        {/* TAB 1: ACTIVE FORMS TABLE */}
        {activeTab === 'forms' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-5 text-primary" />
                <h2 className="text-base font-semibold tracking-tight">
                  ตารางรายการแบบฟอร์มที่พร้อมใช้งาน
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">
                เลือกแบบฟอร์มเพื่อบันทึกข้อมูล
              </span>
            </div>

            <ActiveFormTable
              templates={activeTemplates}
              activeDraftsByTemplate={activeDraftsByTemplate}
              onStartOrJoin={handleStartOrJoin}
              pendingTemplateId={
                startMutation.isPending
                  ? startMutation.variables?.formTemplateId
                  : undefined
              }
              isLoading={templatesQuery.isLoading}
            />
          </div>
        )}

        {/* TAB 2: SUBMISSIONS HISTORY & RESULTS TABLE */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  ตารางประวัติการตรวจและผลคำตอบทั้งหมด
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ตรวจสอบสถานะแบบฟอร์มที่ส่งแล้ว การอนุมัติ และฉบับร่างย้อนหลัง
                </p>
              </div>
            </div>

            <FormSubmissionDataTable companyId={activeCompanyId} />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
