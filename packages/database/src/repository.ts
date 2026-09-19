import { BaseRepository } from '@repo/domains';
import { config } from '@repo/configs';
import type { Database } from './db';
import { resolveDatabase } from './transaction';
import { PgTable, type PgColumn } from 'drizzle-orm/pg-core';
import { eq, getTableName, type SQL, type SQLWrapper } from 'drizzle-orm';
import {
  notDeleted,
  withoutDeletedAt,
  whereNotDeleted,
  type SoftDeletableTarget,
} from './lib/utils';

export type TableWithId = PgTable & { id: PgColumn; deletedAt?: PgColumn };

export abstract class Repository<
  T,
  C extends object,
  U extends object,
> extends BaseRepository<T, C, U> {
  constructor(
    private readonly database: Database,
    protected readonly table: TableWithId,
  ) {
    super();
  }

  protected get db() {
    return resolveDatabase(this.database);
  }

  protected hasSoftDelete(): boolean {
    return 'deletedAt' in this.table && Boolean(this.table.deletedAt);
  }

  /**
   * Returns a condition checking that the table (or given target) is not deleted.
   */
  protected notDeleted(target?: SoftDeletableTarget): SQL | undefined {
    return notDeleted(target ?? this.table);
  }

  /**
   * Combines conditions with `notDeleted(this.table)` using `and(...)`.
   * If called with no conditions, returns `isNull(this.table.deletedAt)`.
   */
  protected whereActive(
    ...conditions: (SQL | SQLWrapper | undefined | null)[]
  ): SQL | undefined {
    return whereNotDeleted(this.table, ...conditions);
  }

  /**
   * Soft deletes rows matching the given condition (or hard deletes if table has no deletedAt).
   */
  protected async softDelete(where?: SQL | SQLWrapper): Promise<void> {
    if (!where) return;
    const clause = 'getSQL' in where ? where.getSQL() : (where as SQL);
    if (this.hasSoftDelete()) {
      await this.db
        .update(this.table)
        .set({ deletedAt: new Date() } as unknown as U)
        .where(clause);
      return;
    }
    await this.db.delete(this.table).where(clause);
  }

  async create(entity: C): Promise<T> {
    const startedAt = performance.now();
    const [result] = await this.db
      .insert(this.table)
      .values(entity)
      .returning();
    config.logger.debug(`INSERT ${this.tableName()} ${this.elapsed(startedAt)}`, 'DB');
    return withoutDeletedAt(result as object) as T;
  }

  async delete(id: string): Promise<void> {
    const startedAt = performance.now();
    await this.softDelete(eq(this.table.id, id));
    config.logger.debug(`DELETE ${this.tableName()} ${this.elapsed(startedAt)}`, 'DB');
  }

  async findAll(): Promise<T[]> {
    const startedAt = performance.now();
    const where = this.whereActive();
    const query = this.db.select().from(this.table);
    const results = where ? await query.where(where) : await query;
    config.logger.debug(`SELECT ${this.tableName()} ${this.elapsed(startedAt)}`, 'DB');
    return results.map(withoutDeletedAt) as T[];
  }

  async findById(id: string): Promise<T | null> {
    const startedAt = performance.now();
    const where = this.whereActive(eq(this.table.id, id));
    const [result] = await this.db.select().from(this.table).where(where!);
    config.logger.debug(`SELECT ${this.tableName()} ${this.elapsed(startedAt)}`, 'DB');
    return result ? (withoutDeletedAt(result) as T) : null;
  }

  async update(id: string, entity: U): Promise<T> {
    const startedAt = performance.now();
    const where = this.whereActive(eq(this.table.id, id));
    const [result] = await this.db
      .update(this.table)
      .set(entity)
      .where(where!)
      .returning();
    config.logger.debug(`UPDATE ${this.tableName()} ${this.elapsed(startedAt)}`, 'DB');
    return withoutDeletedAt(result as object) as T;
  }

  private tableName(): string {
    return getTableName(this.table);
  }

  private elapsed(startedAt: number): string {
    return `${(performance.now() - startedAt).toFixed(2)}ms`;
  }
}
