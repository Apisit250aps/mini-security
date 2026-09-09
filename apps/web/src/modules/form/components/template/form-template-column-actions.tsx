'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CellContext } from '@tanstack/react-table';
import type { FormTemplate } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import { formServicesGetTemplate } from '@repo/client';
import { toast } from '@repo/ui/components/sonner';
import { getErrorMessage } from '@/shared/utils';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useFormVersionPublish } from '../../hooks/form-mutations';
import FormTemplateEditDialog from './form-template-edit-dialog';
import FormTemplateRolesDialog from './form-template-roles-dialog';
import FormTemplateSectionDialog from './form-template-section-dialog';
import FormTemplateFieldDialog from './form-template-field-dialog';
import FormTemplatePreviewDialog from './form-template-preview-dialog';

interface FormTemplateColumnActionsProps<T extends FormTemplate> {
  cell: CellContext<T, unknown>;
  companyId: string;
}

export default function FormTemplateColumnActions<T extends FormTemplate>({
  cell,
  companyId,
}: FormTemplateColumnActionsProps<T>) {
  const router = useRouter();
  const ui = useOverlay();
  const template = cell.row.original;
  const publishMutation = useFormVersionPublish(companyId, template.id);

  const { data: session } = useSession();
  const membersQuery = useCompanyMembersQueries(companyId);
  const currentMember = membersQuery.data?.find(
    (m) => m.userId === session?.user.id && m.isActive,
  );
  const memberId = currentMember?.id || session?.user.id || '';

  const actionPreview = useCallback(() => {
    ui.dialog.open({
      title: 'ตัวอย่างโครงสร้างแบบฟอร์ม',
      description: template.name,
      size: 'lg',
      children: (
        <FormTemplatePreviewDialog
          templateId={template.id}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, template]);

  const actionEdit = useCallback(() => {
    ui.dialog.open({
      title: 'แก้ไขข้อมูลแบบฟอร์ม',
      description: 'ปรับปรุงชื่อ คำอธิบาย หรือสถานะการใช้งาน',
      size: 'lg',
      children: (
        <FormTemplateEditDialog
          companyId={companyId}
          template={template}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, companyId, template]);

  const actionRoles = useCallback(async () => {
    // Fetch template detail to get current roles
    const res = await formServicesGetTemplate({ path: { id: template.id } });
    const detail = res.data?.data;
    if (!detail) {
      toast.error('ไม่สามารถโหลดข้อมูลสิทธิ์ของแบบฟอร์มได้');
      return;
    }

    ui.dialog.open({
      title: 'จัดการสิทธิ์ตำแหน่งที่เข้าถึงฟอร์มได้',
      description: template.name,
      size: 'md',
      children: (
        <FormTemplateRolesDialog
          companyId={companyId}
          templateId={template.id}
          currentRoles={detail.roles}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, companyId, template]);

  const actionAddSection = useCallback(async () => {
    const res = await formServicesGetTemplate({ path: { id: template.id } });
    const detail = res.data?.data;
    const formVersionId = detail?.draftVersion?.id || detail?.activeVersion?.id;

    if (!formVersionId) {
      toast.error('ไม่พบเวอร์ชันแบบฟอร์มที่กำลังออกแบบ');
      return;
    }

    const sectionsCount = detail?.sections.length || 0;

    ui.dialog.open({
      title: 'เพิ่มหมวดหมู่คำถาม (Section)',
      description: `แบบฟอร์ม: ${template.name}`,
      size: 'md',
      children: (
        <FormTemplateSectionDialog
          companyId={companyId}
          templateId={template.id}
          formVersionId={formVersionId}
          currentSectionsCount={sectionsCount}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, companyId, template]);

  const actionAddField = useCallback(async () => {
    const res = await formServicesGetTemplate({ path: { id: template.id } });
    const detail = res.data?.data;
    const formVersionId = detail?.draftVersion?.id || detail?.activeVersion?.id;

    if (!formVersionId) {
      toast.error('ไม่พบเวอร์ชันแบบฟอร์มที่กำลังออกแบบ');
      return;
    }

    if (!detail || detail.sections.length === 0) {
      toast.error('กรุณาสร้างหมวดหมู่คำถาม (Section) ก่อนเพิ่มคำถาม');
      return;
    }

    ui.dialog.open({
      title: 'เพิ่มคำถามใหม่ (Field)',
      description: `แบบฟอร์ม: ${template.name}`,
      size: 'lg',
      children: (
        <FormTemplateFieldDialog
          companyId={companyId}
          templateId={template.id}
          formVersionId={formVersionId}
          sections={detail.sections}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, companyId, template]);

  const actionPublish = useCallback(async () => {
    const res = await formServicesGetTemplate({ path: { id: template.id } });
    const detail = res.data?.data;
    const draftVersion = detail?.draftVersion;

    if (!draftVersion) {
      toast.error('ไม่พบฉบับร่างที่พร้อมเผยแพร่');
      return;
    }

    if (!detail?.fields || detail.fields.length === 0) {
      toast.error('แบบฟอร์มต้องมีคำถามอย่างน้อย 1 ข้อก่อนเผยแพร่');
      return;
    }

    ui.alert.open({
      title: 'ยืนยันการเผยแพร่แบบฟอร์ม',
      description: `ต้องการเผยแพร่ ${template.name} (เวอร์ชัน v${draftVersion.version}) ใช่หรือไม่? สมาชิกองค์กรที่มีสิทธิ์จะสามารถเริ่มบันทึกข้อมูลได้ทันที`,
      confirmVariant: 'default',
      onConfirm: () => {
        publishMutation.mutate(
          { memberId },
          {
            onSuccess: () => {
              ui.alert.close();
            },
            onError: (err) => {
              toast.error(getErrorMessage(err, 'ไม่สามารถเผยแพร่แบบฟอร์มได้'));
            },
          },
        );
      },
    });
  }, [ui.alert, template, publishMutation, memberId]);

  return (
    <ColumnActions
      actions={{
        'ออกแบบและจัดการฟิลด์ (Builder)': {
          onAction: () =>
            router.push(`/company/forms/templates/${template.id}/builder`),
        },
        ดูตัวอย่างแบบฟอร์ม: {
          onAction: actionPreview,
        },
        'กำหนดสิทธิ์ Role': {
          onAction: actionRoles,
        },
        'เพิ่มหมวดหมู่ (Section)': {
          onAction: actionAddSection,
        },
        'เพิ่มคำถาม (Field)': {
          onAction: actionAddField,
        },
        'เผยแพร่เวอร์ชัน (Publish)': {
          onAction: actionPublish,
        },
        แก้ไขข้อมูลแบบฟอร์ม: {
          onAction: actionEdit,
        },
      }}
    />
  );
}
