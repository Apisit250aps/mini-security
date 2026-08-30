import { ColumnDef } from '@tanstack/react-table';
import { CompanyMember, Role, User } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import CompanyMemberColumnActions from './company-member-column-actions';

interface CompanyMemberColumnsOptions {
  companyId: string;
  usersMap: Map<string, User>;
  rolesMap: Map<string, Role>;
}

export const companyMemberListColumns = ({
  companyId,
  usersMap,
  rolesMap,
}: CompanyMemberColumnsOptions): ColumnDef<CompanyMember>[] => {
  return [
    {
      id: 'userName',
      header: 'ชื่อสมาชิก',
      cell: ({ row }) => {
        const user = usersMap.get(row.original.userId);
        return user ? (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.userId}
          </span>
        );
      },
    },
    {
      id: 'roleName',
      header: 'บทบาท (Role)',
      cell: ({ row }) => {
        const role = rolesMap.get(row.original.roleId);
        return role ? (
          <Badge variant="outline" className="font-medium">
            {role.name}
          </Badge>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.roleId}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'สถานะ',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">เปิดใช้งาน</Badge>
        ) : (
          <Badge variant="destructive">ปิดใช้งาน</Badge>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: 'วันที่เข้าร่วม',
      cell: ({ getValue }) => formatDate(getValue<Date>()),
    },
    {
      id: 'actions',
      header: 'จัดการ',
      cell: (cell) => (
        <CompanyMemberColumnActions cell={cell} companyId={companyId} />
      ),
    },
  ];
};

export default companyMemberListColumns;
