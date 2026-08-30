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
};

export const roleKeys = {
  ...createQueryKeys('ROLE'),
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
