import type { PermissionDefinition } from './types';

// ============================================================
// COMPANY MODULE PERMISSIONS
// ============================================================

export const COMPANY_PERMISSIONS = {
  CREATE: 'company:create',
  READ: 'company:read',
  UPDATE: 'company:update',
  DELETE: 'company:delete',
} as const;

export const COMPANY_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: COMPANY_PERMISSIONS.CREATE,
      module: 'company',
      description: 'Create a new company / tenant',
      featureCode: 'COMPANY_MANAGEMENT',
    },
    {
      action: COMPANY_PERMISSIONS.READ,
      module: 'company',
      description: 'Read company information and list companies',
      featureCode: 'COMPANY_MANAGEMENT',
    },
    {
      action: COMPANY_PERMISSIONS.UPDATE,
      module: 'company',
      description: 'Update company settings and metadata',
      featureCode: 'COMPANY_MANAGEMENT',
    },
    {
      action: COMPANY_PERMISSIONS.DELETE,
      module: 'company',
      description: 'Delete a company and its resources',
      featureCode: 'COMPANY_MANAGEMENT',
    },
  ];

// ============================================================
// COMPANY BRANCH MODULE PERMISSIONS
// ============================================================

export const COMPANY_BRANCH_PERMISSIONS = {
  CREATE: 'company_branch:create',
  READ: 'company_branch:read',
  UPDATE: 'company_branch:update',
  DELETE: 'company_branch:delete',
} as const;

export const COMPANY_BRANCH_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: COMPANY_BRANCH_PERMISSIONS.CREATE,
      module: 'company_branch',
      description: 'Create a new company branch',
      featureCode: 'COMPANY_MANAGEMENT',
    },
    {
      action: COMPANY_BRANCH_PERMISSIONS.READ,
      module: 'company_branch',
      description: 'Read company branch information and list branches',
      featureCode: 'COMPANY_MANAGEMENT',
    },
    {
      action: COMPANY_BRANCH_PERMISSIONS.UPDATE,
      module: 'company_branch',
      description: 'Update company branch details and settings',
      featureCode: 'COMPANY_MANAGEMENT',
    },
    {
      action: COMPANY_BRANCH_PERMISSIONS.DELETE,
      module: 'company_branch',
      description: 'Delete a company branch',
      featureCode: 'COMPANY_MANAGEMENT',
    },
  ];

// ============================================================
// COMPANY MEMBER MODULE PERMISSIONS
// ============================================================

export const COMPANY_MEMBER_PERMISSIONS = {
  CREATE: 'company_member:create',
  READ: 'company_member:read',
  UPDATE: 'company_member:update',
  DELETE: 'company_member:delete',
} as const;

export const COMPANY_MEMBER_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: COMPANY_MEMBER_PERMISSIONS.CREATE,
      module: 'company_member',
      description: 'Invite or add members to a company',
      featureCode: 'COMPANY_MANAGEMENT',
    },
    {
      action: COMPANY_MEMBER_PERMISSIONS.READ,
      module: 'company_member',
      description: 'View company members and membership details',
      featureCode: 'COMPANY_MANAGEMENT',
    },
    {
      action: COMPANY_MEMBER_PERMISSIONS.UPDATE,
      module: 'company_member',
      description: 'Update member roles or membership status',
      featureCode: 'COMPANY_MANAGEMENT',
    },
    {
      action: COMPANY_MEMBER_PERMISSIONS.DELETE,
      module: 'company_member',
      description: 'Remove members from a company',
      featureCode: 'COMPANY_MANAGEMENT',
    },
  ];
