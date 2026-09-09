import {
  Building2Icon,
  CalendarCheckIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  ClockIcon,
  FileCheck2Icon,
  FileTextIcon,
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
  sidebarGroupBuilder('time-attendance', 'ระบบเวลาและการลา', [
    {
      id: 'companyAttendanceSchedule',
      icon: <ClockIcon />,
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      id: 'companyAttendanceLog',
      icon: <CalendarCheckIcon />,
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      id: 'companyLeaveRequest',
      icon: <FileTextIcon />,
      featureCode: 'LEAVE_MANAGEMENT',
    },
    {
      id: 'companyLeaveType',
      icon: <CalendarDaysIcon />,
      featureCode: 'LEAVE_MANAGEMENT',
    },
  ]),
  sidebarGroupBuilder('forms', 'ระบบแบบฟอร์ม', [
    {
      id: 'companyFormTemplates',
      icon: <ClipboardListIcon />,
      featureCode: 'FORM_MANAGEMENT',
    },
    {
      id: 'companyFormSubmissions',
      icon: <FileCheck2Icon />,
      featureCode: 'FORM_MANAGEMENT',
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
