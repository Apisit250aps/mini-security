import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Permission } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { useOverlay } from '@repo/ui/hooks';
import { formatDate } from '@/shared/utils';
import PermissionEditForm from '../form/permission-edit-form';
import PermissionColumnActions from './permission-column-actions';

function PermissionActionCell({
  permission,
}: {
  permission: Permission;
}) {
  const ui = useOverlay();

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขรายละเอียดสิทธิ์',
      description: `แก้ไขคำอธิบายสำหรับสิทธิ์ ${permission.action}`,
      children: <PermissionEditForm permission={permission} />,
    });
  };

  return (
    <button
      type="button"
      onClick={handleEdit}
      className="text-left group cursor-pointer"
    >
      <Badge
        variant="secondary"
        className="font-mono group-hover:bg-primary/20 group-hover:text-primary transition-colors"
      >
        {permission.action}
      </Badge>
    </button>
  );
}

const permissionListColumns = (): ColumnDef<Permission>[] => {
  return [
    {
      accessorKey: 'module',
      header: 'โมดูล (Module)',
      cell: ({ getValue }) => (
        <Badge variant="outline" className="font-mono">
          {getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: 'action',
      header: 'การกระทำ (Action)',
      cell: ({ row }) => <PermissionActionCell permission={row.original} />,
    },
    {
      accessorKey: 'description',
      header: 'คำอธิบาย',
      cell: ({ getValue }) => {
        const val = getValue<string | null>();
        return val || <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'วันที่สร้าง',
      cell: ({ getValue }) => formatDate(getValue<Date>()),
    },
    {
      id: 'actions',
      header: 'จัดการ',
      cell: PermissionColumnActions,
    },
  ];
};

export default permissionListColumns;
