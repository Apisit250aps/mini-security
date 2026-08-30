'use client';

import React, { useMemo } from 'react';
import roleListColumns from './role-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import {
  useRoleListQueries,
  useCompanyRolesQueries,
} from '../../hooks/role-queries';

export default function RoleDataTable({ companyId }: { companyId?: string }) {
  const globalQuery = useRoleListQueries();
  const companyQuery = useCompanyRolesQueries(companyId || '');

  const query = companyId ? companyQuery : globalQuery;
  const columns = roleListColumns();

  const table = useMemo(() => {
    const data = query.isLoading ? [] : query.data || [];
    return { data, columns, isLoading: query.isLoading };
  }, [columns, query.data, query.isLoading]);

  return <DataTable {...table} />;
}
