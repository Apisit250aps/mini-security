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
      featureCode: 'EMPLOYEE_MANAGEMENT',
    },
    {
      id: 'companyRole',
      icon: <ShieldCheckIcon />,
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
  ]),
  sidebarGroupBuilder('attendance-management', 'ระบบลงเวลาและกะงาน', [
    {
      id: 'companyAttendance',
      icon: <CalendarCheckIcon />,
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      id: 'companyAttendanceSchedules',
      icon: <CalendarRangeIcon />,
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      id: 'companyAttendancePolicies',
      icon: <MapPinIcon />,
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      id: 'companyAttendanceLeave',
      icon: <CalendarDaysIcon />,
      featureCode: 'LEAVE_MANAGEMENT',
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

