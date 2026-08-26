---
name: clean-architecture-infrastructure
description: Implement Infrastructure Layer concrete repositories in packages/infrastructures — extend the generic database/Repository<T, C, U> base class with super(db, table) and implement domain interface contracts.
tags:
  - backend
---

# Clean Architecture Infrastructure Layer Skill

Use this skill when implementing concrete repositories or infrastructure adapters in **`packages/infrastructures`**.

---

## 🎯 Primary Responsibilities

1. **Extend `Repository<T, C, U>`** from `@<project>/database/repository` — inherits all CRUD operations via Drizzle.
2. **Implement domain interface** — `implements I<Module>Repository` from `@<project>/domains`.
3. **Add custom queries** — using Drizzle's `eq`, `and`, `or` operators on `this.db` and `this.table`.
4. **Wire up in constructor** — call `super(db, table)` passing the Drizzle table.

> ❌ No "Mapper" pattern. Drizzle's `.returning()` returns rows that are cast directly to entity types.
> ❌ No configuration loading — `db` is always injected from outside via constructor.

---

## 🏗️ Concrete Repository Pattern

### File: `src/repositories/<module>.repo.ts`

```typescript
import type { Database } from '@<project>/database/db';
import { Product } from '@<project>/domains/entities';
import { IProductRepository } from '@<project>/domains/repositories/product';
import { CreateProduct, UpdateProduct } from '@<project>/domains/schema/product';
import { product } from '@<project>/database/schema';       // Drizzle table
import { Repository } from '@<project>/database/repository'; // Generic base
import { eq } from 'drizzle-orm';

export default class ProductRepository
  extends Repository<Product, CreateProduct, UpdateProduct>
  implements IProductRepository
{
  constructor(db: Database) {
    super(db, product);  // ← always pass (db, drizzleTable)
  }

  // Custom query — use this.db and this.table
  async findBySku(sku: string): Promise<Product | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(product.sku, sku));
    return (result as Product) || null;
  }
}
```

### What `Repository<T, C, U>` already provides (from `@<project>/database/repository`):

| Method | Signature |
|---|---|
| `create` | `(entity: C): Promise<T>` |
| `findById` | `(id: string): Promise<T \| null>` |
| `findAll` | `(): Promise<T[]>` |
| `update` | `(id: string, entity: U): Promise<T>` |
| `delete` | `(id: string): Promise<void>` |

All inherited methods use `this.db` and `this.table` internally — no need to re-implement.

---

## 🔗 Import Paths

```typescript
import type { Database } from '@<project>/database/db';        // DB type
import { <table> } from '@<project>/database/schema';          // Drizzle table
import { Repository } from '@<project>/database/repository';   // Base class
import { <Entity> } from '@<project>/domains/entities';        // Entity class
import { I<Module>Repository } from '@<project>/domains/repositories/<module>';  // Interface
import { Create<Module>, Update<Module> } from '@<project>/domains/schema/<module>';  // Types
import { eq, and, or } from 'drizzle-orm';                // Query operators
```

---

## 🏗️ Common Custom Query Patterns

### Filter by foreign key:
```typescript
async findByCompany(companyId: string): Promise<Product[]> {
  const results = await this.db
    .select()
    .from(this.table)
    .where(eq(product.companyId, companyId));
  return results as Product[];
}
```

### Filter with multiple conditions:
```typescript
async findByCompanyAndCategory(
  companyId: string,
  categoryId: string,
): Promise<Product[]> {
  const results = await this.db
    .select()
    .from(this.table)
    .where(and(
      eq(product.companyId, companyId),
      eq(product.categoryId, categoryId),
    ));
  return results as Product[];
}
```

### Find one by unique field:
```typescript
async findByEmail(email: string): Promise<User | null> {
  const [result] = await this.db
    .select()
    .from(this.table)
    .where(eq(user.email, email));
  return (result as User) || null;
}
```

---

## 🏗️ Infrastructure Helpers (`src/lib/`)

### Password hashing (`src/lib/password.ts`):
```typescript
import argon2 from 'argon2';

async function hash(password: string): Promise<string> {
  return argon2.hash(password);
}

async function verify({
  password,
  hash,
}: {
  password: string;
  hash: string;
}): Promise<boolean> {
  return argon2.verify(hash, password);
}

export { hash, verify };
```

> ✅ Always use **Argon2** (not bcrypt, not SHA).

---

## 🏗️ Export Pattern (`src/repositories/index.ts`)

```typescript
export { default as UserRepository } from './user.repo';
export { default as ProductRepository } from './product.repo';
export { default as CompanyRepository } from './company.repo';
// add new repositories here
```

---

## 🚫 Infrastructure Layer Guardrails

| Rule | Detail |
|---|---|
| ❌ Never implement CRUD methods already in base | `create`, `findById`, `findAll`, `update`, `delete` — all inherited |
| ❌ Never import from `@<project>/applications` | Infra depends only on `domains` and `database` |
| ❌ Never access `process.env` in repos | DB connection comes from injected `db: Database` |
| ❌ Never leak Drizzle types into Domain | Cast results to entity type: `result as Product` |
| ❌ No `@ts-ignore` or `eslint-disable` | Fix root cause instead |
| ✅ `super(db, table)` always | Never access DB without going through base class infrastructure |

---

## 📚 Further Reference

See [infrastructure-patterns.md](references/infrastructure-patterns.md) for the full `Repository` base class source and additional repository examples.
