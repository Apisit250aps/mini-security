import { ColumnDef } from '@tanstack/react-table';
import { Permission } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import PermissionColumnActions from './permission-column-actions';

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
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="font-mono">
          {getValue<string>()}
        </Badge>
      ),
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
