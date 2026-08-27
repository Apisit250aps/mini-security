/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseRepository } from '@repo/domains';
import type { Database } from './db';
import { PgTable } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

export abstract class Repository<
  T,
  C extends Record<string, unknown>,
  U extends Record<string, unknown>,
> extends BaseRepository<T, C, U> {
  constructor(
    protected readonly db: Database,
    protected readonly table: PgTable<any>,
  ) {
    super();
  }

  async create(entity: C): Promise<T> {
    const [result] = await this.db
      .insert(this.table)
      .values(entity)
      .returning();
    return result as T;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(this.table).where(eq((this.table as any).id, id));
  }

  async findAll(): Promise<T[]> {
    const results = await this.db.select().from(this.table);
    return results as T[];
  }

  async findById(id: string): Promise<T | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id));
    return (result as T) || null;
  }

  async update(id: string, entity: U): Promise<T> {
    const [result] = await this.db
      .update(this.table)
      .set(entity)
      .where(eq((this.table as any).id, id))
      .returning();
    return result as T;
  }
}
