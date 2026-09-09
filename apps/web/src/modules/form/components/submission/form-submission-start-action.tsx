'use client';

import React, { useState, useCallback, useId } from 'react';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useOverlay } from '@repo/ui/hooks';
import { PlusCircle, FileText } from 'lucide-react';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useCompanyFormTemplatesQueries } from '../../hooks/form-queries';
import { useFormSubmissionStart } from '../../hooks/form-mutations';
import FormFillerModal from '../fill/form-filler-modal';

interface FormSubmissionStartActionProps {
  companyId: string;
}

function StartSubmissionModalContent({
  companyId,
  onSuccess,
  onClose,
}: {
  companyId: string;
  onSuccess: (submissionId: string, memberId: string) => void;
  onClose: () => void;
}) {
  const selectId = useId();
  const { data: session } = useSession();
  const membersQuery = useCompanyMembersQueries(companyId);
  const currentMember = membersQuery.data?.find(
    (m) => m.userId === session?.user.id && m.isActive,
  );

  const templatesQuery = useCompanyFormTemplatesQueries(companyId);
  const startMutation = useFormSubmissionStart(companyId);

  const activeTemplates = (templatesQuery.data || []).filter((t) => t.isActive);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    activeTemplates[0]?.id || '',
  );

  const handleStart = useCallback(() => {
    if (!currentMember) return;
    if (!selectedTemplateId) return;

    startMutation.mutate(
      {
        formTemplateId: selectedTemplateId,
        roleId: currentMember.roleId,
        memberId: currentMember.id,
      },
      {
        onSuccess: (newSub) => {
          if (newSub?.data?.id) {
            onSuccess(newSub.data.id, currentMember.id);
          } else {
            onClose();
          }
        },
      },
    );
  }, [
    currentMember,
    selectedTemplateId,
    startMutation,
    companyId,
    onSuccess,
    onClose,
  ]);

  if (!currentMember) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        ไม่พบข้อมูลสมาชิกองค์กรที่เปิดใช้งานสำหรับบัญชีของคุณ
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        เลือกแบบฟอร์มที่ต้องการเริ่มบันทึกข้อมูล
        ระบบจะสร้างฉบับร่างร่วมสำหรับบทบาทของคุณ
      </p>

      {templatesQuery.isLoading ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          กำลังโหลดรายการแบบฟอร์ม...
        </div>
      ) : activeTemplates.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          ยังไม่มีแบบฟอร์มที่เปิดใช้งานในระบบ กรุณาติดต่อผู้ดูแลระบบ
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-muted-foreground"
          >
            เลือกแบบฟอร์ม:
          </label>
          <select
            id={selectId}
            value={selectedTemplateId || activeTemplates[0]?.id}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {activeTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onPress={onClose}>
          ยกเลิก
        </Button>
        <ButtonLoading
          onPress={handleStart}
          isLoading={startMutation.isPending}
          isDisabled={activeTemplates.length === 0}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          เริ่มบันทึก
        </ButtonLoading>
      </div>
    </div>
  );
}

export default function FormSubmissionStartAction({
  companyId,
}: FormSubmissionStartActionProps) {
  const ui = useOverlay();

  const handleOpenFiller = useCallback(
    (submissionId: string, memberId: string) => {
      ui.dialog.close();
      // Open filler immediately
      ui.dialog.open({
        title: 'บันทึกแบบฟอร์ม',
        description: 'กรอกข้อมูลตามหัวข้อและบันทึกฉบับร่างหรือส่งเพื่ออนุมัติ',
        size: 'lg',
        children: (
          <FormFillerModal
            submissionId={submissionId}
            companyId={companyId}
            memberId={memberId}
            onClose={() => ui.dialog.close()}
          />
        ),
      });
    },
    [ui.dialog, companyId],
  );

  const handleOpenStart = useCallback(() => {
    ui.dialog.open({
      title: 'เริ่มบันทึกแบบฟอร์มใหม่',
      description: 'เลือกร่างแบบฟอร์มที่ต้องการดำเนินการ',
      size: 'md',
      children: (
        <StartSubmissionModalContent
          companyId={companyId}
          onSuccess={handleOpenFiller}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, companyId, handleOpenFiller]);

  return (
    <Button onPress={handleOpenStart}>
      <PlusCircle className="w-4 h-4 mr-1" />
      เริ่มบันทึกฟอร์มใหม่
    </Button>
  );
}
