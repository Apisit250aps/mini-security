---
name: clean-architecture-typespec
description: Design, write, and scaffold TypeSpec (.tsp) API contracts in packages/client — domain entity aliasing, OmitProperties/OptionalProperties DTO patterns, HTTP service interfaces, and OpenAPI Client SDK generation.
tags:
  - both
  - fullstack
  - backend
  - frontend
---

# TypeSpec API Specification & Client SDK Skill 📐

Use this skill when scaffolding `packages/client`, defining API contracts with **TypeSpec (`.tsp`)**, or generating TypeScript Client SDKs and React Query hooks.

---

## 🎯 Architecture Overview (`packages/client`)

`packages/client` is the single source of truth for the API contract between backend and frontend:

```text
[packages/domains] (TypeScript Entities)
       │  (ts-morph generate.ts)
       ▼
[packages/client/spec/models/entities.tsp] (Generated TypeSpec Models)
       │
       ▼
[packages/client/spec/models/*.tsp] (Model Aliasing & OmitProperties/OptionalProperties DTOs)
[packages/client/spec/services/*.tsp] (HTTP Service Interfaces with @route, @get, @body)
       │  (tsp compile ./spec/main.tsp)
       ▼
[packages/client/schema/openapi.yaml] (OpenAPI 3.1.0 Specification)
       │  (openapi-ts)
       ▼
[packages/client/src/api/] (Generated Axios Client SDK + TanStack React Query Hooks)
       │
       ▼
[apps/web] (Import API SDK from @<project>/client)
```

---

## 📁 Standard Directory Layout

```text
packages/client/
├── package.json
├── tsconfig.json
├── tspconfig.yaml             # TypeSpec compiler config (emits OpenAPI 3.1.0 to schema/)
├── openapi-ts.config.ts       # Hey-API compiler config (emits SDK to src/api/)
├── schema/
│   └── openapi.yaml           # Generated OpenAPI specification
├── spec/
│   ├── main.tsp               # Root entry point importing all models and services
│   ├── models/
│   │   ├── common.tsp         # Standard ApiResponse<T>, status codes, error models
│   │   ├── entities.tsp       # Auto-generated from packages/domains via ts-morph
│   │   ├── user.tsp           # Domain model aliases & Create/Update DTOs
│   │   └── product.tsp        # Product model aliases & Create/Update DTOs
│   └── services/
│       ├── user.tsp           # User HTTP service interface (@route, @get, @post, etc.)
│       └── product.tsp        # Product HTTP service interface
└── src/
    ├── index.ts               # export * from './api';
    └── api/                   # Auto-generated TypeScript client SDK & React Query hooks
```

---

## ⚙️ Package Configuration

### 1. `packages/client/package.json`

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

### 2. `packages/client/tspconfig.yaml`

```yaml
emit:
  - '@typespec/openapi3'
options:
  '@typespec/openapi3':
    emitter-output-dir: '{cwd}/schema'
    openapi-versions:
      - 3.1.0
```

### 3. `packages/client/openapi-ts.config.ts`

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

## ✍️ TypeSpec Writing Patterns & Rules

### 1. Model Aliasing Pattern (Never use `Domain.Entity` directly)

Entities generated from `packages/domains` live inside `namespace Domain.Entity;` in `models/entities.tsp`.

❌ **WRONG**: Using `Domain.Entity.Product` directly across service endpoints.
✅ **CORRECT**: Create a module model file (`spec/models/product.tsp`) and alias the entity:

```typespec
// spec/models/product.tsp
model Product is Domain.Entity.Product;
```

---

### 2. Request DTO Pattern (Transformations with Omit/Pick/Optional)

Never re-declare field lists manually for Create or Update requests. Always derive them using TypeSpec property operators:

```typespec
// spec/models/product.tsp
model Product is Domain.Entity.Product;

// 1. Create DTO: Omit system-generated fields (id, timestamps)
model CreateProduct
  is OmitProperties<
    Product,
    "id" | "createdAt" | "updatedAt"
  >;

// 2. Update DTO: Omit system fields AND make all remaining fields optional
model UpdateProduct
  is OptionalProperties<
    OmitProperties<Product, "id" | "createdAt" | "updatedAt">
  >;

// 3. Partial View / Custom Lookup DTO: Pick specific properties
model ProductSummary
  is PickProperties<
    Product,
    "id" | "name" | "sku" | "salePrice"
  >;
```

#### Multi-model Example (`spec/models/product.tsp`):
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

### 3. Common Response Wrapper Patterns (`spec/models/common.tsp`)

Standard models matching backend `ApiResponse<T>` and HTTP status code models:

```typespec
// spec/models/common.tsp
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

// HTTP Status Code Models
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

@doc("400 Bad Request")
model ApiBadRequestResponse {
  @statusCode _: 400;
  @body body: ApiErrorResponse;
}

@doc("401 Unauthorized")
model ApiUnauthorizedResponse {
  @statusCode _: 401;
  @body body: ApiErrorResponse;
}

@doc("403 Forbidden")
model ApiForbiddenResponse {
  @statusCode _: 403;
  @body body: ApiErrorResponse;
}

@doc("404 Not Found")
model ApiNotFoundResponse {
  @statusCode _: 404;
  @body body: ApiErrorResponse;
}

@doc("500 Internal Server Error")
model ApiInternalErrorResponse {
  @statusCode _: 500;
  @body body: ApiErrorResponse;
}
```

---

### 4. HTTP Service Interface Pattern (`spec/services/<module>.tsp`)

Define service contracts with route decorators, parameters, and explicit response unions:

```typespec
// spec/services/product.tsp
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
  @summary("Create new product")
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

### 5. Root Entry Point (`spec/main.tsp`)

Imports all dependencies, common models, generated models, module models, and service interfaces:

```typespec
import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./models/common.tsp";
import "./models/entities.tsp";

// Module Models
import "./models/user.tsp";
import "./models/product.tsp";

// Module Services
import "./services/user.tsp";
import "./services/product.tsp";

@service(#{ title: "<Project Name> API Service" })
namespace <ProjectName>;
```

---

## 🔄 End-to-End Generation Workflow

Whenever a domain model or API contract changes:

1. **Step 1 — Sync Entities from Domain**:
   ```bash
   cd packages/domains && npm run generate
   # Updates packages/client/spec/models/entities.tsp
   ```

2. **Step 2 — Define/Update TypeSpec Models & Services**:
   - Update `packages/client/spec/models/<module>.tsp`
   - Update `packages/client/spec/services/<module>.tsp`
   - Ensure imports are registered in `packages/client/spec/main.tsp`

3. **Step 3 — Compile Spec & Generate Client SDK**:
   ```bash
   cd packages/client && npm run generate
   # 1. Runs `tsp compile ./spec/main.tsp` -> emits schema/openapi.yaml
   # 2. Runs `openapi-ts` -> emits TypeScript SDK + React Query hooks in src/api/
   ```

4. **Step 4 — Use in Frontend (`apps/web`)**:
   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { getProductsOptions } from '@<project>/client';

   export function ProductList() {
     const { data, isLoading } = useQuery(getProductsOptions());
     // Fully type-safe!
   }
   ```

---

## 📚 Further Reference

- [typespec-patterns.md](references/typespec-patterns.md): Complete copy-paste ready reference files (`common.tsp`, service templates, `tspconfig.yaml`, `openapi-ts.config.ts`).
