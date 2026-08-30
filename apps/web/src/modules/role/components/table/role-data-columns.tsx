import { ColumnDef } from '@tanstack/react-table';
import { Role } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import RoleColumnActions from './role-column-actions';

const roleListColumns = (): ColumnDef<Role>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'ชื่อบทบาท',
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
      accessorKey: 'isSystemDefault',
      header: 'ประเภท',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">System Default</Badge>
        ) : (
          <Badge variant="secondary">Custom</Badge>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: 'วันที่สร้าง',
      cell: ({ getValue }) => formatDate(getValue<Date>()),
    },
    {
      id: 'actions',
      header: 'จัดการ',
      cell: RoleColumnActions,
    },
  ];
};

export default roleListColumns;
