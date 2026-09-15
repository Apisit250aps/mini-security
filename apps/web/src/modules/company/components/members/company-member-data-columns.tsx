import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CompanyBranch, CompanyMember, Role } from '@repo/client';
import type { User } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import CompanyMemberColumnActions from './company-member-column-actions';
import CompanyMemberRoleSelect from './company-member-role-select';
import CompanyMemberBranchSelect from './company-member-branch-select';

interface CompanyMemberColumnsOptions {
  companyId: string;
  usersMap: Map<string, User>;
  roles: Role[];
  branches: CompanyBranch[];
}

export const companyMemberListColumns = ({
  companyId,
  usersMap,
  roles,
  branches,
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
          <div className="flex flex-col">
            <span className="font-medium text-sm text-muted-foreground">
              สมาชิก #{row.original.id.slice(0, 6)}
            </span>
            <span className="text-xs text-muted-foreground">
              ไม่ระบุข้อมูลบัญชี
            </span>
          </div>
        );
      },
    },
    {
      id: 'branchSelect',
      header: 'สาขาสังกัด (Branch)',
      cell: ({ row }) => {
        return (
          <CompanyMemberBranchSelect
            member={row.original}
            companyId={companyId}
            branches={branches}
          />
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
      cell: (cell) => {
        const user = usersMap.get(cell.row.original.userId);
        const userName = user
          ? `${user.name} (${user.email})`
          : `สมาชิก #${cell.row.original.id.slice(0, 6)}`;
        return (
          <CompanyMemberColumnActions
            cell={cell}
            companyId={companyId}
            roles={roles}
            userName={userName}
          />
        );
      },
    },
  ];
};

export default companyMemberListColumns;
