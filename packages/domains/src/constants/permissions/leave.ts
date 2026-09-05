import type { PermissionDefinition } from './types';

// ============================================================
// LEAVE REQUEST MODULE PERMISSIONS
// ============================================================

export const LEAVE_REQUEST_PERMISSIONS = {
  CREATE: 'leave_request:create',
  READ: 'leave_request:read',
  UPDATE: 'leave_request:update',
  DELETE: 'leave_request:delete',
  APPROVE: 'leave_request:approve',
} as const;

export const LEAVE_REQUEST_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: LEAVE_REQUEST_PERMISSIONS.CREATE,
      module: 'leave_request',
      description: 'Submit leave requests',
      featureCode: 'LEAVE_MANAGEMENT',
    },
    {
      action: LEAVE_REQUEST_PERMISSIONS.READ,
      module: 'leave_request',
      description: 'Read leave requests',
      featureCode: 'LEAVE_MANAGEMENT',
    },
    {
      action: LEAVE_REQUEST_PERMISSIONS.UPDATE,
      module: 'leave_request',
      description: 'Update leave requests',
      featureCode: 'LEAVE_MANAGEMENT',
    },
    {
      action: LEAVE_REQUEST_PERMISSIONS.DELETE,
      module: 'leave_request',
      description: 'Delete or cancel leave requests',
      featureCode: 'LEAVE_MANAGEMENT',
    },
    {
      action: LEAVE_REQUEST_PERMISSIONS.APPROVE,
      module: 'leave_request',
      description: 'Approve or reject leave requests',
      featureCode: 'LEAVE_MANAGEMENT',
    },
  ];
