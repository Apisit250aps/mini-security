---
name: clean-architecture-application
description: Implement Application Layer use cases in packages/applications — use case classes that implement contracts from packages/domains, with safeParseAsync validation and typed error handling.
tags:
  - backend
---

# Clean Architecture Application Layer Skill

Use this skill when implementing use cases in **`packages/applications`**.

---

## 🎯 Primary Responsibilities

`packages/applications` contains the **concrete implementations** of use case contracts that were defined in `packages/domains/src/applications/*.usecase.ts`:

1. **Implement use case classes** — `class CreateXxxUseCase implements ICreateXxxUseCase`
2. **Validate input** — always `safeParseAsync` (never `parse`)
3. **Throw typed errors** — from `src/lib/error.ts`
4. **Inject repository via constructor** — no DI container, just constructor injection

> ❌ DTOs, mappers, and port interfaces (IEmailService, ITokenService) are avoided in favor of Schema-First Zod.
> ✅ Types come directly from Zod-inferred schema types in `@<project>/domains`.

---

## 🔗 Import Paths

Use case implementations import from:

```typescript
import { ICreateXxxUseCase, ICreateXxxContext } from '@<project>/domains/applications/<module>';
import { Xxx } from '@<project>/domains/entities';
import { IXxxRepository } from '@<project>/domains/repositories/<module>';
import { createXxxSchema, updateXxxSchema } from '@<project>/domains/schema/<module>';
import { ValidationError, NotFoundError, DuplicateError } from '../../lib/error';
```

---

## 🏗️ Use Case Implementation Pattern

### File: `src/use-cases/<module>/<module>.usecase.ts`

```typescript
import {
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
} from '@<project>/domains/applications/product';
import { Product } from '@<project>/domains/entities';
import { IProductRepository } from '@<project>/domains/repositories/product';
import { createProductSchema, updateProductSchema } from '@<project>/domains/schema/product';
import {
  ValidationError,
  NotFoundError,
  DuplicateError,
} from '../../lib/error';

export class CreateProductUseCase implements ICreateProductUseCase {
  constructor(private readonly repo: IProductRepository) {}

  async execute(context: ICreateProductContext): Promise<Product> {
    // 1. Validate with safeParseAsync (never .parse())
    const parsed = await createProductSchema.safeParseAsync(context.data);
    if (!parsed.success) throw new ValidationError('Invalid product data');

    // 2. Check business rule (if applicable)
    const existing = await this.repo.findBySku(parsed.data.sku);
    if (existing) throw new DuplicateError('Product with this SKU already exists');

    // 3. Persist and return
    return this.repo.create(parsed.data);
  }
}

export class UpdateProductUseCase implements IUpdateProductUseCase {
  constructor(private readonly repo: IProductRepository) {}

  async execute(context: IUpdateProductContext): Promise<Product> {
    const existing = await this.repo.findById(context.id);
    if (!existing) throw new NotFoundError('Product not found');

    const parsed = await updateProductSchema.safeParseAsync(context.data);
    if (!parsed.success) throw new ValidationError('Invalid update product data');

    return this.repo.update(context.id, parsed.data);
  }
}

export class DeleteProductUseCase implements IDeleteProductUseCase {
  constructor(private readonly repo: IProductRepository) {}

  async execute(context: IDeleteProductContext): Promise<void> {
    const existing = await this.repo.findById(context.id);
    if (!existing) throw new NotFoundError('Product not found');
    await this.repo.delete(context.id);
  }
}

export class GetProductUseCase implements IGetProductUseCase {
  constructor(private readonly repo: IProductRepository) {}

  async execute(context: IGetProductContext): Promise<Product | null> {
    const product = await this.repo.findById(context.id);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  }
}

export class GetProductsUseCase implements IGetProductsUseCase {
  constructor(private readonly repo: IProductRepository) {}

  async execute(_?: IGetProductsContext): Promise<Product[]> {
    return this.repo.findAll();
  }
}
```

---

## 🚨 Error Classes (`src/lib/error.ts`)

All errors extend `AppError`. Use typed subclasses to communicate intent:

| Class | HTTP status | When to use |
|---|---|---|
| `ValidationError` | 422 | Input fails Zod `safeParseAsync` |
| `NotFoundError` | 404 | Entity doesn't exist by ID/lookup |
| `DuplicateError` | 409 | Unique constraint violation |
| `UnauthorizedError` | 401 | Missing or invalid auth |
| `ForbiddenError` | 403 | Insufficient permissions |
| `InternalError` | 500 | Unexpected server error |

```typescript
// Throw pattern
throw new NotFoundError('Product not found');
throw new ValidationError('Invalid product data');
throw new DuplicateError('Product SKU already exists');
```

Do NOT use:
```typescript
throw new Error('something went wrong');   // ❌ — use typed subclass
res.status(404).json({ ... });             // ❌ — use cases never touch HTTP
```

---

## 🏗️ Use Case Orchestration Flow

```text
execute(context)
    │
    ├── 1. safeParseAsync(context.data) → throw ValidationError if fail
    │
    ├── 2. (Optional) Check existence → throw NotFoundError
    │
    ├── 3. (Optional) Check uniqueness → throw DuplicateError
    │
    ├── 4. Call repository method (create / update / delete / findById / findAll)
    │
    └── 5. Return result (Entity or void)
```

---

## 🚫 Application Layer Guardrails

| Rule | Detail |
|---|---|
| ❌ No infrastructure imports | Never import from `@<project>/database` or `@<project>/infrastructures` |
| ❌ No HTTP/web specifics | No `Request`, `Response`, status codes, headers |
| ❌ No `parse()` | Always use `safeParseAsync` for validation |
| ❌ No direct `new Repository()` | Use constructor injection with interface type |
| ✅ Only import from `@<project>/domains` | Interfaces, schemas, and entity types |
| ✅ Constructor injection only | No DI container — wire in composition root (`apps/web`) |

---

## 📚 Further Reference

See [usecase-patterns.md](references/usecase-patterns.md) for the full `error.ts` source and additional use case examples.
