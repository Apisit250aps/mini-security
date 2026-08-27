---
name: clean-architecture-database-drizzle
description: Scaffold, configure, and implement the Database Layer in packages/database using Drizzle ORM — Drizzle table schemas, UUIDv7 helpers, centralized relations with defineRelationsPart, Drizzle client connection, and the generic Repository base class.
tags:
  - backend
  - both
  - fullstack
---

# Clean Architecture Database Layer with Drizzle ORM 🗄️

Use this skill when **scaffolding `packages/database`**, defining **Drizzle ORM table schemas**, setting up **relations (`defineRelationsPart`)**, configuring **`drizzle-kit` migrations**, or implementing the **generic `Repository<T, C, U>` base class**.

---

## 🎯 Architecture Overview (`packages/database`)

`packages/database` is the data access foundation in the Clean Architecture Monorepo. It depends solely on `@<project>/domains` and provides persistence mechanisms to `@<project>/infrastructures`:

```text
[packages/domains] (Core Domain & BaseRepository contract)
       ▲
       │ Depends on
[packages/database] (Drizzle ORM Schemas, Relations, DB Client, Base Repository)
       ▲
       │ Implements / Consumes
[packages/infrastructures] (Concrete Repositories extend Repository<T, C, U>)
```

---

## 📁 Standard Directory Layout

```text
packages/database/
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── drizzle.config.ts          # Drizzle Kit migration & introspect config
├── drizzle/                   # Generated SQL migration files
└── src/
    ├── index.ts               # Package exports
    ├── db.ts                  # Drizzle instance connection & Database type export
    ├── relations.ts           # Centralized table relations (defineRelationsPart)
    ├── repository.ts          # Abstract generic base Repository<T, C, U>
    ├── lib/
    │   ├── utils.ts           # primaryKeyUuid7, createdAtTimestamp, updatedAtTimestamp
    │   └── uuid.ts            # UUIDv7 generator (generateUUID)
    └── schema/
        ├── index.ts           # Barrel export for all Drizzle table schemas
        ├── auth.ts            # Authentication tables (user, session, account)
        ├── company.ts         # Multi-tenant tables (company, branch, department)
        └── product.ts         # Domain tables (category, brand, unit, product)
```

---

## ⚙️ Complete Setup Instructions

### 1. `packages/database/package.json`

```json
{
  "name": "@<project>/database",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "check-types": "tsc --noEmit",
    "lint": "eslint .",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "exports": {
    "./db": "./src/db.ts",
    "./schema": "./src/schema/index.ts",
    "./repository": "./src/repository.ts"
  },
  "imports": {
    "#lib/*": "./src/lib/*.ts",
    "#schema/*": "./src/schema/*.ts"
  },
  "dependencies": {
    "@<project>/domains": "*",
    "drizzle-orm": "^0.39.0",
    "pg": "^8.13.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@<project>/eslint-config": "*",
    "@<project>/typescript-config": "*",
    "@types/node": "^22.0.0",
    "@types/pg": "^8.11.0",
    "@types/uuid": "^10.0.0",
    "drizzle-kit": "^0.30.0",
    "typescript": "^5.0.0"
  }
}
```

---

### 2. `packages/database/drizzle.config.ts`

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
});
```

---

### 3. Schema & UUIDv7 Helpers (`src/lib/utils.ts` & `src/lib/uuid.ts`)

#### `src/lib/uuid.ts`
```typescript
import { v7 as uuidv7 } from 'uuid';

export const generateUUID = () => uuidv7();
```

#### `src/lib/utils.ts`
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

### 4. Database Connection Instance (`src/db.ts`)

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

### 5. Centralized Relations (`src/relations.ts`)

Use Drizzle's `defineRelationsPart` to declare all table relations in one centralized place, avoiding circular dependencies across schema files:

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
  },
}));
```

---

### 6. Generic Base Repository (`src/repository.ts`)

Implements full CRUD against `this.table` using `this.db`:

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

### 7. Drizzle Table Schema Pattern (`src/schema/<module>.ts`)

```typescript
// packages/database/src/schema/product.ts
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
  ],
);
```

#### Barrel Export (`src/schema/index.ts`):
```typescript
export * from './auth';
export * from './company';
export * from './product';
```

---

## 🛠️ Step-by-Step Feature Workflow

When adding a new module/table to the database:

1. **Step 1 — Create Table Schema (`src/schema/<module>.ts`)**:
   - Use `primaryKeyUuid7('id')` for primary keys.
   - Use `createdAtTimestamp('created_at')` & `updatedAtTimestamp('updated_at')`.
   - Add foreign keys with `.references()` and define indexes for all FK columns in the 2nd argument array.
2. **Step 2 — Export in `src/schema/index.ts`**:
   - `export * from './<module>';`
3. **Step 3 — Register Table Relations in `src/relations.ts`**:
   - Add `r.one.<relation>()` and `r.many.<relation>()` mappings.
4. **Step 4 — Generate / Push Migrations**:
   ```bash
   cd packages/database
   npm run db:push       # Direct push in development
   # or
   npm run db:generate   # Generate SQL migration file
   npm run db:migrate    # Run pending SQL migrations
   ```
5. **Step 5 — Inherit in Infrastructure Repository**:
   In `packages/infrastructures/src/repositories/<module>.repo.ts`:
   ```typescript
   export default class ProductRepository
     extends Repository<Product, CreateProduct, UpdateProduct>
     implements IProductRepository
   {
     constructor(db: Database) {
       super(db, product);
     }
   }
   ```

---

## 🛡️ Non-Negotiable Database Rules

1. **UUIDv7 Everywhere**: Always use `primaryKeyUuid7('id')` — never auto-incrementing integers (`serial`) or plain v4 UUIDs.
2. **Index All Foreign Keys**: Every FK column MUST have an explicit `index('<table>_<col>_idx').on(table.<col>)` to prevent table scans.
3. **Centralized Relations**: Never declare relational mapping inside table schema files — always place them in `src/relations.ts`.
4. **Zero Cross-Layer Pollution**: `packages/database` only imports from `@<project>/domains`. Never import `applications`, `infrastructures`, or HTTP libraries.
5. **Inherit Base CRUD**: Concrete repos in `infrastructures` inherit `create`, `findById`, `findAll`, `update`, and `delete` from `Repository<T, C, U>` — never re-implement them.

---

## 📚 Further Reference

- [drizzle-patterns.md](references/drizzle-patterns.md): Complete copy-paste templates for table schemas, indexes, multi-table relations, and migration setups.
- [infrastructure-patterns.md](../../clean-architecture-infrastructure/references/infrastructure-patterns.md): How concrete repositories consume `packages/database`.
