# TypeSpec & OpenAPI Client Patterns & Reference Code 📐

This reference provides complete, copy-paste ready templates for TypeSpec API definitions and TypeScript Client SDK generation using `@hey-api/openapi-ts` and `@tanstack/react-query`.

---

## 1. TypeSpec Compiler Config (`packages/client/tspconfig.yaml`)

```yaml
emit:
  - '@typespec/openapi3'
options:
  '@typespec/openapi3':
    emitter-output-dir: '{cwd}/schema'
    openapi-versions:
      - 3.1.0
```

---

## 2. Hey-API OpenAPI TypeScript Client Config (`packages/client/openapi-ts.config.ts`)

```typescript
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './schema/openapi.yaml',
  output: './src/api',
  plugins: [
    '@hey-api/client-axios',
    '@hey-api/typescript',
    '@hey-api/sdk',
    '@tanstack/react-query',
    {
      dates: true,
      name: '@hey-api/transformers',
    },
  ],
});
```

---

## 3. Package Definition (`packages/client/package.json`)

```json
{
  "name": "@<project>/client",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "generate:spec": "tsp compile ./spec/main.tsp",
    "generate:client": "openapi-ts",
    "generate": "npm run generate:spec && npm run generate:client"
  },
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@hey-api/client-axios": "^0.9.1",
    "@typespec/compiler": "^1.12.0",
    "@typespec/http": "^1.12.0",
    "@typespec/openapi": "^1.12.0",
    "@typespec/openapi3": "^1.12.0",
    "@typespec/rest": "^0.82.0"
  },
  "devDependencies": {
    "@hey-api/openapi-ts": "^0.98.1",
    "@tanstack/react-query": "^5.0.0",
    "@<project>/typescript-config": "*"
  }
}
```

---

## 4. Root Entry Point (`packages/client/spec/main.tsp`)

```typespec
import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./models/common.tsp";
import "./models/entities.tsp";

import "./models/user.tsp";
import "./models/company.tsp";
import "./models/product.tsp";

import "./services/user.tsp";
import "./services/company.tsp";
import "./services/product.tsp";

@service(#{ title: "<Project Name> API Service" })
namespace <ProjectName>;
```

---

## 5. Standard Common Responses (`packages/client/spec/models/common.tsp`)

```typespec
using TypeSpec.Http;
using TypeSpec.Rest;

namespace <ProjectName>;

@doc("Successful response wrapping data payload")
model ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@doc("Error response returned on failures")
model ApiErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

@doc("Successful response without data payload")
model BasicResponse {
  success: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// Typed HTTP responses with Status Codes
// ---------------------------------------------------------------------------

@doc("200 OK with data")
model ApiOkResponse<T> {
  @statusCode _: 200;
  @body body: ApiResponse<T>;
}

@doc("200 OK without data")
model ApiOkBasicResponse {
  @statusCode _: 200;
  @body body: BasicResponse;
}

@doc("201 Created with data")
model ApiCreatedResponse<T> {
  @statusCode _: 201;
  @body body: ApiResponse<T>;
}

@doc("400 Bad Request — INVALID_DATA")
model ApiBadRequestResponse {
  @statusCode _: 400;
  @body body: ApiErrorResponse;
}

@doc("401 Unauthorized — UNAUTHORIZED")
model ApiUnauthorizedResponse {
  @statusCode _: 401;
  @body body: ApiErrorResponse;
}

@doc("403 Forbidden — FORBIDDEN")
model ApiForbiddenResponse {
  @statusCode _: 403;
  @body body: ApiErrorResponse;
}

@doc("404 Not Found — NOT_FOUND")
model ApiNotFoundResponse {
  @statusCode _: 404;
  @body body: ApiErrorResponse;
}

@doc("500 Internal Server Error — INTERNAL_ERROR")
model ApiInternalErrorResponse {
  @statusCode _: 500;
  @body body: ApiErrorResponse;
}
```

---

## 6. Module Models & Request DTOs

### User (`packages/client/spec/models/user.tsp`):
```typespec
model User is Domain.Entity.User;

model CreateUser
  is OmitProperties<
    User,
    "id" | "isActive" | "lastLogin" | "createdAt" | "updatedAt"
  >;

model UpdateUser
  is OptionalProperties<OmitProperties<User, "id" | "createdAt" | "updatedAt">>;
```

### Product Module (`packages/client/spec/models/product.tsp`):
```typespec
model Category is Domain.Entity.Category;
model CreateCategory is OmitProperties<Category, "id" | "createdAt" | "updatedAt">;
model UpdateCategory is OptionalProperties<OmitProperties<Category, "id" | "createdAt" | "updatedAt">>;

model Brand is Domain.Entity.Brand;
model CreateBrand is OmitProperties<Brand, "id" | "createdAt" | "updatedAt">;
model UpdateBrand is OptionalProperties<OmitProperties<Brand, "id" | "createdAt" | "updatedAt">>;

model Unit is Domain.Entity.Unit;
model CreateUnit is OmitProperties<Unit, "id" | "createdAt" | "updatedAt">;
model UpdateUnit is OptionalProperties<OmitProperties<Unit, "id" | "createdAt" | "updatedAt">>;

model Product is Domain.Entity.Product;
model CreateProduct is OmitProperties<Product, "id" | "createdAt" | "updatedAt">;
model UpdateProduct is OptionalProperties<OmitProperties<Product, "id" | "createdAt" | "updatedAt">>;
```

---

## 7. Module HTTP Service Interfaces

### User Service (`packages/client/spec/services/user.tsp`):
```typespec
import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace <ProjectName>;

@route("/user")
@tag("User")
interface UserServices {
  @get
  @route("/")
  @summary("Get all users")
  getUsers(): ApiOkResponse<User[]>;

  @get
  @route("/{id}")
  @summary("Get user by ID")
  getUser(@path id: string): ApiOkResponse<User> | ApiNotFoundResponse;

  @put
  @route("/{id}")
  @summary("Update user")
  updateUser(@path id: string, @body body: UpdateUser):
    | ApiOkResponse<User>
    | ApiNotFoundResponse
    | ApiBadRequestResponse;

  @delete
  @route("/{id}")
  @summary("Delete user")
  deleteUser(@path id: string): ApiOkBasicResponse | ApiNotFoundResponse;
}
```

### Product Service (`packages/client/spec/services/product.tsp`):
```typespec
import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace <ProjectName>;

@route("/products")
@tag("Product")
interface ProductServices {
  @get
  @route("/")
  @summary("Get all products")
  getProducts(): ApiOkResponse<Product[]>;

  @get
  @route("/{id}")
  @summary("Get product by ID")
  getProduct(@path id: string): ApiOkResponse<Product> | ApiNotFoundResponse;

  @post
  @route("/")
  @summary("Create product")
  createProduct(@body body: CreateProduct):
    | ApiCreatedResponse<Product>
    | ApiBadRequestResponse;

  @put
  @route("/{id}")
  @summary("Update product")
  updateProduct(@path id: string, @body body: UpdateProduct):
    | ApiOkResponse<Product>
    | ApiNotFoundResponse
    | ApiBadRequestResponse;

  @delete
  @route("/{id}")
  @summary("Delete product")
  deleteProduct(@path id: string): ApiOkBasicResponse | ApiNotFoundResponse;
}
```

---

## 8. Export Entry Point (`packages/client/src/index.ts`)

```typescript
export * from './api';
```

---

## 9. Usage in React with TanStack Query (`apps/web`)

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductsOptions,
  createProductMutation,
  type Product,
} from '@<project>/client';

export function ProductsPage() {
  const queryClient = useQueryClient();

  // Query hook generated by Hey-API + TanStack Query plugin
  const { data, isLoading } = useQuery(getProductsOptions());

  // Mutation hook
  const createProduct = useMutation({
    ...createProductMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries(getProductsOptions());
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {data?.data?.map((p: Product) => (
          <li key={p.id}>{p.name} - ${p.salePrice}</li>
        ))}
      </ul>
    </div>
  );
}
```
