import { CellContext } from '@tanstack/react-table';
import { Permission } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCallback } from 'react';
import { usePermissionDelete } from '../../hooks/permission-mutations';
import { useOverlay } from '@repo/ui/hooks';
import PermissionEditForm from '../form/permission-edit-form';

function PermissionColumnActions<T extends Permission>(
  cell: CellContext<T, unknown>,
) {
  const ui = useOverlay();
  const deleteMutation = usePermissionDelete();
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const actionDelete = () => {
    ui.alert.open({
      title: 'Confirm Delete',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการลบสิทธิ์นี้?',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await handleDelete(cell.row.original.id);
        ui.hideAll();
      },
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขสิทธิ์',
      description: 'แก้ไขรายละเอียดและการกำหนดสิทธิ์',
      children: <PermissionEditForm permission={cell.row.original} />,
    });
  };

  return (
    <ColumnActions
      actions={{
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

export default PermissionColumnActions;
