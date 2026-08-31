import { CellContext } from '@tanstack/react-table';
import { User } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCallback } from 'react';
import { useUserDelete } from '../../hooks/user-mutations';
import { useOverlay } from '@repo/ui/hooks';

import UserEditForm from '../form/user-edit-form';

function UserColumnActions<T extends User>(cell: CellContext<T, unknown>) {
  const ui = useOverlay();
  const deleteMutation = useUserDelete();
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const actionDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบ',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await handleDelete(cell.row.original.id);
        ui.hideAll();
      },
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขผู้ใช้',
      description: 'แก้ไขข้อมูลผู้ใช้และสิทธิ์การใช้งาน',
      children: <UserEditForm user={cell.row.original} />,
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

export default UserColumnActions;
