'use client';

import { useMemo } from 'react';
import { useActiveCompany } from './use-active-company';
import { useCompanyAvailableFeaturesQueries } from '@/modules/feature/hooks/feature-queries';
import { companySidebarConfig } from '@/configs/contains/sidebar-configs/company-sidebar';
import type { NavItem, NavItemGroup } from '@/shared/utils';

export function useCompanySidebarNav() {
  const {
    activeCompany,
    activeCompanyId,
    isSuperAdmin,
    isLoading: isCompanyLoading,
  } = useActiveCompany();

  const availableFeaturesQuery =
    useCompanyAvailableFeaturesQueries(activeCompanyId);

  const availableFeatureCodes = useMemo(() => {
    if (!availableFeaturesQuery.data) return new Set<string>();
    return new Set(availableFeaturesQuery.data.map((f) => f.code));
  }, [availableFeaturesQuery.data]);

  const filteredSidebarItems = useMemo<NavItem[]>(() => {
    // Super Admin has unrestricted access to all company modules
    if (isSuperAdmin) {
      return companySidebarConfig;
    }

    // While loading company data, keep base overview items
    if (!activeCompanyId || availableFeaturesQuery.isLoading) {
      return companySidebarConfig;
    }

    const result: NavItem[] = [];

    for (const item of companySidebarConfig) {
      if ('items' in item) {
        const group = item as NavItemGroup;

        // If the group itself requires a feature that is not available, skip it
        if (group.featureCode && !availableFeatureCodes.has(group.featureCode)) {
          continue;
        }

        // Filter sub-items by their individual featureCode
        const allowedSubItems = group.items.filter((subItem) => {
          if (!subItem.featureCode) return true;
          return availableFeatureCodes.has(subItem.featureCode);
        });

        // Only render the group if it has at least one allowed sub-item
        if (allowedSubItems.length > 0) {
          result.push({
            ...group,
            items: allowedSubItems,
          });
        }
      } else {
        // Single Nav Item
        if (!item.featureCode || availableFeatureCodes.has(item.featureCode)) {
          result.push(item);
        }
      }
    }

    return result;
  }, [
    isSuperAdmin,
    activeCompanyId,
    availableFeaturesQuery.isLoading,
    availableFeatureCodes,
  ]);

  return {
    sidebarItems: filteredSidebarItems,
    activeCompany,
    activeCompanyId,
    isLoading: isCompanyLoading || availableFeaturesQuery.isLoading,
  };
}
