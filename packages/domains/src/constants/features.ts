/** Built-in feature catalog. Database migrations keep a versioned SQL snapshot. */
export const FEATURE_CODES = {
  ATTENDANCE_MANAGEMENT: 'ATTENDANCE_MANAGEMENT',
  LEAVE_MANAGEMENT: 'LEAVE_MANAGEMENT',
  COMPANY_MANAGEMENT: 'COMPANY_MANAGEMENT',
  ROLE_PERMISSION_MANAGEMENT: 'ROLE_PERMISSION_MANAGEMENT',
  EMPLOYEE_MANAGEMENT: 'EMPLOYEE_MANAGEMENT',
  FORM_MANAGEMENT: 'FORM_MANAGEMENT',
} as const;

export type FeatureCode = (typeof FEATURE_CODES)[keyof typeof FEATURE_CODES];

export const SYSTEM_FEATURES = [
  {
    code: FEATURE_CODES.ATTENDANCE_MANAGEMENT,
    name: 'Attendance Management',
    description: 'Attendance logs and check-in schedules',
    category: 'HR',
    isActive: true,
  },
  {
    code: FEATURE_CODES.LEAVE_MANAGEMENT,
    name: 'Leave Management',
    description: 'Leave types, quotas and requests',
    category: 'HR',
    isActive: true,
  },
  {
    code: FEATURE_CODES.COMPANY_MANAGEMENT,
    name: 'Company Management',
    description: 'Companies and branches',
    category: 'ORGANIZATION',
    isActive: true,
  },
  {
    code: FEATURE_CODES.ROLE_PERMISSION_MANAGEMENT,
    name: 'Access Control & Roles',
    description: 'Roles, permissions and feature access',
    category: 'SECURITY',
    isActive: true,
  },
  {
    code: FEATURE_CODES.EMPLOYEE_MANAGEMENT,
    name: 'Employee Directory',
    description: 'Users and company members',
    category: 'HR',
    isActive: true,
  },
  {
    code: FEATURE_CODES.FORM_MANAGEMENT,
    name: 'Form Management',
    description: 'Form templates, submissions and reviews',
    category: 'OPERATIONS',
    isActive: true,
  },
] as const;
