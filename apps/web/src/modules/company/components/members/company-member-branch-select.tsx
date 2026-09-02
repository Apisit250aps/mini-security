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
    <Select
      selectedKey={member.companyBranchId}
      placeholder="เลือกสาขา..."
      onSelectionChange={handleBranchChange}
      isDisabled={updateMutation.isPending}
      className="w-44"
    >
      <SelectTrigger size="sm" className="h-8 text-xs font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {activeBranches.map((branch) => (
          <SelectItem key={branch.id} id={branch.id} textValue={branch.name}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
