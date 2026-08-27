# Drizzle ORM Database Layer Patterns & Reference Code 🗄️

This reference provides complete, copy-paste ready templates and patterns for building the Database Layer (`packages/database`) using **Drizzle ORM** (PostgreSQL/Node-Postgres) in a Clean Architecture Monorepo.

---

## 1. Drizzle Kit Configuration (`packages/database/drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url,
  },
  verbose: true,
  strict: true,
});
```

---

## 2. UUIDv7 & Timestamp Helpers

### `packages/database/src/lib/uuid.ts`
```typescript
import { v7 as uuidv7 } from 'uuid';

export const generateUUID = () => uuidv7();
```

### `packages/database/src/lib/utils.ts`
```typescript
import { uuid, timestamp } from 'drizzle-orm/pg-core';
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
```

---

## 3. Database Connection & Client Instance (`packages/database/src/db.ts`)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from './relations';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const db = drizzle(url, { relations: { ...relations }, logger: true });

type Database = typeof db;

export type { Database };
export default db;
```

---

## 4. Generic Base Repository (`packages/database/src/repository.ts`)

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseRepository } from '@<project>/domains';
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
```

---

## 5. Drizzle Table Schemas (`packages/database/src/schema/`)

### Multi-tenant Hierarchy (`packages/database/src/schema/company.ts`)
```typescript
import { pgTable, text, index, uuid } from 'drizzle-orm/pg-core';
import {
  primaryKeyUuid7,
  updatedAtTimestamp,
  createdAtTimestamp,
} from '#lib/utils';
import { user } from './auth';

export const company = pgTable(
  'company',
  {
    id: primaryKeyUuid7('id'),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    taxId: text('tax_id'),
    address: text('address'),
    phone: text('phone'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('company_ownerId_idx').on(table.ownerId)],
);

export const branch = pgTable(
  'branch',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code').notNull(),
    address: text('address'),
    phone: text('phone'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('branch_companyId_idx').on(table.companyId)],
);

export const department = pgTable(
  'department',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('department_companyId_idx').on(table.companyId)],
);
```

### Product Module Tables (`packages/database/src/schema/product.ts`)
```typescript
import { pgTable, text, index, uuid, numeric } from 'drizzle-orm/pg-core';
import {
  primaryKeyUuid7,
  updatedAtTimestamp,
  createdAtTimestamp,
} from '#lib/utils';
import { company } from './company';

export const category = pgTable(
  'category',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('category_companyId_idx').on(table.companyId)],
);

export const brand = pgTable(
  'brand',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('brand_companyId_idx').on(table.companyId)],
);

export const unit = pgTable(
  'unit',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('unit_companyId_idx').on(table.companyId)],
);

export const product = pgTable(
  'product',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => category.id, {
      onDelete: 'set null',
    }),
    brandId: uuid('brand_id').references(() => brand.id, {
      onDelete: 'set null',
    }),
    unitId: uuid('unit_id').references(() => unit.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    sku: text('sku').notNull(),
    description: text('description'),
    costPrice: numeric('cost_price', { precision: 12, scale: 2 }).notNull(),
    salePrice: numeric('sale_price', { precision: 12, scale: 2 }).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('product_companyId_idx').on(table.companyId),
    index('product_categoryId_idx').on(table.categoryId),
    index('product_brandId_idx').on(table.brandId),
    index('product_unitId_idx').on(table.unitId),
  ],
);
```

### Barrel Export (`packages/database/src/schema/index.ts`)
```typescript
export * from './auth';
export * from './company';
export * from './product';
```

---

## 6. Centralized Relations (`packages/database/src/relations.ts`)

```typescript
import { defineRelationsPart } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelationsPart(schema, (r) => ({
  company: {
    owner: r.one.user({
      from: r.company.ownerId,
      to: r.user.id,
    }),
    branches: r.many.branch(),
    departments: r.many.department(),
    categories: r.many.category(),
    brands: r.many.brand(),
    units: r.many.unit(),
    products: r.many.product(),
  },
  branch: {
    company: r.one.company({
      from: r.branch.companyId,
      to: r.company.id,
    }),
  },
  product: {
    company: r.one.company({
      from: r.product.companyId,
      to: r.company.id,
    }),
    category: r.one.category({
      from: r.product.categoryId,
      to: r.category.id,
    }),
    brand: r.one.brand({
      from: r.product.brandId,
      to: r.brand.id,
    }),
    unit: r.one.unit({
      from: r.product.unitId,
      to: r.unit.id,
    }),
  },
}));
```

---

## 7. Consuming in Infrastructure Concrete Repository

```typescript
// packages/infrastructures/src/repositories/product.repo.ts
import type { Database } from '@<project>/database/db';
import { Product } from '@<project>/domains/entities';
import { IProductRepository } from '@<project>/domains/repositories/product';
import { product } from '@<project>/database/schema';
import { Repository } from '@<project>/database/repository';
import { CreateProduct, UpdateProduct } from '@<project>/domains/schema/product';
import { eq, and } from 'drizzle-orm';

export default class ProductRepository
  extends Repository<Product, CreateProduct, UpdateProduct>
  implements IProductRepository
{
  constructor(db: Database) {
    super(db, product);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(product.sku, sku));
    return (result as Product) || null;
  }

  async findByCompanyAndCategory(
    companyId: string,
    categoryId: string,
  ): Promise<Product[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(product.companyId, companyId),
          eq(product.categoryId, categoryId),
        ),
      );
    return results as Product[];
  }
}
```
