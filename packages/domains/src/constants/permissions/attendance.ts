import type { PermissionDefinition } from './types';

// ============================================================
// WORK SCHEDULE MODULE PERMISSIONS
// ============================================================

export const WORK_SCHEDULE_PERMISSIONS = {
  CREATE: 'work_schedule:create',
  READ: 'work_schedule:read',
  UPDATE: 'work_schedule:update',
  DELETE: 'work_schedule:delete',
} as const;

export const WORK_SCHEDULE_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: WORK_SCHEDULE_PERMISSIONS.CREATE,
      module: 'work_schedule',
      description: 'Create a new work schedule',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: WORK_SCHEDULE_PERMISSIONS.READ,
      module: 'work_schedule',
      description: 'Read work schedules and shifts',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: WORK_SCHEDULE_PERMISSIONS.UPDATE,
      module: 'work_schedule',
      description: 'Update work schedules',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: WORK_SCHEDULE_PERMISSIONS.DELETE,
      module: 'work_schedule',
      description: 'Delete work schedules',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
  ];

// ============================================================
// WORK SHIFT MODULE PERMISSIONS
// ============================================================

export const WORK_SHIFT_PERMISSIONS = {
  CREATE: 'work_shift:create',
  READ: 'work_shift:read',
  UPDATE: 'work_shift:update',
  DELETE: 'work_shift:delete',
} as const;

export const WORK_SHIFT_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: WORK_SHIFT_PERMISSIONS.CREATE,
      module: 'work_shift',
      description: 'Create a work shift',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: WORK_SHIFT_PERMISSIONS.READ,
      module: 'work_shift',
      description: 'Read work shifts',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: WORK_SHIFT_PERMISSIONS.UPDATE,
      module: 'work_shift',
      description: 'Update work shifts',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: WORK_SHIFT_PERMISSIONS.DELETE,
      module: 'work_shift',
      description: 'Delete work shifts',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
  ];

// ============================================================
// ATTENDANCE POLICY MODULE PERMISSIONS
// ============================================================

export const ATTENDANCE_POLICY_PERMISSIONS = {
  CREATE: 'attendance_policy:create',
  READ: 'attendance_policy:read',
  UPDATE: 'attendance_policy:update',
  DELETE: 'attendance_policy:delete',
} as const;

export const ATTENDANCE_POLICY_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: ATTENDANCE_POLICY_PERMISSIONS.CREATE,
      module: 'attendance_policy',
      description: 'Create an attendance policy',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_POLICY_PERMISSIONS.READ,
      module: 'attendance_policy',
      description: 'Read attendance policies and checkpoints',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_POLICY_PERMISSIONS.UPDATE,
      module: 'attendance_policy',
      description: 'Update attendance policies',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_POLICY_PERMISSIONS.DELETE,
      module: 'attendance_policy',
      description: 'Delete attendance policies',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
  ];

// ============================================================
// ATTENDANCE CHECKPOINT MODULE PERMISSIONS
// ============================================================

export const ATTENDANCE_CHECKPOINT_PERMISSIONS = {
  CREATE: 'attendance_checkpoint:create',
  READ: 'attendance_checkpoint:read',
  UPDATE: 'attendance_checkpoint:update',
  DELETE: 'attendance_checkpoint:delete',
} as const;

export const ATTENDANCE_CHECKPOINT_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: ATTENDANCE_CHECKPOINT_PERMISSIONS.CREATE,
      module: 'attendance_checkpoint',
      description: 'Create an attendance checkpoint',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_CHECKPOINT_PERMISSIONS.READ,
      module: 'attendance_checkpoint',
      description: 'Read attendance checkpoints',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_CHECKPOINT_PERMISSIONS.UPDATE,
      module: 'attendance_checkpoint',
      description: 'Update attendance checkpoints',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_CHECKPOINT_PERMISSIONS.DELETE,
      module: 'attendance_checkpoint',
      description: 'Delete attendance checkpoints',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
  ];

// ============================================================
// ATTENDANCE LOCATION MODULE PERMISSIONS
// ============================================================

export const ATTENDANCE_LOCATION_PERMISSIONS = {
  CREATE: 'attendance_location:create',
  READ: 'attendance_location:read',
  UPDATE: 'attendance_location:update',
  DELETE: 'attendance_location:delete',
} as const;

export const ATTENDANCE_LOCATION_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: ATTENDANCE_LOCATION_PERMISSIONS.CREATE,
      module: 'attendance_location',
      description: 'Create an attendance location',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_LOCATION_PERMISSIONS.READ,
      module: 'attendance_location',
      description: 'Read attendance locations',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_LOCATION_PERMISSIONS.UPDATE,
      module: 'attendance_location',
      description: 'Update attendance locations',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_LOCATION_PERMISSIONS.DELETE,
      module: 'attendance_location',
      description: 'Delete attendance locations',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
  ];

// ============================================================
// ROLE WORK SCHEDULE MODULE PERMISSIONS
// ============================================================

export const ROLE_WORK_SCHEDULE_PERMISSIONS = {
  CREATE: 'role_work_schedule:create',
  READ: 'role_work_schedule:read',
  UPDATE: 'role_work_schedule:update',
  DELETE: 'role_work_schedule:delete',
} as const;

export const ROLE_WORK_SCHEDULE_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: ROLE_WORK_SCHEDULE_PERMISSIONS.CREATE,
      module: 'role_work_schedule',
      description: 'Assign work schedule/shift to roles',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ROLE_WORK_SCHEDULE_PERMISSIONS.READ,
      module: 'role_work_schedule',
      description: 'Read role work schedules',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ROLE_WORK_SCHEDULE_PERMISSIONS.UPDATE,
      module: 'role_work_schedule',
      description: 'Update role work schedule assignments',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ROLE_WORK_SCHEDULE_PERMISSIONS.DELETE,
      module: 'role_work_schedule',
      description: 'Remove role work schedule assignments',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
  ];

// ============================================================
// ATTENDANCE RECORD MODULE PERMISSIONS
// ============================================================

export const ATTENDANCE_RECORD_PERMISSIONS = {
  CREATE: 'attendance_record:create',
  READ: 'attendance_record:read',
  UPDATE: 'attendance_record:update',
  DELETE: 'attendance_record:delete',
  APPROVE: 'attendance_record:approve',
} as const;

export const ATTENDANCE_RECORD_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: ATTENDANCE_RECORD_PERMISSIONS.CREATE,
      module: 'attendance_record',
      description: 'Create daily attendance records',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_RECORD_PERMISSIONS.READ,
      module: 'attendance_record',
      description: 'Read attendance records',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_RECORD_PERMISSIONS.UPDATE,
      module: 'attendance_record',
      description: 'Update attendance records',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_RECORD_PERMISSIONS.DELETE,
      module: 'attendance_record',
      description: 'Delete attendance records',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_RECORD_PERMISSIONS.APPROVE,
      module: 'attendance_record',
      description: 'Approve or reject attendance records',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
  ];

// ============================================================
// ATTENDANCE LOG MODULE PERMISSIONS
// ============================================================

export const ATTENDANCE_LOG_PERMISSIONS = {
  CREATE: 'attendance_log:create',
  READ: 'attendance_log:read',
  DELETE: 'attendance_log:delete',
  MANUAL_CHECK: 'attendance_log:manual_check',
} as const;

export const ATTENDANCE_LOG_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  [
    {
      action: ATTENDANCE_LOG_PERMISSIONS.CREATE,
      module: 'attendance_log',
      description: 'Record attendance check-in / check-out log event',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_LOG_PERMISSIONS.READ,
      module: 'attendance_log',
      description: 'Read attendance log history',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_LOG_PERMISSIONS.DELETE,
      module: 'attendance_log',
      description: 'Delete attendance log entries',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
    {
      action: ATTENDANCE_LOG_PERMISSIONS.MANUAL_CHECK,
      module: 'attendance_log',
      description: 'Perform manual check-in on behalf of members',
      featureCode: 'ATTENDANCE_MANAGEMENT',
    },
  ];
