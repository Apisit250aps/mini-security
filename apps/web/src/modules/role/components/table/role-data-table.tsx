'use client';

import React, { useMemo } from 'react';
import roleListColumns from './role-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import {
  useRoleListQueries,
  useGetOrganizationRoles,
} from '../../hooks/role-queries';

export default function RoleDataTable({
  organizationId,
}: {
  organizationId?: string;
}) {
  const orgId = organizationId;
  const globalQuery = useRoleListQueries();
  const orgQuery = useGetOrganizationRoles(orgId || '');

  const query = orgId ? orgQuery : globalQuery;
  const columns = useMemo(() => roleListColumns(orgId), [orgId]);

  const table = useMemo(() => {
    const data = query.isLoading ? [] : query.data || [];
    return { data, columns, isLoading: query.isLoading };
  }, [columns, query.data, query.isLoading]);

  return <DataTable {...table} />;
}
