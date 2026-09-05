import type { PermissionDefinition } from './types';

// ============================================================
// ROLE MODULE PERMISSIONS
// ============================================================

export const ROLE_PERMISSIONS = {
  CREATE: 'role:create',
  READ: 'role:read',
  UPDATE: 'role:update',
  DELETE: 'role:delete',
} as const;

export const ROLE_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    action: ROLE_PERMISSIONS.CREATE,
    module: 'role',
    description: 'Create custom roles',
    featureCode: 'ROLE_PERMISSION_MANAGEMENT',
  },
  {
    action: ROLE_PERMISSIONS.READ,
    module: 'role',
    description: 'Read roles and their assigned permissions',
    featureCode: 'ROLE_PERMISSION_MANAGEMENT',
  },
  {
    action: ROLE_PERMISSIONS.UPDATE,
    module: 'role',
    description: 'Update role details and configurations',
    featureCode: 'ROLE_PERMISSION_MANAGEMENT',
  },
  {
    action: ROLE_PERMISSIONS.DELETE,
    module: 'role',
    description: 'Delete custom roles',
    featureCode: 'ROLE_PERMISSION_MANAGEMENT',
  },
];
