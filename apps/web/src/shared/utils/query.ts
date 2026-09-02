/**
 * Factory function for generating standard, type-safe TanStack Query key hierarchies with UPPERCASE keys.
 * Example:
 *   const userKeys = createQueryKeys('USER');
 *   userKeys.all           => ['USER']
 *   userKeys.lists()       => ['USER', 'LIST']
 *   userKeys.list(filters) => ['USER', 'LIST', { ... }]
 *   userKeys.details()     => ['USER', 'DETAIL']
 *   userKeys.detail(id)    => ['USER', 'DETAIL', '123']
 */
export function createQueryKeys<TEntity extends string>(entity: TEntity) {
  const all = [entity] as const;

  return {
    all,
    lists: () => [...all, 'LIST'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters
        ? ([...all, 'LIST', filters] as const)
        : ([...all, 'LIST'] as const),
    details: () => [...all, 'DETAIL'] as const,
    detail: (id: string | number) => [...all, 'DETAIL', id] as const,
  };
}

/**
 * Pre-defined uppercase query keys for entities in the app.
 */
export const userKeys = createQueryKeys('USER');

export const companyKeys = {
  ...createQueryKeys('COMPANY'),
  members: (companyId: string) =>
    ['COMPANY', 'DETAIL', companyId, 'MEMBERS'] as const,
  branches: (companyId: string) =>
    ['COMPANY', 'DETAIL', companyId, 'BRANCHES'] as const,
};

export const roleKeys = {
  ...createQueryKeys('ROLE'),
  company: (companyId: string) => ['ROLE', 'COMPANY', companyId] as const,
  permissions: (roleId: string) =>
    ['ROLE', 'DETAIL', roleId, 'PERMISSIONS'] as const,
};

export const permissionKeys = {
  ...createQueryKeys('PERMISSION'),
  my: (companyId?: string) =>
    ['PERMISSION', 'MY', companyId || 'GLOBAL'] as const,
};

export const sessionKeys = {
  all: ['SESSION'] as const,
  myPermissions: (companyId?: string) =>
    ['SESSION', 'PERMISSIONS', companyId || 'GLOBAL'] as const,
};

export const attendanceKeys = {
  schedules: (companyId: string) =>
    ['ATTENDANCE', 'SCHEDULES', companyId] as const,
  scheduleDetail: (id: string) => ['ATTENDANCE', 'SCHEDULE', id] as const,
  shifts: (scheduleId: string) => ['ATTENDANCE', 'SHIFTS', scheduleId] as const,
  shiftDetail: (id: string) => ['ATTENDANCE', 'SHIFT', id] as const,
  policies: (companyId: string) =>
    ['ATTENDANCE', 'POLICIES', companyId] as const,
  policyDetail: (id: string) => ['ATTENDANCE', 'POLICY', id] as const,
  checkpoints: (policyId: string) =>
    ['ATTENDANCE', 'CHECKPOINTS', policyId] as const,
  checkpointDetail: (id: string) => ['ATTENDANCE', 'CHECKPOINT', id] as const,
  rolePolicies: (roleId: string) =>
    ['ATTENDANCE', 'ROLE_POLICIES', roleId] as const,
  locations: (companyId: string) =>
    ['ATTENDANCE', 'LOCATIONS', companyId] as const,
  locationDetail: (id: string) => ['ATTENDANCE', 'LOCATION', id] as const,
  checkpointLocations: (checkpointId: string) =>
    ['ATTENDANCE', 'CHECKPOINT_LOCATIONS', checkpointId] as const,
  roleSchedules: (companyId: string) =>
    ['ATTENDANCE', 'ROLE_SCHEDULES', companyId] as const,
  currentRoleSchedule: (roleId: string) =>
    ['ATTENDANCE', 'ROLE_SCHEDULES', roleId, 'CURRENT'] as const,
  records: (companyId: string, filters?: Record<string, unknown>) =>
    filters
      ? (['ATTENDANCE', 'RECORDS', companyId, filters] as const)
      : (['ATTENDANCE', 'RECORDS', companyId] as const),
  recordDetail: (id: string) => ['ATTENDANCE', 'RECORD', id] as const,
  recordLogs: (recordId: string) =>
    ['ATTENDANCE', 'RECORD_LOGS', recordId] as const,
  leaveRequests: (companyId: string, filters?: Record<string, unknown>) =>
    filters
      ? (['ATTENDANCE', 'LEAVE_REQUESTS', companyId, filters] as const)
      : (['ATTENDANCE', 'LEAVE_REQUESTS', companyId] as const),
  leaveDetail: (id: string) => ['ATTENDANCE', 'LEAVE_REQUEST', id] as const,
};
