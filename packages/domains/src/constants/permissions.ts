export type PermissionAction = string;

/**
 * Base security context passed along application use cases
 */
export interface ISecurityContext {
  userId?: string;
  companyId?: string;
  /** Trusted session snapshot; never populate from request input. */
  permissions?: string | null;
  activeCompanyId?: string | null;
  user?: {
    id: string;
    isAdmin?: boolean;
    isActive?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Helper to wrap any context with security authorization attributes
 */
export type WithSecurityContext<T> = T & ISecurityContext;

/**
 * System-level modules that represent platform infrastructure and catalog data.
 * These are not configurable by company/tenant roles.
 */
export const SYSTEM_PERMISSION_MODULES = [
  'permission',
  'feature',
  // 'company_feature',
  // 'role_feature',
] as const;

export type SystemPermissionModule = (typeof SYSTEM_PERMISSION_MODULES)[number];

/**
 * Legacy or deprecated modules that were consolidated into newer unified modules.
 */
export const LEGACY_DEPRECATED_MODULES = [
  'work_schedule',
  'work_shift',
  'attendance_policy',
  'attendance_checkpoint',
  'attendance_location',
  'member_work_schedule',
  'attendance_record',
  'attendance_log',
  'role_work_schedule',
  'leave_request',
] as const;

export type LegacyDeprecatedModule = (typeof LEGACY_DEPRECATED_MODULES)[number];

/**
 * System-restricted actions that operate on global platform resources rather than
 * tenant-scoped resources.
 */
export const SYSTEM_RESTRICTED_ACTIONS = [
  'company:create',
  'company:delete',
  'user:create',
  'user:delete',
] as const;

export type SystemRestrictedAction = (typeof SYSTEM_RESTRICTED_ACTIONS)[number];

/**
 * Helper to check if a permission is tenant-configurable (can be managed by company roles)
 */
export function isTenantConfigurablePermission(permission: {
  module?: string | null;
  action?: string | null;
}): boolean {
  if (!permission.module || !permission.action) return false;

  if (
    (SYSTEM_PERMISSION_MODULES as readonly string[]).includes(permission.module)
  ) {
    return false;
  }

  if (
    (LEGACY_DEPRECATED_MODULES as readonly string[]).includes(permission.module)
  ) {
    return false;
  }

  if (
    (SYSTEM_RESTRICTED_ACTIONS as readonly string[]).includes(permission.action)
  ) {
    return false;
  }

  return true;
}
