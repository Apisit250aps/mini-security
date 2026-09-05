import type { PermissionDefinition } from './types';

// ============================================================
// FEATURE MODULE PERMISSIONS
// ============================================================

export const FEATURE_PERMISSIONS = {
  CREATE: 'feature:create',
  READ: 'feature:read',
  UPDATE: 'feature:update',
  DELETE: 'feature:delete',
  TOGGLE: 'feature:toggle',
} as const;

export const FEATURE_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: FEATURE_PERMISSIONS.CREATE,
      module: 'feature',
      description: 'Create new platform feature',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: FEATURE_PERMISSIONS.READ,
      module: 'feature',
      description: 'Read platform features catalog',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: FEATURE_PERMISSIONS.UPDATE,
      module: 'feature',
      description: 'Update platform feature',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: FEATURE_PERMISSIONS.DELETE,
      module: 'feature',
      description: 'Delete platform feature',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: FEATURE_PERMISSIONS.TOGGLE,
      module: 'feature',
      description: 'Toggle platform feature active status',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
  ];

// ============================================================
// COMPANY FEATURE MODULE PERMISSIONS (Entitlement)
// ============================================================

export const COMPANY_FEATURE_PERMISSIONS = {
  CREATE: 'company_feature:create',
  READ: 'company_feature:read',
  UPDATE: 'company_feature:update',
  DELETE: 'company_feature:delete',
  TOGGLE: 'company_feature:toggle',
} as const;

export const COMPANY_FEATURE_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: COMPANY_FEATURE_PERMISSIONS.CREATE,
      module: 'company_feature',
      description: 'Assign feature to company',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: COMPANY_FEATURE_PERMISSIONS.READ,
      module: 'company_feature',
      description: 'Read company feature entitlements',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: COMPANY_FEATURE_PERMISSIONS.UPDATE,
      module: 'company_feature',
      description: 'Update company feature settings',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: COMPANY_FEATURE_PERMISSIONS.DELETE,
      module: 'company_feature',
      description: 'Remove feature from company',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: COMPANY_FEATURE_PERMISSIONS.TOGGLE,
      module: 'company_feature',
      description: 'Toggle feature enablement for company',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
  ];

// ============================================================
// ROLE FEATURE MODULE PERMISSIONS (Delegation)
// ============================================================

export const ROLE_FEATURE_PERMISSIONS = {
  CREATE: 'role_feature:create',
  READ: 'role_feature:read',
  UPDATE: 'role_feature:update',
  DELETE: 'role_feature:delete',
  TOGGLE: 'role_feature:toggle',
  CHECK: 'role_feature:check',
} as const;

export const ROLE_FEATURE_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: ROLE_FEATURE_PERMISSIONS.CREATE,
      module: 'role_feature',
      description: 'Assign feature to company role',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: ROLE_FEATURE_PERMISSIONS.READ,
      module: 'role_feature',
      description: 'Read role feature assignments',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: ROLE_FEATURE_PERMISSIONS.UPDATE,
      module: 'role_feature',
      description: 'Update role feature delegation',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: ROLE_FEATURE_PERMISSIONS.DELETE,
      module: 'role_feature',
      description: 'Revoke feature from company role',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: ROLE_FEATURE_PERMISSIONS.TOGGLE,
      module: 'role_feature',
      description: 'Toggle role feature access',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: ROLE_FEATURE_PERMISSIONS.CHECK,
      module: 'role_feature',
      description: 'Check role feature access status',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
  ];
