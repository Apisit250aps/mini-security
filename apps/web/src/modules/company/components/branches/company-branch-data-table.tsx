'use client';

import React, { useMemo } from 'react';
import companyBranchListColumns from './company-branch-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useCompanyBranchesQueries } from '../../hooks/company-queries';

export default function CompanyBranchDataTable({
  companyId,
}: {
  companyId: string;
}) {
  const branchesQuery = useCompanyBranchesQueries(companyId);

  const columns = useMemo(() => {
    return companyBranchListColumns({
      companyId,
    });
  }, [companyId]);

  const table = useMemo(() => {
    const data = branchesQuery.isLoading ? [] : branchesQuery.data || [];
    return { data, columns, isLoading: branchesQuery.isLoading };
  }, [columns, branchesQuery.data, branchesQuery.isLoading]);

  return <DataTable {...table} />;
}
