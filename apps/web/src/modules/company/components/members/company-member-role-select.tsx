'use client';

import React, { useMemo } from 'react';
import { OptionsSelect } from '@/shared/components/form/options-select';
import { Badge } from '@repo/ui/components/badge';
import { useCompanyMemberUpdate } from '../../hooks/company-mutations';
import type { CompanyMember, Role } from '@repo/client';
import { useSession } from '@/modules/auth/hooks/session-provider';

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
  const session = useSession();
  const currentRole = useMemo(
    () => roles.find((r) => r.id === member.roleId),
    [roles, member.roleId],
  );

  const isOwner = useMemo(
    () => currentRole?.name.toLowerCase() === 'owner',
    [currentRole],
  );

  // Filter out Super Admin - allow company-scoped and valid system default roles
  const companyRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        r.roleType !== 'SUPER_ADMIN' &&
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
  if (isOwner && !session.isSuperAdmin) {
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
    <OptionsSelect
      value={member.roleId}
      label="บทบาท"
      onChange={handleRoleChange}
      disabled={updateMutation.isPending}
      className="w-44"
      options={companyRoles.map((item) => ({
        value: item.id,
        label: item.name,
      }))}
    />
  );
}
