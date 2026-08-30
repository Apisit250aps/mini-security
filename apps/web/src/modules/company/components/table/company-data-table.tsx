'use client';

import React, { useMemo } from 'react';
import companyListColumns from './company-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useCompanyListQueries } from '../../hooks/company-queries';

export default function CompanyDataTable() {
  const query = useCompanyListQueries();
  const columns = companyListColumns();
  const table = useMemo(() => {
    const data = query.isLoading ? [] : query.data || [];
    return { data, columns, isLoading: query.isLoading };
  }, [columns, query.data, query.isLoading]);

  return <DataTable {...table} />;
}
