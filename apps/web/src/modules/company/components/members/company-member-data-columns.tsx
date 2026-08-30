import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CompanyMember, Role, User } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import CompanyMemberColumnActions from './company-member-column-actions';
import CompanyMemberRoleSelect from './company-member-role-select';

interface CompanyMemberColumnsOptions {
  companyId: string;
  usersMap: Map<string, User>;
  roles: Role[];
}

export const companyMemberListColumns = ({
  companyId,
  usersMap,
  roles,
}: CompanyMemberColumnsOptions): ColumnDef<CompanyMember>[] => {
  return [
    {
      id: 'userName',
      header: 'ชื่อสมาชิก / พนักงาน',
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
      id: 'roleSelect',
      header: 'มอบหมายบทบาท (Role)',
      cell: ({ row }) => {
        return (
          <CompanyMemberRoleSelect
            member={row.original}
            companyId={companyId}
            roles={roles}
          />
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
