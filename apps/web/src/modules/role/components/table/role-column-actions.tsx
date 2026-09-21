import { CellContext } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { Role } from '@repo/client';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCallback } from 'react';
import { useRoleDelete } from '../../hooks/role-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import RoleEditForm from '../form/role-edit-form';

interface RoleColumnActionsProps<T extends Role> {
  cell: CellContext<T, unknown>;
  organizationId?: string;
}

function RoleColumnActions<T extends Role>({
  cell,
  organizationId,
}: RoleColumnActionsProps<T>) {
  const orgId = organizationId;
  const router = useRouter();
  const ui = useOverlay();
  const { isSuperAdmin } = usePermission();
  const deleteMutation = useRoleDelete();
  const role = cell.row.original;
  const isSystemDefault = role.isSystemDefault;

  const basePath = orgId
    ? '/organization/role'
    : role.organizationId
      ? '/organization/role'
      : '/admin/role';

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
        await handleDelete(role.id);
        ui.hideAll();
      },
    });
  };

  const actionManage = (tab: 'general' | 'permissions' | 'features') => {
    router.push(`${basePath}/${role.id}?tab=${tab}`);
  };

  const actionQuickEdit = () => {
    ui.sheet.open({
      title: isReadOnly ? 'รายละเอียดบทบาท' : 'แก้ไขบทบาทด่วน',
      description: isReadOnly
        ? 'ดูรายละเอียดบทบาทมาตรฐานของระบบ'
        : 'ปรับปรุงชื่อและประเภทของบทบาท',
      size: 'lg',
      children: (
        <RoleEditForm
          role={role}
          readOnly={isReadOnly}
          onSuccess={() => ui.sheet.close()}
        />
      ),
    });
  };

  if (isReadOnly) {
    return (
      <ColumnActions
        actions={{
          'ดูสิทธิ์การใช้งาน (Permissions)': {
            onAction: () => actionManage('permissions'),
          },
          'ดูฟีเจอร์ที่ดูแล (Features)': {
            onAction: () => actionManage('features'),
          },
          ดูรายละเอียดบทบาท: {
            onAction: () => actionManage('general'),
          },
        }}
      />
    );
  }

  return (
    <ColumnActions
      actions={{
        'จัดการสิทธิ์ (Permissions Matrix)': {
          onAction: () => actionManage('permissions'),
        },
        'มอบหมายฟีเจอร์ (Features)': {
          onAction: () => actionManage('features'),
        },
        จัดการบทบาทเชิงลึก: {
          onAction: () => actionManage('general'),
        },
        'แก้ไขข้อมูลด่วน (Quick Edit)': {
          onAction: actionQuickEdit,
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
