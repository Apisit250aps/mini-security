import React from 'react';
import {
  BuildingIcon,
  KeyIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';

import { sidebarGroupBuilder, type NavItem } from '@/shared/utils';

export const adminSidebarConfig: NavItem[] = [
  sidebarGroupBuilder('overview', 'ภาพรวมระบบ', [
    {
      id: 'adminDashboard',
      icon: <LayoutDashboardIcon />,
    },
  ]),
  sidebarGroupBuilder('management', 'การจัดการข้อมูล', [
    {
      id: 'user',
      icon: <UsersIcon />,
    },
    {
      id: 'company',
      icon: <BuildingIcon />,
    },
  ]),
  sidebarGroupBuilder('security', 'ระบบความปลอดภัย & RBAC', [
    {
      id: 'role',
      icon: <ShieldIcon />,
    },
    {
      id: 'permission',
      icon: <KeyIcon />,
    },
  ]),
];
