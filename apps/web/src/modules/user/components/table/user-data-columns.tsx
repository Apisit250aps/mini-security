import { ColumnDef } from '@tanstack/react-table';
import { User } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate, formatDateTime } from '@/shared/utils';
import UserColumnActions from './user-column-actions';

const userListColumns = (): ColumnDef<User>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'ชื่อ',
    },
    {
      accessorKey: 'email',
      header: 'อีเมล',
    },
    {
      accessorKey: 'emailVerified',
      header: 'ยืนยันอีเมล',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">ยืนยันแล้ว</Badge>
        ) : (
          <Badge variant="destructive">ยังไม่ยืนยัน</Badge>
        ),
    },
    {
      accessorKey: 'isAdmin',
      header: 'บทบาท',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">ผู้ดูแลระบบ</Badge>
        ) : (
          <Badge variant="secondary">ผู้ใช้งาน</Badge>
        ),
    },
    {
      accessorKey: 'isActive',
      header: 'สถานะ',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">ใช้งาน</Badge>
        ) : (
          <Badge variant="destructive">ปิดใช้งาน</Badge>
        ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'เข้าใช้ล่าสุด',
      cell: ({ getValue }) => {
        const val = getValue<Date | null>();
        if (!val) return <span className="text-muted-foreground">-</span>;
        return formatDateTime(val);
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
      cell: UserColumnActions,
    },
  ];
};

export default userListColumns;
