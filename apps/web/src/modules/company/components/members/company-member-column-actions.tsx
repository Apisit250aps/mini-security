import { CellContext } from '@tanstack/react-table';
import { CompanyMember } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCallback } from 'react';
import { useCompanyMemberRemove } from '../../hooks/company-mutations';
import { useOverlay } from '@repo/ui/hooks';
import CompanyMemberEditForm from './company-member-edit-form';

interface CompanyMemberColumnActionsProps<T extends CompanyMember> {
  cell: CellContext<T, unknown>;
  companyId: string;
}

export default function CompanyMemberColumnActions<T extends CompanyMember>({
  cell,
  companyId,
}: CompanyMemberColumnActionsProps<T>) {
  const ui = useOverlay();
  const removeMutation = useCompanyMemberRemove(companyId);

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
        await handleRemove(cell.row.original.id);
        ui.hideAll();
      },
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขสมาชิกและบทบาท',
      description: 'ปรับเปลี่ยนบทบาทและสถานะการทำงานของสมาชิกในบริษัท',
      size: 'lg',
      children: (
        <CompanyMemberEditForm
          companyId={companyId}
          member={cell.row.original}
        />
      ),
    });
  };

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
