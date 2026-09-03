import { CellContext } from '@tanstack/react-table';
import { Role } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCallback } from 'react';
import { useRoleDelete } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { useSession } from '@/modules/auth/hooks/session-provider';
import RoleEditForm from '../form/role-edit-form';
import RolePermissionManager from '../permission-manager/role-permission-manager';
import RoleFeatureManager from '../feature-delegation/role-feature-manager';

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
      size: '5xl',
      children: (
        <RolePermissionManager role={cell.row.original} readOnly={isReadOnly} />
      ),
    });
  };

  const actionManageFeatures = () => {
    const companyId =
      cell.row.original.companyId ||
      (session.data?.session as { activeCompanyId?: string })
        ?.activeCompanyId ||
      '';
    ui.dialog.open({
      title: isReadOnly
        ? `ฟีเจอร์ที่ดูแล: ${cell.row.original.name}`
        : `มอบหมายฟีเจอร์: ${cell.row.original.name}`,
      description: isReadOnly
        ? 'ดูรายการฟีเจอร์ที่มอบหมายให้บทบาทนี้'
        : 'เลือกฟีเจอร์ขององค์กรที่ต้องการให้บทบาทนี้ดูแลและเข้าถึง',
      size: '4xl',
      children: (
        <RoleFeatureManager
          role={cell.row.original}
          companyId={companyId}
          readOnly={isReadOnly}
        />
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
          ดูฟีเจอร์ที่ดูแล: {
            onAction: actionManageFeatures,
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
        มอบหมายฟีเจอร์: {
          onAction: actionManageFeatures,
        },
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
