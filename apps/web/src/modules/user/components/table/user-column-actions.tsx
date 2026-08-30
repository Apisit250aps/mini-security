import { CellContext } from '@tanstack/react-table';
import { User } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCallback } from 'react';
import { useUserDelete } from '../../hooks/user-mutations';
import { useOverlay } from '@repo/ui/hooks';

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
      title: 'Confirm Delete',
      description: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
        await handleDelete(cell.row.original.id);
      },
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'Edit User',
      description: 'Edit the details of the user.',
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
