import React from 'react';
import {
  BuildingIcon,
  CalendarCheckIcon,
  CalendarDaysIcon,
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
      requiredPermissions: 'user:read',
    },
    {
      id: 'company',
      icon: <BuildingIcon />,
      requiredPermissions: 'company:read',
    },
  ]),
  sidebarGroupBuilder('time-attendance', 'ระบบเวลาและการลา', [
    {
      id: 'adminAttendance',
      icon: <CalendarCheckIcon />,
      requiredPermissions: 'attendance:read',
    },
    {
      id: 'adminLeave',
      icon: <CalendarDaysIcon />,
      requiredPermissions: 'leave_type:read',
    },
  ]),
  sidebarGroupBuilder('security', 'ระบบความปลอดภัย & RBAC', [
    {
      id: 'role',
      icon: <ShieldIcon />,
      requiredPermissions: 'role:read',
    },
    {
      id: 'permission',
      icon: <KeyIcon />,
      requiredPermissions: 'permission:read',
    },
  ]),
];
