import { BuildingIcon, KeyIcon, ShieldIcon, UsersIcon } from 'lucide-react';

import { sidebarItemBuilder, type NavItem } from '@/shared/utils';

const adminSidebarConfig: NavItem[] = [
  sidebarItemBuilder('user', <UsersIcon />),
  sidebarItemBuilder('company', <BuildingIcon />),
  sidebarItemBuilder('role', <ShieldIcon />),
  sidebarItemBuilder('permission', <KeyIcon />),
];

export { adminSidebarConfig };
