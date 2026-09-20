import { and, isNull, type SQL, type SQLWrapper } from 'drizzle-orm';
import { timestamp, uuid, type PgColumn } from 'drizzle-orm/pg-core';
import { generateUUID } from './uuid';

export function primaryKeyUuid7<T extends string>(columnName: T) {
  return uuid(columnName)
    .primaryKey()
    .$defaultFn(() => generateUUID());
}

export function updatedAtTimestamp<T extends string>(columnName: T) {
  return timestamp(columnName)
    .$onUpdate(() => new Date())
    .notNull();
}

export function createdAtTimestamp<T extends string>(columnName: T) {
  return timestamp(columnName).defaultNow().notNull();
}

export function deletedAtTimestamp<T extends string>(columnName: T) {
  return timestamp(columnName);
}

/** Removes the database-only soft-delete marker from repository results. */
export function withoutDeletedAt<T extends object>(
  value: T,
): Omit<T, 'deletedAt'> {
  if (!('deletedAt' in value)) return value as Omit<T, 'deletedAt'>;

  const { deletedAt: _deletedAt, ...result } = value as T & {
    deletedAt?: unknown;
  };
  return result as Omit<T, 'deletedAt'>;
}

export type SoftDeletableTarget =
  | { deletedAt?: PgColumn | null }
  | PgColumn
  | undefined
  | null;

/**
 * Returns `isNull(table.deletedAt)` if target has deletedAt or is a PgColumn.
 */
export function notDeleted(target?: SoftDeletableTarget): SQL | undefined {
  if (!target) return undefined;
  if ('deletedAt' in target) {
    return target.deletedAt ? isNull(target.deletedAt) : undefined;
  }
  return isNull(target as PgColumn);
}

/**
 * Combines conditions with `notDeleted(target)` using `and(...)`.
 */
export function whereNotDeleted(
  target: SoftDeletableTarget,
  ...conditions: (SQL | SQLWrapper | undefined | null)[]
): SQL | undefined {
  const activeCondition = notDeleted(target);
  const validConditions = conditions.filter(
    (c): c is SQL | SQLWrapper => c !== undefined && c !== null,
  );

  if (activeCondition) {
    validConditions.unshift(activeCondition);
  }

  if (validConditions.length === 0) {
    return undefined;
  }

  return and(...validConditions);
}

export * from './encryption';
