import { BaseRepository } from '@repo/domains';
import type { Database } from './db';
import { resolveDatabase } from './transaction';
import { PgTable, type PgColumn } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

export type TableWithId = PgTable & { id: PgColumn };

export abstract class Repository<
  T,
  C extends Record<string, unknown>,
  U extends Record<string, unknown>,
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

  async create(entity: C): Promise<T> {
    const [result] = await this.db
      .insert(this.table)
      .values(entity)
      .returning();
    return result as T;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(this.table).where(eq(this.table.id, id));
  }

  async findAll(): Promise<T[]> {
    const results = await this.db.select().from(this.table);
    return results as T[];
  }

  async findById(id: string): Promise<T | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));
    return (result as T) || null;
  }

  async update(id: string, entity: U): Promise<T> {
    const [result] = await this.db
      .update(this.table)
      .set(entity)
      .where(eq(this.table.id, id))
      .returning();
    return result as T;
  }
}
