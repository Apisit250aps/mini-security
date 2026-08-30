import { BuildingIcon, UsersIcon } from 'lucide-react';

import { sidebarItemBuilder, type NavItem } from '@/shared/utils';

const adminSidebarConfig: NavItem[] = [
  sidebarItemBuilder('user', <UsersIcon />),
  sidebarItemBuilder('company', <BuildingIcon />),
];

export { adminSidebarConfig };
