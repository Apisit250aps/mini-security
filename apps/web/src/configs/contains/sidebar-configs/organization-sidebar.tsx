import {
  Building2Icon,
  MapPinIcon,
  CalendarCheckIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  ClockIcon,
  FileCheck2Icon,
  FileSearchIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';
import { sidebarGroupBuilder, type NavItem } from '@/shared/utils';

export const organizationSidebarConfig: NavItem[] = [
  sidebarGroupBuilder('overview', 'ภาพรวมองค์กร', [
    {
      id: 'organizationDashboard',
      icon: <LayoutDashboardIcon />,
    },
  ]),
  sidebarGroupBuilder('employee-management', 'จัดการพนักงาน', [
    {
      id: 'organizationEmployee',
      icon: <UsersIcon />,
      featureCode: 'EMPLOYEE_MANAGEMENT',
      requiredPermissions: 'organization_member:read',
    },
    {
      id: 'organizationRole',
      icon: <ShieldCheckIcon />,
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
      requiredPermissions: 'role:read',
    },
  ]),
  sidebarGroupBuilder('time-attendance', 'ระบบเวลาและการลา', [
    {
      id: 'organizationAttendanceSchedule',
      icon: <ClockIcon />,
      featureCode: 'ATTENDANCE_MANAGEMENT',
      requiredPermissions: 'attendance_schedule:read',
    },
    {
      id: 'organizationAttendanceLog',
      icon: <CalendarCheckIcon />,
      featureCode: 'ATTENDANCE_MANAGEMENT',
      requiredPermissions: 'attendance:read',
    },
    {
      id: 'organizationLeaveRequest',
      icon: <FileTextIcon />,
      featureCode: 'LEAVE_MANAGEMENT',
      requiredPermissions: 'leave_request:read',
    },
    {
      id: 'organizationLeaveType',
      icon: <CalendarDaysIcon />,
      featureCode: 'LEAVE_MANAGEMENT',
      requiredPermissions: 'leave_type:read',
    },
  ]),
  sidebarGroupBuilder('forms', 'ระบบแบบฟอร์ม', [
    {
      id: 'organizationFormPlans',
      icon: <CalendarClockIcon />,
      featureCode: 'FORM_MANAGEMENT',
      requiredPermissions: 'form_plan:read',
    },
    {
      id: 'organizationFormTasks',
      icon: <ClipboardCheckIcon />,
      featureCode: 'FORM_MANAGEMENT',
      requiredPermissions: 'form_submission:read',
    },
    {
      id: 'organizationFormTemplates',
      icon: <ClipboardListIcon />,
      featureCode: 'FORM_MANAGEMENT',
      requiredPermissions: 'form_template:read',
    },
    {
      id: 'organizationFormReviewQueue',
      icon: <FileSearchIcon />,
      featureCode: 'FORM_MANAGEMENT',
      requiredPermissions: 'form_review:read',
    },
    {
      id: 'organizationFormSubmissions',
      icon: <FileCheck2Icon />,
      featureCode: 'FORM_MANAGEMENT',
      requiredPermissions: 'form_submission:read',
    },
  ]),
  sidebarGroupBuilder('settings', 'ข้อมูลองค์กร', [
    {
      id: 'organizationLocations',
      icon: <MapPinIcon />,
      featureCode: 'ATTENDANCE_MANAGEMENT',
      requiredPermissions: 'location:read',
    },
    {
      id: 'organizationSettings',
      icon: <Building2Icon />,
      featureCode: 'ORGANIZATION_MANAGEMENT',
      requiredPermissions: 'organization:read',
    },
  ]),
];
