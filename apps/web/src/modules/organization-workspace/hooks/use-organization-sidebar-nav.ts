'use client';

import { useMemo } from 'react';
import { useActiveOrganization } from './use-active-organization';
import { useOrganizationAvailableFeaturesQueries } from '@/modules/feature/hooks/feature-queries';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import { organizationSidebarConfig } from '@/configs/contains/sidebar-configs/organization-sidebar';
import type { NavItem, NavItemGroup } from '@/shared/utils';

export function useOrganizationSidebarNav() {
  const {
    activeOrganization,
    activeOrganizationId,
    isSuperAdmin,
    isLoading: isOrganizationLoading,
  } = useActiveOrganization();

  const { hasAnyPermission } = usePermission();

  const availableFeaturesQuery =
    useOrganizationAvailableFeaturesQueries(activeOrganizationId);

  const availableFeatureCodes = useMemo(() => {
    if (!availableFeaturesQuery.data) return new Set<string>();
    return new Set(availableFeaturesQuery.data.map((f) => f.code));
  }, [availableFeaturesQuery.data]);

  const filteredSidebarItems = useMemo<NavItem[]>(() => {
    // Super Admin has unrestricted access to all organization modules
    if (isSuperAdmin) {
      return organizationSidebarConfig;
    }

    // While loading organization data, keep base overview items
    if (!activeOrganizationId || availableFeaturesQuery.isLoading) {
      return organizationSidebarConfig;
    }

    const result: NavItem[] = [];

    for (const item of organizationSidebarConfig) {
      if ('items' in item) {
        const group = item as NavItemGroup;

        // If the group itself requires a feature that is not available, skip it
        if (
          group.featureCode &&
          !availableFeatureCodes.has(group.featureCode)
        ) {
          continue;
        }

        // If the group itself requires permissions that the user lacks, skip it
        if (
          group.requiredPermissions &&
          !hasAnyPermission(group.requiredPermissions)
        ) {
          continue;
        }

        // Filter sub-items by their individual featureCode and requiredPermissions
        const allowedSubItems = group.items.filter((subItem) => {
          if (
            subItem.featureCode &&
            !availableFeatureCodes.has(subItem.featureCode)
          ) {
            return false;
          }
          if (
            subItem.requiredPermissions &&
            !hasAnyPermission(subItem.requiredPermissions)
          ) {
            return false;
          }
          return true;
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
        const hasFeature =
          !item.featureCode || availableFeatureCodes.has(item.featureCode);
        const hasPerm =
          !item.requiredPermissions ||
          hasAnyPermission(item.requiredPermissions);

        if (hasFeature && hasPerm) {
          result.push(item);
        }
      }
    }

    return result;
  }, [
    isSuperAdmin,
    activeOrganizationId,
    availableFeaturesQuery.isLoading,
    availableFeatureCodes,
    hasAnyPermission,
  ]);

  return {
    sidebarItems: filteredSidebarItems,
    activeOrganization,
    activeOrganizationId,
    isLoading: isOrganizationLoading || availableFeaturesQuery.isLoading,
  };
}
