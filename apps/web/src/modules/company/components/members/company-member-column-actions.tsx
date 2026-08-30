import React, { useCallback } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { CompanyMember, Role } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCompanyMemberRemove } from '../../hooks/company-mutations';
import { useOverlay } from '@repo/ui/hooks';
import CompanyMemberEditForm from './company-member-edit-form';

interface CompanyMemberColumnActionsProps<T extends CompanyMember> {
  cell: CellContext<T, unknown>;
  companyId: string;
  roles?: Role[];
}

export default function CompanyMemberColumnActions<T extends CompanyMember>({
  cell,
  companyId,
  roles = [],
}: CompanyMemberColumnActionsProps<T>) {
  const ui = useOverlay();
  const removeMutation = useCompanyMemberRemove(companyId);

  const member = cell.row.original;
  const currentRole = roles.find((r) => r.id === member.roleId);
  const isOwner = currentRole?.name.toLowerCase() === 'owner';

  const handleRemove = useCallback(
    async (memberId: string) => {
      await removeMutation.mutateAsync(memberId);
    },
    [removeMutation],
  );

  const actionDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบสมาชิก',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกนี้ออกจากบริษัท?',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await handleRemove(member.id);
        ui.hideAll();
      },
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขสมาชิกและบทบาท',
      description: 'ปรับเปลี่ยนบทบาทและสถานะการทำงานของสมาชิกในบริษัท',
      size: 'lg',
      children: <CompanyMemberEditForm companyId={companyId} member={member} />,
    });
  };

  // If member is the Owner, they cannot be modified or deleted
  if (isOwner) {
    return (
      <span className="text-xs text-muted-foreground italic">
        เจ้าขององค์กร (คงที่)
      </span>
    );
  }

  return (
    <ColumnActions
      actions={{
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
