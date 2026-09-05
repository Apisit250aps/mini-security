import type { PermissionDefinition } from './types';

// ============================================================
// USER MODULE PERMISSIONS
// ============================================================

export const USER_PERMISSIONS = {
  CREATE: 'user:create',
  READ: 'user:read',
  UPDATE: 'user:update',
  DELETE: 'user:delete',
} as const;

export const USER_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    action: USER_PERMISSIONS.CREATE,
    module: 'user',
    description: 'Create a new user',
    featureCode: 'EMPLOYEE_MANAGEMENT',
  },
  {
    action: USER_PERMISSIONS.READ,
    module: 'user',
    description: 'Read user profiles and list users',
    featureCode: 'EMPLOYEE_MANAGEMENT',
  },
  {
    action: USER_PERMISSIONS.UPDATE,
    module: 'user',
    description: 'Update user profile information',
    featureCode: 'EMPLOYEE_MANAGEMENT',
  },
  {
    action: USER_PERMISSIONS.DELETE,
    module: 'user',
    description: 'Delete a user account',
    featureCode: 'EMPLOYEE_MANAGEMENT',
  },
];
