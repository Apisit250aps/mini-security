import React from 'react';
import {
  Building2Icon,
  CalendarCheckIcon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  LayoutDashboardIcon,
  MapPinIcon,
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
  sidebarGroupBuilder('attendance-management', 'ระบบลงเวลาและกะงาน', [
    {
      id: 'companyAttendance',
      icon: <CalendarCheckIcon />,
    },
    {
      id: 'companyAttendanceSchedules',
      icon: <CalendarRangeIcon />,
    },
    {
      id: 'companyAttendancePolicies',
      icon: <MapPinIcon />,
    },
    {
      id: 'companyAttendanceLeave',
      icon: <CalendarDaysIcon />,
    },
  ]),
  sidebarGroupBuilder('settings', 'ตั้งค่าองค์กร', [
    {
      id: 'companySettings',
      icon: <Building2Icon />,
    },
  ]),
];
