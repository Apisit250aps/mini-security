// ============================================================
// SYSTEM DEFAULT ROLE DEFINITIONS
// ============================================================

export type RoleType = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface RoleDefinition {
  /** The role type enum value */
  readonly roleType: RoleType;
  /** Human-readable display name */
  readonly name: string;
  /** Description of the role's access level */
  readonly description: string;
  /** company_id is NULL for global system default roles */
  readonly isSystemDefault: boolean;
}

/**
 * Canonical list of all system default roles.
 * These are seeded at database initialization with `company_id = NULL`.
 */
export const SYSTEM_DEFAULT_ROLES: readonly RoleDefinition[] = [
  {
    roleType: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full system access across all tenants and operations',
    isSystemDefault: true,
  },
  {
    roleType: 'OWNER',
    name: 'Owner',
    description:
      'Full administrative access to the company and organization resources',
    isSystemDefault: true,
  },
  {
    roleType: 'ADMIN',
    name: 'Admin',
    description:
      'Administrative access with member management and view privileges',
    isSystemDefault: true,
  },
  {
    roleType: 'MEMBER',
    name: 'Member',
    description: 'Standard member access with read and operational privileges',
    isSystemDefault: true,
  },
  {
    roleType: 'VIEWER',
    name: 'Viewer',
    description: 'Read-only access to company resources and members',
    isSystemDefault: true,
  },
] as const;
