import { CellContext } from '@tanstack/react-table';
import { Role } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCallback } from 'react';
import { useRoleDelete } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { useSession } from '@/modules/auth/hooks/session-provider';
import RoleEditForm from '../form/role-edit-form';
import RolePermissionManager from '../permission-manager/role-permission-manager';

function RoleColumnActions<T extends Role>(cell: CellContext<T, unknown>) {
  const ui = useOverlay();
  const session = useSession();
  const deleteMutation = useRoleDelete();
  const isSystemDefault = cell.row.original.isSystemDefault;
  const isSuperAdmin = session.isSuperAdmin;

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const isReadOnly = isSystemDefault && !isSuperAdmin;

  const actionDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบ',
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
      title: isReadOnly ? 'รายละเอียดบทบาท' : 'แก้ไขบทบาท',
      description: isReadOnly
        ? 'ดูรายละเอียดบทบาทมาตรฐานของระบบ'
        : 'แก้ไขรายละเอียดบทบาทและสิทธิ์การใช้งาน',
      size: 'lg',
      children: <RoleEditForm role={cell.row.original} readOnly={isReadOnly} />,
    });
  };

  const actionManagePermissions = () => {
    ui.dialog.open({
      title: isReadOnly
        ? `สิทธิ์การใช้งาน: ${cell.row.original.name}`
        : `จัดการสิทธิ์: ${cell.row.original.name}`,
      description: isReadOnly
        ? 'ดูรายการสิทธิ์การเข้าถึงสำหรับบทบาทมาตรฐานของระบบนี้'
        : 'เลือกและกำหนดสิทธิ์การเข้าถึงสำหรับบทบาทนี้',
      size: '2xl',
      children: (
        <RolePermissionManager role={cell.row.original} readOnly={isReadOnly} />
      ),
    });
  };

  if (isReadOnly) {
    return (
      <ColumnActions
        actions={{
          ดูสิทธิ์การใช้งาน: {
            onAction: actionManagePermissions,
          },
          ดูรายละเอียด: {
            onAction: actionEdit,
          },
        }}
      />
    );
  }

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
