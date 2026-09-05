'use client';

import { useMemo } from 'react';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import { useCompanyListQueries } from '@/modules/company/hooks/company-queries';
import type { Company } from '@repo/domains/entities';

export function useActiveCompany() {
  const { data: sessionData } = useSession();
  const { isSuperAdmin } = usePermission();
  const companiesQuery = useCompanyListQueries();

  const companies = useMemo(
    () => companiesQuery.data || [],
    [companiesQuery.data],
  );

  const sessionCompanyId = (
    sessionData?.session as { activeCompanyId?: string | null }
  )?.activeCompanyId;

  const activeCompany = useMemo<Company | null>(() => {
    if (companies.length === 0) return null;
    if (sessionCompanyId) {
      const found = companies.find((c) => c.id === sessionCompanyId);
      if (found) return found;
    }
    return companies[0] || null;
  }, [companies, sessionCompanyId]);

  const activeCompanyId = activeCompany?.id || '';

  return {
    activeCompany,
    activeCompanyId,
    companies,
    isLoading: companiesQuery.isLoading,
    isSuperAdmin,
  };
}
