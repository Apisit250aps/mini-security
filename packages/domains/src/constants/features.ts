// ============================================================
// MASTER FEATURE CATALOG DEFINITIONS
// ============================================================

export interface FeatureDefinition {
  /** Unique feature code used as the identifier in the database */
  readonly code: string;
  /** Human-readable display name */
  readonly name: string;
  /** Short description of what the feature provides */
  readonly description: string;
  /** Grouping category for UI organization */
  readonly category: 'HR' | 'ORGANIZATION' | 'SECURITY';
  /** Whether the feature is active by default on platform creation */
  readonly isActive: boolean;
}

/**
 * Canonical list of all master features available in the platform.
 * This is the single source of truth for seeding the `feature` table.
 */
export const MASTER_FEATURES: readonly FeatureDefinition[] = [
  {
    code: 'ATTENDANCE_MANAGEMENT',
    name: 'Attendance Management',
    description: 'ระบบลงเวลาเข้างาน บันทึกกะ และตารางงาน',
    category: 'HR',
    isActive: true,
  },
  {
    code: 'LEAVE_MANAGEMENT',
    name: 'Leave Management',
    description: 'ระบบยื่นและอนุมัติคำขอลาพักร้อน ลาป่วย ลากิจ',
    category: 'HR',
    isActive: true,
  },
  {
    code: 'COMPANY_MANAGEMENT',
    name: 'Company Management',
    description: 'ระบบจัดการข้อมูลบริษัทและสาขา',
    category: 'ORGANIZATION',
    isActive: true,
  },
  {
    code: 'ROLE_PERMISSION_MANAGEMENT',
    name: 'Access Control & Roles',
    description: 'ระบบจัดการบทบาทและสิทธิ์การเข้าถึง (RBAC)',
    category: 'SECURITY',
    isActive: true,
  },
  {
    code: 'EMPLOYEE_MANAGEMENT',
    name: 'Employee Directory',
    description: 'ระบบจัดการข้อมูลสมาชิกและพนักงานในองค์กร',
    category: 'HR',
    isActive: true,
  },
] as const;

/** Union of all valid feature codes */
export type FeatureCode = (typeof MASTER_FEATURES)[number]['code'];
