'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import { useCompanyListQueries } from '@/modules/company/hooks/company-queries';
import type { Company } from '@repo/domains/entities';

const STORAGE_KEY = 'mini_active_company_id';
const CHANGE_EVENT = 'mini:company-change';

export function useActiveCompany() {
  const { data: sessionData } = useSession();
  const { isSuperAdmin } = usePermission();
  const companiesQuery = useCompanyListQueries();

  const [storedCompanyId, setStoredCompanyId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });

  useEffect(() => {
    const handleStorage = () => {
      setStoredCompanyId(localStorage.getItem(STORAGE_KEY));
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(CHANGE_EVENT, handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CHANGE_EVENT, handleStorage);
    };
  }, []);

  const setActiveCompanyId = useCallback((id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStoredCompanyId(id);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const companies = useMemo(
    () => companiesQuery.data || [],
    [companiesQuery.data],
  );

  const sessionCompanyId = (
    sessionData?.session as { activeCompanyId?: string | null }
  )?.activeCompanyId;

  const activeCompany = useMemo<Company | null>(() => {
    if (companies.length === 0) return null;
    if (storedCompanyId) {
      const found = companies.find((c) => c.id === storedCompanyId);
      if (found) return found;
    }
    if (sessionCompanyId) {
      const found = companies.find((c) => c.id === sessionCompanyId);
      if (found) return found;
    }
    return companies[0] || null;
  }, [companies, storedCompanyId, sessionCompanyId]);

  const activeCompanyId = activeCompany?.id || '';

  return {
    activeCompany,
    activeCompanyId,
    companies,
    isLoading: companiesQuery.isLoading,
    isSuperAdmin,
    setActiveCompanyId,
  };
}
