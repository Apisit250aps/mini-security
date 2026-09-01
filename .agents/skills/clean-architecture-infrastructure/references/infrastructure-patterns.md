# Infrastructure Layer Patterns & Code Templates

## 1. Drizzle Generic Base Repository (`database/repository.ts`)

```typescript
// packages/database/src/repository.ts
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

## 2. Drizzle Schema Helpers & UUIDv7 (`database/lib/utils.ts`)

```typescript
// packages/database/src/lib/utils.ts
import { uuid, timestamp } from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';

export const generateUUID = () => uuidv7();

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

## 3. Concrete Repository Implementation (`infrastructures/repositories/user.repo.ts`)

```typescript
// packages/infrastructures/src/repositories/user.repo.ts
import type { Database } from '@<project>/database/db';
import { User } from '@<project>/domains/entities';
import { IUserRepository } from '@<project>/domains/repositories/user';
import { user } from '@<project>/database/schema';
import { Repository } from '@<project>/database/repository';
import { CreateUser, UpdateUser } from '@<project>/domains/schema/user';
import { eq } from 'drizzle-orm';

export default class UserRepository
  extends Repository<User, CreateUser, UpdateUser>
  implements IUserRepository
{
  constructor(db: Database) {
    super(db, user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(user.email, email));
    return (result as User) || null;
  }
}
```

---

## 4. Argon2 Password Hasher Adapter (`infrastructures/lib/password.ts`)

```typescript
// packages/infrastructures/src/lib/password.ts
import argon2 from 'argon2';

export const hash = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

export const verify = async ({
  password,
  hash,
}: {
  password: string;
  hash: string;
}): Promise<boolean> => {
  return await argon2.verify(hash, password);
};
```

---

## 5. Drizzle Table Schema (`database/schema/<module>.ts`)

Drizzle schemas use helpers from `#lib/utils` and reference other tables via `.references()`:

```typescript
// packages/database/src/schema/product.ts
import { pgTable, text, index, uuid, numeric } from 'drizzle-orm/pg-core';
import {
  primaryKeyUuid7,
  updatedAtTimestamp,
  createdAtTimestamp,
} from '../lib/utils';
import { company } from './company';

export const product = pgTable(
  'product',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
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
  ],
);
```

**Rules for Drizzle schemas:**
- Always use `primaryKeyUuid7('id')` — never `serial()` or manual `text().primaryKey()`
- Always use `createdAtTimestamp('created_at')` and `updatedAtTimestamp('updated_at')`
- Add `index(...)` for every foreign key column
- Export the table from `src/schema/index.ts`

---

## 6. Relations Definition (`database/relations.ts`)

All table relations are centralized in one `relations.ts` file using `defineRelationsPart`:

```typescript
// packages/database/src/relations.ts
import { defineRelationsPart } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelationsPart(schema, (r) => ({
  product: {
    company: r.one.company({ from: r.product.companyId, to: r.company.id }),
    category: r.one.category({ from: r.product.categoryId, to: r.category.id }),
  },
  company: {
    products: r.many.product(),
  },
  // ... add all relations here
}));
```

The `relations` object is spread into `drizzle()` in `db.ts`:
```typescript
const db = drizzle(url, { relations: { ...relations }, logger: true });
```
