# End-to-End Real World Feature Example (`Product` Module)

This complete walkthrough demonstrates how a new `Product` module is created across all Clean Architecture layers.

---

## 1. Domain Layer (`packages/domains`)

### `packages/domains/src/schema/product.ts`
```typescript
import { z } from 'zod';
import {
  BaseEntity,
  BooleanField,
  NumberField,
  StringField,
} from '#lib/entity';

export const productSchema = BaseEntity({
  name: StringField({ required: true, max: 200 }),
  sku: StringField({ required: true, max: 50 }),
  price: NumberField({ required: true }),
  stock: NumberField({ required: true, default: 0 }),
  isActive: BooleanField({ default: true }),
});

export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = productSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProductEntity = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
```

### `packages/domains/src/entities/product.ts`
```typescript
import type { ProductEntity } from '#schema/product';

export class Product implements ProductEntity {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ProductEntity) {
    this.id = data.id;
    this.name = data.name;
    this.sku = data.sku;
    this.price = data.price;
    this.stock = data.stock;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
```

### `packages/domains/src/repositories/product.repo.ts`
```typescript
import { BaseRepository } from '..';
import { Product } from '#entities/product';
import { CreateProduct, UpdateProduct } from '#schema/product';

export interface IProductRepository
  extends BaseRepository<Product, CreateProduct, UpdateProduct> {
  findBySku(sku: string): Promise<Product | null>;
}
```

### `packages/domains/src/applications/product.usecase.ts`
```typescript
import { BaseUseCase } from '..';
import { Product } from '#entities/product';
import { CreateProduct, UpdateProduct } from '#schema/product';

export type ICreateProductContext = { data: CreateProduct };
export type IUpdateProductContext = { id: string; data: UpdateProduct };
export type IDeleteProductContext = { id: string };
export type IGetProductContext = { id: string };
export type IGetProductsContext = { query?: Record<string, unknown> };

export type ICreateProductUseCase = BaseUseCase<ICreateProductContext, Product>;
export type IUpdateProductUseCase = BaseUseCase<IUpdateProductContext, Product>;
export type IDeleteProductUseCase = BaseUseCase<IDeleteProductContext, void>;
export type IGetProductUseCase = BaseUseCase<IGetProductContext, Product | null>;
export type IGetProductsUseCase = BaseUseCase<IGetProductsContext, Product[]>;
```

---

## 2. Database Layer (`packages/database`)

### `packages/database/src/schema/product.ts`
```typescript
import { pgTable, text, integer, boolean } from 'drizzle-orm/pg-core';
import {
  primaryKeyUuid7,
  createdAtTimestamp,
  updatedAtTimestamp,
} from '#lib/utils';

export const products = pgTable('products', {
  id: primaryKeyUuid7('id'),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: createdAtTimestamp('created_at'),
  updatedAt: updatedAtTimestamp('updated_at'),
});
```

---

## 3. Application Layer (`packages/applications`)

### `packages/applications/src/use-cases/products/product.usecase.ts`
```typescript
import {
  ICreateProductContext,
  ICreateProductUseCase,
  IGetProductContext,
  IGetProductUseCase,
  IGetProductsUseCase,
  IGetProductsContext,
} from '@<project>/domains/applications/product';
import { Product } from '@<project>/domains/entities';
import { IProductRepository } from '@<project>/domains/repositories/product';
import { createProductSchema } from '@<project>/domains/schema/product';
import { ValidationError, NotFoundError, DuplicateError } from '#lib/error';

export class CreateProductUseCase implements ICreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(context: ICreateProductContext): Promise<Product> {
    const parsed = await createProductSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid product payload: ' + parsed.error.message);
    }

    const existing = await this.productRepository.findBySku(parsed.data.sku);
    if (existing) {
      throw new DuplicateError(`Product with SKU "${parsed.data.sku}" already exists.`);
    }

    return this.productRepository.create(parsed.data);
  }
}

export class GetProductUseCase implements IGetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(context: IGetProductContext): Promise<Product | null> {
    const product = await this.productRepository.findById(context.id);
    if (!product) {
      throw new NotFoundError(`Product with ID "${context.id}" not found.`);
    }
    return product;
  }
}

export class GetProductsUseCase implements IGetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(_context: IGetProductsContext): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}
```

---

## 4. Infrastructure Layer (`packages/infrastructures`)

### `packages/infrastructures/src/repositories/product.repo.ts`
```typescript
import type { Database } from '@<project>/database/db';
import { Product } from '@<project>/domains/entities';
import { IProductRepository } from '@<project>/domains/repositories/product';
import { products } from '@<project>/database/schema';
import { Repository } from '@<project>/database/repository';
import { CreateProduct, UpdateProduct } from '@<project>/domains/schema/product';
import { eq } from 'drizzle-orm';

export default class ProductRepository
  extends Repository<Product, CreateProduct, UpdateProduct>
  implements IProductRepository
{
  constructor(db: Database) {
    super(db, products);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(products.sku, sku));
    return (result as Product) || null;
  }
}
```

---

## 5. Presentation Layer (`apps/web`)

### `apps/web/src/shared/repositories/index.ts`
```typescript
import db from '@<project>/database/db';
import ProductRepository from '@<project>/infrastructures/repositories/product';

export const productRepository = new ProductRepository(db as never);
```

### `apps/web/src/shared/applications/product.usecase.ts`
```typescript
import {
  CreateProductUseCase,
  GetProductUseCase,
  GetProductsUseCase,
} from '@<project>/applications/use-cases/products/product';
import { productRepository } from '@/shared/repositories';

export const createProductUseCase = new CreateProductUseCase(productRepository);
export const getProductUseCase = new GetProductUseCase(productRepository);
export const getProductsUseCase = new GetProductsUseCase(productRepository);
```

### `apps/web/src/api/controllers/product.controller.ts`
```typescript
import Controller from '@/shared/utils/controller';
import {
  createProductUseCase,
  getProductUseCase,
  getProductsUseCase,
} from '@/shared/applications/product.usecase';
import { createProductSchema } from '@<project>/domains/schema/product';
import { z } from 'zod';

class ProductController extends Controller {
  public create = this.validator({ body: createProductSchema }, async (c) => {
    const body = c.get('body');
    const result = await createProductUseCase.execute({ data: body });
    return this.created(c, 'Product created successfully', result);
  });

  public getById = this.validator(
    { params: z.object({ id: z.string().uuid() }) },
    async (c) => {
      const params = c.get('params');
      const result = await getProductUseCase.execute({ id: params.id });
      return this.success(c, 'Product retrieved successfully', result);
    },
  );

  public list = this.validator({}, async (c) => {
    const result = await getProductsUseCase.execute({});
    return this.success(c, 'Products retrieved successfully', result);
  });
}

export default new ProductController();
```

### `apps/web/src/api/routes/product.route.ts`
```typescript
import { Hono } from 'hono';
import productController from '@/api/controllers/product.controller';

const productRoutes = new Hono();

productRoutes.post('/', productController.create);
productRoutes.get('/', productController.list);
productRoutes.get('/:id', productController.getById);

export default productRoutes;
```

### `apps/web/src/api/index.ts`
```typescript
import { Hono } from 'hono';
import productRoutes from '@/api/routes/product.route';
import { onApiError } from '@/shared/utils/response';

const app = new Hono();

app.route('/products', productRoutes);
app.onError(onApiError);

export default app;
```
