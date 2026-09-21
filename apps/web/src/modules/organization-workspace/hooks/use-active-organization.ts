'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import { useOrganizationListQueries } from '@/modules/organization/hooks/organization-queries';
import type { Organization } from '@repo/client';

const STORAGE_KEY = 'mini_active_organization_id';
const CHANGE_EVENT = 'mini:organization-change';

export function useActiveOrganization() {
  const { data: sessionData } = useSession();
  const { isSuperAdmin } = usePermission();
  const organizationsQuery = useOrganizationListQueries();

  const [storedOrganizationId, setStoredOrganizationId] = useState<
    string | null
  >(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });

  useEffect(() => {
    const handleStorage = () => {
      setStoredOrganizationId(localStorage.getItem(STORAGE_KEY));
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(CHANGE_EVENT, handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CHANGE_EVENT, handleStorage);
    };
  }, []);

  const setActiveOrganizationId = useCallback((id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStoredOrganizationId(id);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const organizations = useMemo(
    () => organizationsQuery.data || [],
    [organizationsQuery.data],
  );

  const sessionOrgId = (
    sessionData?.session as {
      activeOrganizationId?: string | null;
    }
  )?.activeOrganizationId;

  const activeOrganization = useMemo<Organization | null>(() => {
    if (organizations.length === 0) return null;
    if (storedOrganizationId) {
      const found = organizations.find((c) => c.id === storedOrganizationId);
      if (found) return found;
    }
    if (sessionOrgId) {
      const found = organizations.find((c) => c.id === sessionOrgId);
      if (found) return found;
    }
    return organizations[0] || null;
  }, [organizations, storedOrganizationId, sessionOrgId]);

  const activeOrganizationId = activeOrganization?.id || '';

  return {
    activeOrganization,
    activeOrganizationId,
    organizations,
    isLoading: organizationsQuery.isLoading,
    isSuperAdmin,
    setActiveOrganizationId,
  };
}
