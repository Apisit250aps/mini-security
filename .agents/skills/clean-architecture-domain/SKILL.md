---
name: clean-architecture-domain
description: Design and implement the Domain Layer (packages/domains) using Schema-First Zod patterns — BaseEntity, entity classes, repository interfaces, and use case context types.
tags:
  - both
  - backend
  - frontend
---

# Clean Architecture Domain Layer Skill

Use this skill when creating or modifying components inside **`packages/domains`** — the innermost package with zero internal dependencies.

---

## 🎯 Primary Responsibilities

The `packages/domains` package contains **4 types of files** — one set per domain module:

| File | What it defines |
|---|---|
| `src/schema/<module>.ts` | Zod schemas + TypeScript types via `z.infer` |
| `src/entities/<module>.ts` | Entity classes (data only, no business logic) |
| `src/repositories/<module>.repo.ts` | Repository interface contract |
| `src/applications/<module>.usecase.ts` | Use case context types + use case type aliases |

> ⚠️ **Important**: `packages/domains` does NOT use Value Objects, Domain Events, Aggregate Roots, or any OOP DDD patterns. It uses **Schema-First Zod** — types come from `z.infer<typeof schema>`.

---

## 🏗️ Pattern: Schema-First with Zod

### Step 1 — `src/schema/<module>.ts`

Define the full entity schema using `BaseEntity` from `#lib/entity`, then derive create/update variants:

```typescript
import { BaseEntity, StringField, EmailField, UUIDField, NumberField, BooleanField } from '#lib/entity';
import { z } from 'zod';

// 1. Full entity schema (includes id, createdAt, updatedAt)
const productSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  categoryId: UUIDField({ required: true }),
  name: StringField({ required: true }),
  sku: StringField({ required: true }),
  description: StringField({ required: false }),
  salePrice: NumberField({ required: true }),
  costPrice: NumberField({ required: true }),
});

// 2. Create variant — omit system fields
const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 3. Update variant — all fields optional
const updateProductSchema = productSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

// 4. Inferred TypeScript types
type ProductEntity = z.infer<typeof productSchema>;
type CreateProduct = z.infer<typeof createProductSchema>;
type UpdateProduct = z.infer<typeof updateProductSchema>;

export {
  productSchema,
  createProductSchema,
  updateProductSchema,
};
export type { ProductEntity, CreateProduct, UpdateProduct };
```

**Available field builders** (from `#lib/entity`):
- `StringField({ required })` — `z.string()` with `.min(1)` when required
- `EmailField({ required })` — `z.email()`
- `UUIDField({ required })` — `z.uuid()`
- `NumberField({ required })` — `z.number()`
- `BooleanField({ required })` — `z.boolean()`
- `DateField({ required })` — `z.date()`
- `BaseEntity(fields)` — wraps with `id` (UUIDv7 default), `createdAt`, `updatedAt`

---

### Step 2 — `src/entities/<module>.ts`

Entity class is a **plain data container** — just assigns constructor data to fields. No business methods:

```typescript
import type { ProductEntity } from '../schema/product';

class Product implements ProductEntity {
  id: string;
  companyId: string;
  categoryId: string;
  name: string;
  sku: string;
  description: string | undefined;
  salePrice: number;
  costPrice: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ProductEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.categoryId = data.categoryId;
    this.name = data.name;
    this.sku = data.sku;
    this.description = data.description;
    this.salePrice = data.salePrice;
    this.costPrice = data.costPrice;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export { Product };
```

> ✅ Entity class always `implements <Module>Entity` (the Zod-inferred type).
> ❌ Never add business methods like `.changePrice()` or `.activate()` to entities — that logic belongs in use cases.

---

### Step 3 — `src/repositories/<module>.repo.ts`

Repository interface extends `BaseRepository` and adds any domain-specific query methods:

```typescript
import { BaseRepository } from '..';
import { Product } from '../entities/product';
import { CreateProduct, UpdateProduct } from '../schema/product';

interface IProductRepository
  extends BaseRepository<Product, CreateProduct, UpdateProduct> {
  // Add custom query contracts here (e.g., findBySku, findByCompany)
  findBySku(sku: string): Promise<Product | null>;
}

export type { IProductRepository };
```

`BaseRepository<T, Create, Update>` already provides:
- `create(entity: Create): Promise<T>`
- `findById(id: string): Promise<T | null>`
- `findAll(): Promise<T[]>`
- `update(id: string, entity: Update): Promise<T>`
- `delete(id: string): Promise<void>`

---

### Step 4 — `src/applications/<module>.usecase.ts`

Define **context types** (input shapes) and **use case type aliases** (contracts) that implementations must satisfy:

```typescript
import { BaseUseCase } from '..';
import { Product } from '../entities/product';
import { CreateProduct, UpdateProduct } from '../schema/product';

// Context types (inputs for each use case)
type ICreateProductContext = { data: CreateProduct };
type IUpdateProductContext = { id: string; data: UpdateProduct };
type IDeleteProductContext = { id: string };
type IGetProductContext = { id: string };
type IGetProductsContext = { filter: Record<string, unknown> };

// Use case type aliases (contracts for implementations)
type ICreateProductUseCase = BaseUseCase<ICreateProductContext, Product>;
type IUpdateProductUseCase = BaseUseCase<IUpdateProductContext, Product>;
type IDeleteProductUseCase = BaseUseCase<IDeleteProductContext, void>;
type IGetProductUseCase = BaseUseCase<IGetProductContext, Product | null>;
type IGetProductsUseCase = BaseUseCase<IGetProductsContext, Product[]>;

export type {
  ICreateProductContext,
  IUpdateProductContext,
  IDeleteProductContext,
  IGetProductContext,
  IGetProductsContext,
  ICreateProductUseCase,
  IUpdateProductUseCase,
  IDeleteProductUseCase,
  IGetProductUseCase,
  IGetProductsUseCase,
};
```

> ✅ Context types live in `packages/domains` — not `packages/applications`.
> ✅ Use case implementations import these types from `@<project>/domains/applications/<module>`.

---

### Step 5 — Export in `src/entities/index.ts`

```typescript
export { User } from './user';
export { Company, Branch, Department } from './company';
export { Product } from './product';
// ... add new entity classes here
```

---

## 🚫 Domain Layer Guardrails

| Rule | Detail |
|---|---|
| ❌ No ORM imports | Never import `drizzle-orm`, `@prisma/client`, or any ORM |
| ❌ No web/HTTP imports | Never import `express`, `hono`, `next`, or HTTP types |
| ❌ No cross-package imports | `@<project>/database`, `@<project>/applications`, `@<project>/infrastructures` are forbidden |
| ❌ No business logic on Entity | Entity classes are data containers only |
| ❌ No `any` types | Use explicit `z.infer` types everywhere |
| ✅ Only Zod and UUID | The only external deps allowed are `zod` and `uuid` (for `uuidv7`) |

---

## 📚 Further Reference

See [domain-patterns.md](references/domain-patterns.md) for the full `BaseEntity` builder source and additional field examples.
