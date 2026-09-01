import type { PageConfigId } from '@/configs/contains/page-configs';
import { pageConfigs as PAGE_CONFIGS } from '@/configs/contains/page-configs';
import React from 'react';

export type NavItemSingle = {
  id: string;
  name: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
};

export type NavSubItem = {
  id: PageConfigId | string;
  name: string;
  title: string;
  description?: string;
  url: string;
  icon?: React.ReactNode;
};

export type NavItemGroup = {
  id: string;
  name: string;
  title?: string;
  url?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items: NavSubItem[];
};

export type NavItem = NavItemSingle | NavItemGroup;

export const sidebarGroupBuilder = (
  groupId: string,
  groupTitle: string,
  items: Array<PageConfigId | { id: PageConfigId; icon?: React.ReactNode }>,
  icon?: React.ReactNode,
  isActive: boolean = false,
): NavItemGroup => {
  return {
    id: groupId,
    name: groupTitle,
    title: groupTitle,
    url: '#',
    icon,
    isActive,
    items: items.map((item) => {
      const itemId = typeof item === 'string' ? item : item.id;
      const itemIcon = typeof item === 'object' ? item.icon : undefined;
      const page = PAGE_CONFIGS[itemId];

      if (!page) {
        throw new Error(`Page configuration not found: ${itemId}`);
      }

      return {
        id: itemId,
        ...page,
        icon: itemIcon,
      };
    }),
  };
};

export const sidebarItemBuilder = (
  pageId: PageConfigId,
  icon?: React.ReactNode,
  isActive: boolean = false,
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
  };
};
