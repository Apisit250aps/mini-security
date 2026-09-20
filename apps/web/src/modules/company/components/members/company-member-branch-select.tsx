'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { SelectField } from '@repo/ui/form';
import { useCompanyMemberUpdate } from '../../hooks/company-mutations';
import type { CompanyBranch, CompanyMember } from '@repo/client';

type BranchFormValues = {
  companyBranchId: string;
};

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

  const activeBranches = useMemo(() => {
    return branches.filter(
      (b) => b.isActive || b.id === member.companyBranchId,
    );
  }, [branches, member.companyBranchId]);

  const methods = useForm<BranchFormValues>({
    mode: 'onChange',
    defaultValues: {
      companyBranchId: member.companyBranchId || '',
    },
    values: {
      companyBranchId: member.companyBranchId || '',
    },
  });

  const onSubmit = React.useCallback(
    async (data: BranchFormValues) => {
      if (
        !data.companyBranchId ||
        data.companyBranchId === member.companyBranchId ||
        updateMutation.isPending
      ) {
        return;
      }
      try {
        await updateMutation.mutateAsync({
          id: member.id,
          data: {
            companyBranchId: data.companyBranchId,
          },
        });
      } catch {
        methods.reset({ companyBranchId: member.companyBranchId || '' });
      }
    },
    [member.id, member.companyBranchId, updateMutation, methods],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void methods.handleSubmit(onSubmit)(e);
      }}
      onChange={() => {
        void methods.handleSubmit(onSubmit)();
      }}
      className="w-44"
    >
      <SelectField
        control={methods.control}
        name="companyBranchId"
        label="สาขา"
        placeholder="เลือกสาขา..."
        disabled={updateMutation.isPending}
        options={activeBranches.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        onValueChange={() => {
          void methods.handleSubmit(onSubmit)();
        }}
      />
    </form>
  );
}

