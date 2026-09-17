import { DuplicateError, NotFoundError } from './error';

/** Shared "find by id or throw NotFoundError" pattern used across CRUD use cases. */
export async function requireEntityExists<T>(
  finder: () => Promise<T | null | undefined>,
  message: string,
): Promise<T> {
  const entity = await finder();
  if (!entity) throw new NotFoundError(message);
  return entity;
}

/**
 * Shared "unique field" check used by create/update use cases: throws DuplicateError
 * when a record with the candidate value exists and (for updates) isn't the record itself.
 */
export async function requireUniqueField<T extends { id: string }>(
  finder: () => Promise<T | null | undefined>,
  message: string,
  excludeId?: string,
): Promise<void> {
  const existing = await finder();
  if (existing && existing.id !== excludeId) {
    throw new DuplicateError(message);
  }
}
