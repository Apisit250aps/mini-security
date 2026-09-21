'use client';

import React, { useCallback } from 'react';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import type { CellContext } from '@tanstack/react-table';
import type { OrganizationMember, Role } from '@repo/client';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOrganizationMemberRemove } from '../../hooks/organization-mutations';
import { useOverlay } from '@repo/ui/hooks';
import OrganizationMemberEditForm from './organization-member-edit-form';
import MemberQuotasModal from '@/modules/leave/components/quotas/member-quotas-modal';

interface OrganizationMemberColumnActionsProps<T extends OrganizationMember> {
  cell: CellContext<T, unknown>;
  organizationId?: string;
  roles?: Role[];
  userName?: string;
}

export default function OrganizationMemberColumnActions<
  T extends OrganizationMember,
>({
  cell,
  organizationId,
  roles = [],
  userName,
}: OrganizationMemberColumnActionsProps<T>) {
  const orgId = organizationId || '';
  const ui = useOverlay();
  const removeMutation = useOrganizationMemberRemove(orgId);
  const { isSuperAdmin } = usePermission();
  const member = cell.row.original;
  const currentRole = roles.find((r) => r.id === member.roleId);
  const isOwner = currentRole?.name.toLowerCase() === 'owner';

  const handleRemove = useCallback(
    async (memberId: string) => {
      await removeMutation.mutateAsync(memberId);
    },
    [removeMutation],
  );

  const actionDelete = useCallback(() => {
    ui.alert.open({
      title: 'ยืนยันการลบสมาชิก',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกนี้ออกจากองค์กร?',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await handleRemove(member.id);
        ui.hideAll();
      },
    });
  }, [ui, handleRemove, member.id]);

  const actionEdit = useCallback(() => {
    ui.sheet.open({
      title: 'แก้ไขสมาชิกและบทบาท',
      description: 'ปรับเปลี่ยนบทบาทและสถานะการทำงานของสมาชิกในองค์กร',
      size: 'lg',
      children: (
        <OrganizationMemberEditForm
          organizationId={orgId}
          member={member}
          onSuccess={() => ui.sheet.close()}
        />
      ),
    });
  }, [ui.sheet, orgId, member]);

  const actionManageQuotas = useCallback(() => {
    ui.sheet.open({
      title: 'จัดการโควต้าวันลาพนักงาน',
      description: `โควต้าและสถิติการใช้วันลาของ ${userName || 'สมาชิก'}`,
      size: 'xl',
      children: (
        <MemberQuotasModal
          member={member}
          organizationId={orgId}
          userName={userName}
        />
      ),
    });
  }, [ui.sheet, userName, member, orgId]);

  // If member is the Owner and the current user is not a Super Admin, they cannot be modified or deleted
  if (isOwner && !isSuperAdmin) {
    return (
      <span className="text-xs text-muted-foreground italic">
        เจ้าขององค์กร (คงที่)
      </span>
    );
  }

  return (
    <ColumnActions
      actions={{
        จัดการโควต้าวันลา: {
          onAction: actionManageQuotas,
        },
        แก้ไขบทบาท: {
          onAction: actionEdit,
        },
        ลบสมาชิก: {
          onAction: actionDelete,
          variant: 'destructive',
        },
      }}
    />
  );
}
