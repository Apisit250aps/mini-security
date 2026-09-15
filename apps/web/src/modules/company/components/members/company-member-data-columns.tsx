import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CompanyBranch, CompanyMember, Role } from '@repo/client';
import type { User } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { useOverlay } from '@repo/ui/hooks';
import { formatDate } from '@/shared/utils';
import CompanyMemberEditForm from './company-member-edit-form';
import CompanyMemberColumnActions from './company-member-column-actions';
import CompanyMemberRoleSelect from './company-member-role-select';
import CompanyMemberBranchSelect from './company-member-branch-select';

interface CompanyMemberColumnsOptions {
  companyId: string;
  usersMap: Map<string, User>;
  roles: Role[];
  branches: CompanyBranch[];
}

function MemberNameCell({
  member,
  user,
  companyId,
}: {
  member: CompanyMember;
  user?: User;
  companyId: string;
}) {
  const ui = useOverlay();
  const displayName = user?.name || `สมาชิก #${member.id.slice(0, 6)}`;
  const subText = user?.email || 'ไม่ระบุข้อมูลบัญชี';

  const handleClick = () => {
    ui.sheet.open({
      title: 'แก้ไขสมาชิกและบทบาท',
      description: 'ปรับเปลี่ยนบทบาทและสถานะการทำงานของสมาชิกในบริษัท',
      size: 'lg',
      children: (
        <CompanyMemberEditForm
          companyId={companyId}
          member={member}
          onSuccess={() => ui.sheet.close()}
        />
      ),
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col text-left group cursor-pointer"
    >
      <span className="font-semibold text-sm text-primary hover:underline transition-colors">
        {displayName}
      </span>
      <span className="text-xs text-muted-foreground">{subText}</span>
    </button>
  );
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
        return (
          <MemberNameCell
            member={row.original}
            user={user}
            companyId={companyId}
          />
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
