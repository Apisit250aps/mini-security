'use client';

import React, { useMemo } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@repo/ui/components/select';
import { Badge } from '@repo/ui/components/badge';
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

  const currentRole = useMemo(
    () => roles.find((r) => r.id === member.roleId),
    [roles, member.roleId],
  );

  const isOwner = useMemo(
    () => currentRole?.name.toLowerCase() === 'owner',
    [currentRole],
  );

  // Filter out system default roles (Super Admin) - only allow company-scoped roles
  const companyRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        !r.isSystemDefault &&
        (!r.companyId || r.companyId === companyId) &&
        !r.name.toLowerCase().includes('super admin'),
    );
  }, [roles, companyId]);

  const handleRoleChange = async (key: React.Key | null) => {
    if (!key || key === member.roleId || isOwner) return;
    await updateMutation.mutateAsync({
      id: member.id,
      data: {
        roleId: key as string,
      },
    });
  };

  // If member is Owner, do not allow changing roles
  if (isOwner) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs font-semibold py-1 px-2.5"
      >
        Owner (เจ้าของ)
      </Badge>
    );
  }

  return (
    <Select
      selectedKey={member.roleId}
      placeholder="เลือกบทบาท..."
      onSelectionChange={handleRoleChange}
      isDisabled={updateMutation.isPending}
      className="w-44"
    >
      <SelectTrigger size="sm" className="h-8 text-xs font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {companyRoles.map((role) => (
          <SelectItem key={role.id} id={role.id} textValue={role.name}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
