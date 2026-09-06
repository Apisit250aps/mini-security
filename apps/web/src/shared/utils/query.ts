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

export const featureKeys = {
  ...createQueryKeys('FEATURE'),
  company: (companyId: string) => ['FEATURE', 'COMPANY', companyId] as const,
  companyAvailable: (companyId: string) =>
    ['FEATURE', 'COMPANY', companyId, 'AVAILABLE'] as const,
  role: (roleId: string) => ['FEATURE', 'ROLE', roleId] as const,
  companyRoles: (companyId: string) =>
    ['FEATURE', 'COMPANY_ROLES', companyId] as const,
};

export const attendanceKeys = {
  ...createQueryKeys('ATTENDANCE'),
  schedules: (companyId: string) =>
    ['ATTENDANCE', 'SCHEDULES', companyId] as const,
  scheduleByRole: (roleId: string) =>
    ['ATTENDANCE', 'SCHEDULE', 'ROLE', roleId] as const,
  slots: (scheduleId: string) => ['ATTENDANCE', 'SLOTS', scheduleId] as const,
  memberLogs: (memberId: string, filters?: Record<string, unknown>) =>
    ['ATTENDANCE', 'LOGS', 'MEMBER', memberId, filters] as const,
  companyLogs: (companyId: string, filters?: Record<string, unknown>) =>
    ['ATTENDANCE', 'LOGS', 'COMPANY', companyId, filters] as const,
};

export const leaveKeys = {
  ...createQueryKeys('LEAVE'),
  types: (companyId: string, onlyActive?: boolean) =>
    ['LEAVE', 'TYPES', companyId, { onlyActive }] as const,
  quotas: (memberId: string, year: number) =>
    ['LEAVE', 'QUOTAS', memberId, year] as const,
  memberRequests: (memberId: string) =>
    ['LEAVE', 'REQUESTS', 'MEMBER', memberId] as const,
  companyRequests: (companyId: string, status?: string) =>
    ['LEAVE', 'REQUESTS', 'COMPANY', companyId, status || 'ALL'] as const,
};
