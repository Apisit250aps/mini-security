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

export const organizationKeys = {
  ...createQueryKeys('ORGANIZATION'),
  members: (organizationId: string) =>
    ['ORGANIZATION', 'DETAIL', organizationId, 'MEMBERS'] as const,
  sites: (organizationId: string) =>
    ['ORGANIZATION', 'DETAIL', organizationId, 'SITES'] as const,
};

export const roleKeys = {
  ...createQueryKeys('ROLE'),
  organization: (organizationId: string) =>
    ['ROLE', 'ORGANIZATION', organizationId] as const,
  permissions: (roleId: string) =>
    ['ROLE', 'DETAIL', roleId, 'PERMISSIONS'] as const,
};

export const permissionKeys = {
  ...createQueryKeys('PERMISSION'),
  my: (organizationId?: string) =>
    ['PERMISSION', 'MY', organizationId || 'GLOBAL'] as const,
};

export const sessionKeys = {
  all: ['SESSION'] as const,
  myPermissions: (organizationId?: string) =>
    ['SESSION', 'PERMISSIONS', organizationId || 'GLOBAL'] as const,
};

export const featureKeys = {
  ...createQueryKeys('FEATURE'),
  organization: (organizationId: string) =>
    ['FEATURE', 'ORGANIZATION', organizationId] as const,
  organizationAvailable: (organizationId: string) =>
    ['FEATURE', 'ORGANIZATION', organizationId, 'AVAILABLE'] as const,
  role: (roleId: string) => ['FEATURE', 'ROLE', roleId] as const,
  organizationRoles: (organizationId: string) =>
    ['FEATURE', 'ORGANIZATION_ROLES', organizationId] as const,
};

export const attendanceKeys = {
  ...createQueryKeys('ATTENDANCE'),
  schedules: (organizationId: string) =>
    ['ATTENDANCE', 'SCHEDULES', organizationId] as const,
  scheduleByRole: (organizationId: string, roleId: string) =>
    ['ATTENDANCE', 'SCHEDULE', 'ROLE', organizationId, roleId] as const,
  slots: (scheduleId: string) => ['ATTENDANCE', 'SLOTS', scheduleId] as const,
  memberLogs: (memberId: string, filters?: Record<string, unknown>) =>
    ['ATTENDANCE', 'LOGS', 'MEMBER', memberId, filters] as const,
  organizationLogs: (
    organizationId: string,
    filters?: Record<string, unknown>,
  ) => ['ATTENDANCE', 'LOGS', 'ORGANIZATION', organizationId, filters] as const,
};

export const locationKeys = {
  all: ['LOCATIONS'] as const,
  organization: (organizationId: string) =>
    ['LOCATIONS', organizationId] as const,
  site: (siteId: string) => ['LOCATIONS', 'SITE', siteId] as const,
  assignments: (organizationId: string, slotId: string) =>
    ['LOCATIONS', organizationId, 'SLOT', slotId] as const,
};

export const leaveKeys = {
  ...createQueryKeys('LEAVE'),
  typeLists: (organizationId: string) =>
    ['LEAVE', 'TYPES', organizationId] as const,
  types: (organizationId: string, onlyActive?: boolean) =>
    ['LEAVE', 'TYPES', organizationId, { onlyActive }] as const,
  quotas: (memberId: string, year: number) =>
    ['LEAVE', 'QUOTAS', memberId, year] as const,
  memberRequests: (memberId: string) =>
    ['LEAVE', 'REQUESTS', 'MEMBER', memberId] as const,
  organizationRequests: (
    organizationId: string,
    filters?: Record<string, unknown>,
  ) => ['LEAVE', 'REQUESTS', 'ORGANIZATION', organizationId, filters] as const,
};

export const formKeys = {
  ...createQueryKeys('FORM'),
  templates: (organizationId: string) =>
    ['FORM', 'TEMPLATES', organizationId] as const,
  template: (templateId: string) => ['FORM', 'TEMPLATE', templateId] as const,
  submissions: (organizationId?: string, filters?: Record<string, unknown>) =>
    ['FORM', 'SUBMISSIONS', organizationId ?? 'ALL', filters] as const,
  submission: (submissionId: string) =>
    ['FORM', 'SUBMISSION', submissionId] as const,
  plans: (organizationId: string, templateId?: string) =>
    ['FORM', 'PLANS', organizationId, templateId ?? 'ALL'] as const,
  plan: (planId: string) => ['FORM', 'PLAN', planId] as const,
  schedulePreview: (planId: string) =>
    ['FORM', 'PLAN', planId, 'PREVIEW'] as const,
  occurrences: (organizationId: string, templateId?: string) =>
    ['FORM', 'OCCURRENCES', organizationId, templateId ?? 'ALL'] as const,
  occurrence: (occurrenceId: string) =>
    ['FORM', 'OCCURRENCE', occurrenceId] as const,
  occurrenceAssignments: (occurrenceId: string) =>
    ['FORM', 'OCCURRENCE', occurrenceId, 'ASSIGNMENTS'] as const,
  myAssignments: (organizationId: string, memberId?: string) =>
    ['FORM', 'ASSIGNMENTS', organizationId, memberId ?? 'ME'] as const,
  assignment: (assignmentId: string) =>
    ['FORM', 'ASSIGNMENT', assignmentId] as const,
  reviewQueue: (organizationId: string) =>
    ['FORM', 'REVIEWS', 'QUEUE', organizationId] as const,
  reviewDetail: (submissionId: string) =>
    ['FORM', 'REVIEWS', 'DETAIL', submissionId] as const,
};
