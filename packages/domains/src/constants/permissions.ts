export const PERMISSIONS = {
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
  },
  COMPANY: {
    CREATE: 'company:create',
    READ: 'company:read',
    UPDATE: 'company:update',
    DELETE: 'company:delete',
  },
  COMPANY_MEMBER: {
    CREATE: 'company_member:create',
    READ: 'company_member:read',
    UPDATE: 'company_member:update',
    DELETE: 'company_member:delete',
  },
  ROLE: {
    CREATE: 'role:create',
    READ: 'role:read',
    UPDATE: 'role:update',
    DELETE: 'role:delete',
  },
  PERMISSION: {
    CREATE: 'permission:create',
    READ: 'permission:read',
    UPDATE: 'permission:update',
    DELETE: 'permission:delete',
    ASSIGN: 'permission:assign',
    REVOKE: 'permission:revoke',
  },
} as const;

export type PermissionAction =
  | (typeof PERMISSIONS.USER)[keyof typeof PERMISSIONS.USER]
  | (typeof PERMISSIONS.COMPANY)[keyof typeof PERMISSIONS.COMPANY]
  | (typeof PERMISSIONS.COMPANY_MEMBER)[keyof typeof PERMISSIONS.COMPANY_MEMBER]
  | (typeof PERMISSIONS.ROLE)[keyof typeof PERMISSIONS.ROLE]
  | (typeof PERMISSIONS.PERMISSION)[keyof typeof PERMISSIONS.PERMISSION]
  | (string & {});

export const SYSTEM_DEFAULT_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
} as const;

export type SystemRoleName =
  (typeof SYSTEM_DEFAULT_ROLES)[keyof typeof SYSTEM_DEFAULT_ROLES];

/**
 * Base security context passed along application use cases
 */
export interface ISecurityContext {
  userId?: string;
  companyId?: string;
  user?: {
    id: string;
    isAdmin?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Helper to wrap any context with security authorization attributes
 */
export type WithSecurityContext<T> = T & ISecurityContext;
