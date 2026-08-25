---
name: application-layer-pattern
description: Comprehensive guide for structuring the Applications layer in the Mini-Shop turborepo. Details patterns for implementing Use Cases, dependency injection, and data validation with Zod.
---

# Application Layer Pattern

The `packages/applications` package contains the concrete implementation of the application's business rules (Use Cases). It acts as the orchestrator between external inputs and the Domain layer.

## 1. File & Folder Organization (`src/use-cases/`)

Use Cases are grouped by Module/Domain into subfolders. Within a module folder, Use Cases are separated into specific files per **Entity** (not bundled together).

**Structure:**
```text
packages/applications/src/use-cases/
├── product/                 # Module Folder
│   ├── product.usecase.ts   # Use Cases for 'Product'
│   ├── category.usecase.ts  # Use Cases for 'Category'
│   └── index.ts             # Exports everything from this folder
└── index.ts                 # Main export for all modules
```

## 2. Implementing Use Cases

A single file (e.g., `product.usecase.ts`) will contain all the standard CRUD use cases for that entity. 

**Critical Rules:**
1. **Dependency Injection:** Repositories must be injected via the constructor (`private readonly repo: I...Repository`).
2. **Validation:** Always use the Zod schema's `safeParseAsync` to validate incoming `context.data` for Create/Update operations.
3. **Error Handling:** 
   - Throw `ValidationError` from `../lib/error` if Zod parsing fails.
   - Throw `NotFoundError` from `../lib/error` if an entity doesn't exist during Read, Update, or Delete operations.
   - Throw `DuplicateError` if unique constraints are violated (e.g., duplicate email/name checks).

**Example (`use-cases/product/product.usecase.ts`):**
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
} from '@shop/domains/applications/product';
import { Product } from '@shop/domains/entities';
import { IProductRepository } from '@shop/domains/repositories/product';
import { createProductSchema, updateProductSchema } from '@shop/domains/schema/product';
import { ValidationError, NotFoundError, DuplicateError } from '../../lib/error'; // Note the relative path level

export class CreateProductUseCase implements ICreateProductUseCase {
  constructor(private readonly repo: IProductRepository) {}
  
  async execute(context: ICreateProductContext): Promise<Product> {
    // 1. Validation
    const parsed = await createProductSchema.safeParseAsync(context.data);
    if (!parsed.success) throw new ValidationError('Invalid Product data');
    
    // 2. Business Logic / Unique Checks
    const existing = await this.repo.findByName(parsed.data.name);
    if (existing) throw new DuplicateError('Product name already exists');
    
    // 3. Execution
    return this.repo.create(parsed.data);
  }
}

export class UpdateProductUseCase implements IUpdateProductUseCase {
  constructor(private readonly repo: IProductRepository) {}
  
  async execute(context: IUpdateProductContext): Promise<Product> {
    // 1. Check existence
    const existing = await this.repo.findById(context.id);
    if (!existing) throw new NotFoundError('Product not found');
    
    // 2. Validation
    const parsed = await updateProductSchema.safeParseAsync(context.data);
    if (!parsed.success) throw new ValidationError('Invalid update Product data');
    
    // 3. Execution
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
    const existing = await this.repo.findById(context.id);
    if (!existing) throw new NotFoundError('Product not found');
    return existing;
  }
}

export class GetProductsUseCase implements IGetProductsUseCase {
  constructor(private readonly repo: IProductRepository) {}
  
  async execute(context: IGetProductsContext): Promise<Product[]> {
    // You can pass context.filter into the repository if implemented
    return this.repo.findAll();
  }
}
```

## 3. Index Exports
Every module folder must have an `index.ts` that exports its contents. The root `src/use-cases/index.ts` must export all module folders.

**Module Index (`use-cases/product/index.ts`):**
```typescript
export * from './product.usecase';
export * from './category.usecase';
```

**Root Index (`use-cases/index.ts`):**
```typescript
export * from './product';
export * from './users';
// ... other modules
```
