'use client';

import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@repo/ui/components/select';
import { useCompanyMemberUpdate } from '../../hooks/company-mutations';
import type { CompanyMember, Role } from '@repo/domains/entities';

export default function CompanyMemberRoleSelect({
  member,
  companyId,
  roles,
}: {
  member: CompanyMember;
  companyId: string;
  roles: Role[];
}) {
  const updateMutation = useCompanyMemberUpdate(companyId);

  const handleRoleChange = async (key: React.Key | null) => {
    if (!key || key === member.roleId) return;
    await updateMutation.mutateAsync({
      id: member.id,
      data: {
        roleId: key as string,
      },
    });
  };

  return (
    <Select
      selectedKey={member.roleId}
      placeholder="เลือกบทบาท..."
      onSelectionChange={handleRoleChange}
      isDisabled={updateMutation.isPending}
      className="w-40"
    >
      <SelectTrigger size="sm" className="h-8 text-xs font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.id} id={role.id} textValue={role.name}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
