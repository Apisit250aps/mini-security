import { CellContext } from '@tanstack/react-table';
import { Role } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCallback } from 'react';
import { useRoleDelete } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';
import RoleEditForm from '../form/role-edit-form';
import RolePermissionManager from '../permission-manager/role-permission-manager';

function RoleColumnActions<T extends Role>(cell: CellContext<T, unknown>) {
  const ui = useOverlay();
  const deleteMutation = useRoleDelete();
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const actionDelete = () => {
    ui.alert.open({
      title: 'Confirm Delete',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการลบบทบาทนี้?',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await handleDelete(cell.row.original.id);
        ui.hideAll();
      },
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขบทบาท',
      description: 'แก้ไขรายละเอียดบทบาทและสิทธิ์การใช้งาน',
      size: 'lg',
      children: <RoleEditForm role={cell.row.original} />,
    });
  };

  const actionManagePermissions = () => {
    ui.dialog.open({
      title: `จัดการสิทธิ์: ${cell.row.original.name}`,
      description: 'เลือกและกำหนดสิทธิ์การเข้าถึงสำหรับบทบาทนี้',
      size: '2xl',
      children: <RolePermissionManager role={cell.row.original} />,
    });
  };

  return (
    <ColumnActions
      actions={{
        จัดการสิทธิ์: {
          onAction: actionManagePermissions,
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

export default RoleColumnActions;
