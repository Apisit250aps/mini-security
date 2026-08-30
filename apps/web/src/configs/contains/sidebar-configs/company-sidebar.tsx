import React from 'react';
import {
  Building2Icon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';
import { sidebarGroupBuilder, type NavItem } from '@/shared/utils';

export const companySidebarConfig: NavItem[] = [
  sidebarGroupBuilder('overview', 'ภาพรวมองค์กร', [
    {
      id: 'companyDashboard',
      icon: <LayoutDashboardIcon />,
    },
  ]),
  sidebarGroupBuilder('employee-management', 'จัดการพนักงาน', [
    {
      id: 'companyEmployee',
      icon: <UsersIcon />,
    },
    {
      id: 'companyRole',
      icon: <ShieldCheckIcon />,
    },
  ]),
  sidebarGroupBuilder('settings', 'ตั้งค่าองค์กร', [
    {
      id: 'companySettings',
      icon: <Building2Icon />,
    },
  ]),
];
