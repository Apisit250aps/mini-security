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
      featureCode: 'EMPLOYEE_MANAGEMENT',
    },
    {
      id: 'companyRole',
      icon: <ShieldCheckIcon />,
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
  ]),
  sidebarGroupBuilder('settings', 'ตั้งค่าองค์กร', [
    {
      id: 'companySettings',
      icon: <Building2Icon />,
      featureCode: 'COMPANY_MANAGEMENT',
    },
  ]),
];
