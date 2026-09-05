import type { PageConfigId } from '@/configs/contains/page-configs';
import { pageConfigs as PAGE_CONFIGS } from '@/configs/contains/page-configs';
import React from 'react';

export type NavItemSingle = {
  id: string;
  name: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  featureCode?: string;
};

export type NavSubItem = {
  id: PageConfigId | string;
  name: string;
  title: string;
  description?: string;
  url: string;
  icon?: React.ReactNode;
  featureCode?: string;
};

export type NavItemGroup = {
  id: string;
  name: string;
  title?: string;
  url?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  featureCode?: string;
  items: NavSubItem[];
};

export type NavItem = NavItemSingle | NavItemGroup;

export const sidebarGroupBuilder = (
  groupId: string,
  groupTitle: string,
  items: Array<
    | PageConfigId
    | { id: PageConfigId; icon?: React.ReactNode; featureCode?: string }
  >,
  icon?: React.ReactNode,
  isActive: boolean = false,
  featureCode?: string,
): NavItemGroup => {
  return {
    id: groupId,
    name: groupTitle,
    title: groupTitle,
    url: '#',
    icon,
    isActive,
    featureCode,
    items: items.map((item) => {
      const itemId = typeof item === 'string' ? item : item.id;
      const itemIcon = typeof item === 'object' ? item.icon : undefined;
      const itemFeatureCode =
        typeof item === 'object' ? item.featureCode : undefined;
      const page = PAGE_CONFIGS[itemId];

      if (!page) {
        throw new Error(`Page configuration not found: ${itemId}`);
      }

      return {
        id: itemId,
        ...page,
        icon: itemIcon,
        featureCode: itemFeatureCode,
      };
    }),
  };
};

export const sidebarItemBuilder = (
  pageId: PageConfigId,
  icon?: React.ReactNode,
  isActive: boolean = false,
  featureCode?: string,
): NavItemSingle => {
  const page = PAGE_CONFIGS[pageId];

  if (!page) {
    throw new Error(`Page configuration not found: ${pageId}`);
  }

  return {
    id: pageId,
    name: page.name,
    url: page.url,
    icon,
    isActive,
    featureCode,
  };
};
