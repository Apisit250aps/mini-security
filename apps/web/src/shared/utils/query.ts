/**
 * Factory function for generating standard, type-safe TanStack Query key hierarchies.
 * Example:
 *   const userKeys = createQueryKeys('users');
 *   userKeys.all           => ['users']
 *   userKeys.lists()       => ['users', 'list']
 *   userKeys.list(filters) => ['users', 'list', { ... }]
 *   userKeys.details()     => ['users', 'detail']
 *   userKeys.detail(id)    => ['users', 'detail', '123']
 */
export function createQueryKeys<TEntity extends string>(entity: TEntity) {
  const all = [entity] as const;

  return {
    all,
    lists: () => [...all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters
        ? ([...all, 'list', filters] as const)
        : ([...all, 'list'] as const),
    details: () => [...all, 'detail'] as const,
    detail: (id: string | number) => [...all, 'detail', id] as const,
  };
}

/**
 * Pre-defined query keys for entities in the app.
 */
export const userKeys = createQueryKeys('USER');
export const companyKeys = createQueryKeys('COMPANY');
export const roleKeys = createQueryKeys('ROLE');
export const permissionKeys = createQueryKeys('PERMISSION');
