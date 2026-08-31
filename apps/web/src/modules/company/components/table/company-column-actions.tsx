import { CellContext } from '@tanstack/react-table';
import { Company } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyDelete } from '../../hooks/company-mutations';
import { useOverlay } from '@repo/ui/hooks';
import CompanyEditForm from '../form/company-edit-form';

function CompanyColumnActions<T extends Company>(
  cell: CellContext<T, unknown>,
) {
  const router = useRouter();
  const ui = useOverlay();
  const deleteMutation = useCompanyDelete();
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const actionDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบ',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการลบบริษัทนี้?',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await handleDelete(cell.row.original.id);
        ui.hideAll();
      },
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขข้อมูลบริษัท',
      description: 'แก้ไขรายละเอียดบริษัทและสถานะการใช้งาน',
      size: 'lg',
      children: <CompanyEditForm company={cell.row.original} />,
    });
  };

  const actionManage = () => {
    router.push(`/admin/company/${cell.row.original.id}`);
  };

  return (
    <ColumnActions
      actions={{
        จัดการ: {
          onAction: actionManage,
        },
        แก้ไข: {
          onAction: actionEdit,
        },
        ลบ: {
          onAction: actionDelete,
          variant: 'destructive',
        },
      }}
    />
  );
}

export default CompanyColumnActions;
