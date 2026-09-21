'use client';

import React, { useMemo } from 'react';
import organizationListColumns from './organization-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useOrganizationListQueries } from '../../hooks/organization-queries';

export default function OrganizationDataTable() {
  const query = useOrganizationListQueries();
  const columns = organizationListColumns();
  const table = useMemo(() => {
    const data = query.isLoading ? [] : query.data || [];
    return { data, columns, isLoading: query.isLoading };
  }, [columns, query.data, query.isLoading]);

  return <DataTable {...table} />;
}
