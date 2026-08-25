---
name: domain-layer-pattern
description: Comprehensive guide for structuring the Domain layer in the Mini-Shop turborepo. Details patterns for Schemas, Entities, Repositories, and Use Case interfaces with code examples.
---

# Domain Layer Pattern

The `packages/domains` package contains the enterprise business rules and interfaces. It must **never** depend on `packages/applications`, `packages/database`, or any UI frameworks.

## 1. Schemas (`src/schema/`)
Schemas act as the single source of truth for validation and type inference. Use Zod and the provided `BaseEntity` utility.

**Pattern:**
- Define the core schema using `BaseEntity`.
- Create `Create...Schema` by omitting auto-generated fields (`id`, `createdAt`, `updatedAt`).
- Create `Update...Schema` by calling `.partial()` on the core schema and omitting auto-generated fields.
- Export both the Zod schemas and the inferred TypeScript types.

**Example (`schema/product.ts`):**
```typescript
import { z } from 'zod';
import { BaseEntity, StringField, NumberField } from '../lib/entity';

const productSchema = BaseEntity({
  name: StringField({ required: true }),
  price: NumberField({ required: true }),
});

const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const updateProductSchema = productSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

type ProductEntity = z.infer<typeof productSchema>;
type CreateProduct = z.infer<typeof createProductSchema>;
type UpdateProduct = z.infer<typeof updateProductSchema>;

export { productSchema, createProductSchema, updateProductSchema };
export type { ProductEntity, CreateProduct, UpdateProduct };
```

## 2. Entities (`src/entities/`)
Entities are concrete classes that implement the raw types inferred from the Zod schemas. They can house business logic methods in the future.

**Pattern:**
- Import the `...Entity` type from the schema.
- Define a class that implements this type.
- Assign all properties in the constructor.

**Example (`entities/product.ts`):**
```typescript
import type { ProductEntity } from '../schema/product';

export class Product implements ProductEntity {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ProductEntity) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
```

## 3. Repositories (`src/repositories/`)
Repositories define the data access contracts. They extend `BaseRepository` with 3 generic parameters: `Entity`, `CreatePayload`, `UpdatePayload`.

**Pattern:**
- Import `BaseRepository` from `..` (the root of domains).
- Define `I...Repository` extending it.
- Add any specialized query methods (e.g. `findByName`).

**Example (`repositories/product.repo.ts`):**
```typescript
import { BaseRepository } from '..';
import { Product } from '../entities/product';
import { CreateProduct, UpdateProduct } from '../schema/product';

export interface IProductRepository extends BaseRepository<Product, CreateProduct, UpdateProduct> {
  findByName(name: string): Promise<Product | null>;
}
```

## 4. Application Interfaces (`src/applications/`)
This defines the Use Case contracts and the specific `Context` types required to run them.

**Pattern:**
- Define `I...Context` for each CRUD operation.
- Define `I...UseCase` using `BaseUseCase<Context, Output>`.
- Export all of them.

**Example (`applications/product.usecase.ts`):**
```typescript
import { BaseUseCase } from '..';
import { Product } from '../entities/product';
import { CreateProduct, UpdateProduct } from '../schema/product';

type ICreateProductContext = { data: CreateProduct };
type IUpdateProductContext = { id: string; data: UpdateProduct };
type IDeleteProductContext = { id: string };
type IGetProductContext = { id: string };
type IGetProductsContext = { filter: Record<string, unknown> };

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
