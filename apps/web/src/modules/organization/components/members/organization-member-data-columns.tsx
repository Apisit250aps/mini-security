import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Site, OrganizationMember, Role, User } from '@repo/client';
import { Badge } from '@repo/ui/components/badge';
import { useOverlay } from '@repo/ui/hooks';
import { formatDate } from '@/shared/utils';
import OrganizationMemberEditForm from './organization-member-edit-form';
import OrganizationMemberColumnActions from './organization-member-column-actions';
import OrganizationMemberRoleSelect from './organization-member-role-select';
import OrganizationMemberSiteSelect from './organization-member-site-select';

interface OrganizationMemberColumnsOptions {
  organizationId?: string;
  usersMap: Map<string, User>;
  roles: Role[];
  sites?: Site[];
}

function MemberNameCell({
  member,
  user,
  organizationId,
}: {
  member: OrganizationMember;
  user?: User;
  organizationId: string;
}) {
  const ui = useOverlay();
  const displayName = user?.name || `สมาชิก #${member.id.slice(0, 6)}`;
  const subText = user?.email || 'ไม่ระบุข้อมูลบัญชี';

  const handleClick = () => {
    ui.sheet.open({
      title: 'แก้ไขสมาชิกและบทบาท',
      description: 'ปรับเปลี่ยนบทบาทและสถานะการทำงานของสมาชิกในองค์กร',
      size: 'lg',
      children: (
        <OrganizationMemberEditForm
          organizationId={organizationId}
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

export const organizationMemberListColumns = ({
  organizationId,
  usersMap,
  roles,
  sites,
}: OrganizationMemberColumnsOptions): ColumnDef<OrganizationMember>[] => {
  const orgId = organizationId || '';
  const siteList = sites || [];

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
            organizationId={orgId}
          />
        );
      },
    },
    {
      id: 'siteSelect',
      header: 'ไซต์สังกัด (Site)',
      cell: ({ row }) => {
        return (
          <OrganizationMemberSiteSelect
            member={row.original}
            organizationId={orgId}
            sites={siteList}
          />
        );
      },
    },
    {
      id: 'roleSelect',
      header: 'มอบหมายบทบาท (Role)',
      cell: ({ row }) => {
        return (
          <OrganizationMemberRoleSelect
            member={row.original}
            organizationId={orgId}
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
          <OrganizationMemberColumnActions
            cell={cell}
            organizationId={orgId}
            roles={roles}
            userName={userName}
          />
        );
      },
    },
  ];
};
export default organizationMemberListColumns;
