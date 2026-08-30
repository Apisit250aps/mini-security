import {
  BuildingIcon,
  KeyIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';

import { sidebarItemBuilder, type NavItem } from '@/shared/utils';

const adminSidebarConfig: NavItem[] = [
  sidebarItemBuilder('adminDashboard', <LayoutDashboardIcon />),
  sidebarItemBuilder('user', <UsersIcon />),
  sidebarItemBuilder('company', <BuildingIcon />),
  sidebarItemBuilder('role', <ShieldIcon />),
  sidebarItemBuilder('permission', <KeyIcon />),
];

export { adminSidebarConfig };
