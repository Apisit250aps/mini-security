import type { PermissionDefinition } from './types';

// ============================================================
// PERMISSION MODULE PERMISSIONS
// ============================================================

export const PERMISSION_PERMISSIONS = {
  CREATE: 'permission:create',
  READ: 'permission:read',
  UPDATE: 'permission:update',
  DELETE: 'permission:delete',
  ASSIGN: 'permission:assign',
  REVOKE: 'permission:revoke',
} as const;

export const PERMISSION_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: PERMISSION_PERMISSIONS.CREATE,
      module: 'permission',
      description: 'Create new system permissions',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: PERMISSION_PERMISSIONS.READ,
      module: 'permission',
      description: 'Read and view system permissions',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: PERMISSION_PERMISSIONS.UPDATE,
      module: 'permission',
      description: 'Update permission details',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: PERMISSION_PERMISSIONS.DELETE,
      module: 'permission',
      description: 'Delete permissions',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: PERMISSION_PERMISSIONS.ASSIGN,
      module: 'permission',
      description: 'Assign permissions to roles',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
    {
      action: PERMISSION_PERMISSIONS.REVOKE,
      module: 'permission',
      description: 'Revoke permissions from roles',
      featureCode: 'ROLE_PERMISSION_MANAGEMENT',
    },
  ];
