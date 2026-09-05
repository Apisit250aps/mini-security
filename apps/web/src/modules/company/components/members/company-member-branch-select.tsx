'use client';

import React from 'react';
import { OptionsSelect } from '@/shared/components/form/options-select';
import { useCompanyMemberUpdate } from '../../hooks/company-mutations';
import type { CompanyBranch, CompanyMember } from '@repo/client';

export default function CompanyMemberBranchSelect({
  member,
  companyId,
  branches,
}: {
  member: CompanyMember;
  companyId: string;
  branches: CompanyBranch[];
}) {
  const updateMutation = useCompanyMemberUpdate(companyId);

  const activeBranches = React.useMemo(() => {
    return branches.filter(
      (b) => b.isActive || b.id === member.companyBranchId,
    );
  }, [branches, member.companyBranchId]);

  const handleBranchChange = async (key: React.Key | null) => {
    if (!key || key === member.companyBranchId) return;
    await updateMutation.mutateAsync({
      id: member.id,
      data: {
        companyBranchId: key as string,
      },
    });
  };

  return (
    <OptionsSelect
      value={member.companyBranchId}
      label="สาขา"
      onChange={handleBranchChange}
      disabled={updateMutation.isPending}
      className="w-44"
      options={activeBranches.map((item) => ({
        value: item.id,
        label: item.name,
      }))}
    />
  );
}
