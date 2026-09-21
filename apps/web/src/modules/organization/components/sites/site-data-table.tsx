'use client';

import React, { useMemo } from 'react';
import siteListColumns from './site-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useSitesQueries } from '../../hooks/organization-queries';

export default function SiteDataTable({
  organizationId,
}: {
  organizationId?: string;
}) {
  const orgId = organizationId || '';
  const sitesQuery = useSitesQueries(orgId);

  const columns = useMemo(() => {
    return siteListColumns({
      organizationId: orgId,
    });
  }, [orgId]);

  const table = useMemo(() => {
    const data = sitesQuery.isLoading ? [] : sitesQuery.data || [];
    return { data, columns, isLoading: sitesQuery.isLoading };
  }, [columns, sitesQuery.data, sitesQuery.isLoading]);

  return <DataTable {...table} />;
}
