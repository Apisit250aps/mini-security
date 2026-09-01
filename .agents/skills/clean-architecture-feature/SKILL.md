---
name: clean-architecture-feature
description: End-to-end orchestrator skill that creates complete features/modules across ALL Clean Architecture layers (Domain -> Database -> Application -> Infrastructure -> Presentation -> Verification).
tags:
  - both
  - fullstack
  - backend
  - frontend
---

# Clean Architecture End-to-End Feature Orchestrator Skill 🚀

Use this skill when adding a new **Feature**, **Module**, or **Business Entity** to the codebase. It orchestrates all layers in strict inward-to-outward order to deliver a fully functional, type-safe, and tested feature.

---

## 🎯 When to Use This Skill

Activate this skill when requested to:
- *"Add a new module/feature (e.g., product, order, invoice, category, inventory)"*
- *"Implement complete CRUD or business workflow for a new domain"*
- *"Build an end-to-end endpoint with Clean Architecture layers"*

---

## 🔄 The 7-Step Orchestration Pipeline

Whenever generating a new feature, you **MUST** execute these 7 steps in sequential order:

```text
[Step 1: Domain] ──▶ [Step 2: Database] ──▶ [Step 3: Application]
                                                        │
                                                        ▼
[Step 7: Verify] ◀── [Step 6: TypeSpec] ◀── [Step 5: Presentation] ◀── [Step 4: Infrastructure]
```

---

### 1️⃣ Step 1: Domain Layer (`packages/domains` or `src/domain`)
1. **Zod Schema (`src/schema/<module>.ts`)**:
   - Use `BaseEntity` from `#lib/entity` (generates `id` with UUIDv7, `createdAt`, `updatedAt`).
   - Define field rules with `StringField`, `NumberField`, `BooleanField`, `DateField`, `EmailField`.
   - Export `<Module>Entity`, `Create<Module>`, `Update<Module>` via `z.infer`.
2. **Entity Class (`src/entities/<module>.ts`)**:
   - Implement `class <Module> implements <Module>Entity`.
3. **Repository Interface (`src/repositories/<module>.repo.ts`)**:
   - Extend `BaseRepository<<Module>, Create<Module>, Update<Module>>`.
   - Declare any domain-specific query contracts (e.g. `findByCode`, `findBySlug`).
4. **Use Case Interfaces & Contexts (`src/applications/<module>.usecase.ts`)**:
   - Define `ICreate<Module>Context = { data: Create<Module> }`.
   - Define `IUpdate<Module>Context = { id: string; data: Update<Module> }`.
   - Define Use Case contracts using `BaseUseCase<Context, Output>`.
5. **Exports**: Export all items in `index.ts`.

---

### 2️⃣ Step 2: Database Layer (`packages/database` or `src/infrastructure/database`)
1. **Drizzle Table Schema (`src/schema/<module>.ts`)**:
   - Use `primaryKeyUuid7('id')`, `createdAtTimestamp('created_at')`, `updatedAtTimestamp('updated_at')`.
   - Match fields and types defined in Domain Schema.
   - Define relations if applicable.
2. **Export Table**: Export the table in `src/schema/index.ts`.

---

### 3️⃣ Step 3: Application Layer (`packages/applications` or `src/application`)
1. **Implement Use Cases (`src/use-cases/<module>/<module>.usecase.ts`)**:
   - Create use case classes implementing domain contracts (e.g., `Create<Module>UseCase implements ICreate<Module>UseCase`).
   - Inject repository via constructor (`private readonly repository: I<Module>Repository`).
   - Validate payload with `schema.safeParseAsync(context.data)`.
   - Throw typed errors (`ValidationError`, `NotFoundError`, `DuplicateError`) from `lib/error`.
2. **Exports**: Export all use case classes in `src/use-cases/index.ts`.

---

### 4️⃣ Step 4: Infrastructure Layer (`packages/infrastructures` or `src/infrastructure`)
1. **Concrete Repository (`src/repositories/<module>.repo.ts`)**:
   - Extend generic `Repository<<Module>, Create<Module>, Update<Module>>` with table passed to `super(db, table)`.
   - Implement `I<Module>Repository`.
   - Implement any custom queries using Drizzle `eq`, `and`, etc.
2. **Exports**: Export repository in `src/repositories/index.ts`.

---

### 5️⃣ Step 5: Presentation Layer (`apps/web`)

> 📖 **See [`clean-architecture-frontend`](../clean-architecture-frontend/SKILL.md) for the complete presentation layer guide.**

In summary:
1. **Wire DI Singletons (`apps/web/src/shared/`)**:
   - Instantiate repository (from `@<project>/infrastructures`) in `shared/repositories/index.ts`.
   - Instantiate use cases (from `@<project>/applications`) in `shared/applications/<module>.usecase.ts`.
2. **Hono Controller (`apps/web/src/api/controllers/<module>.controller.ts`)**:
   - Extend base `Controller`.
   - Group related endpoints by domain (**Ponytail Principle** — no over-fragmentation).
   - Use `this.validator({ body, query, params })` for input parsing.
   - Use `this.success(c, message, data)` for responses.
3. **Mount router** in `apps/web/src/api/index.ts` under `/api/<module>`.
4. **Module Views (`apps/web/src/modules/<module>/views/`)**:
   - **MANDATORY**: Always wrap view screens with `<PageLayout pageId="...">` or `<PageLayout title="..." description="...">` from `@/shared/components/layouts/page-layout`.
   - Embed actions via the `actions={<ActionComponent />}` prop.
   - Next.js route `page.tsx` simply renders the View component (e.g. `return <ProductListView />;`).

---

### 6️⃣ Step 6: (Optional) TypeSpec API Specification & Client SDK Generation

> 📖 **See [`clean-architecture-typespec`](../clean-architecture-typespec/SKILL.md) for full TypeSpec syntax and SDK generation guidelines.**

When adding or updating API contracts:

1. **Auto-Generate Entities to TypeSpec**:
   Run the `generate.ts` script in `packages/domains` to sync entity classes into `packages/client/spec/models/entities.tsp`:
   ```bash
   cd packages/domains && npm run generate
   ```

2. **Define Module TypeSpec Model (`packages/client/spec/models/<module>.tsp`)**:
   - **Model Aliasing**: Alias the generated entity (never use `Domain.Entity.<Model>` directly).
   - **Request DTOs**: Use `OmitProperties` for Create and `OptionalProperties<OmitProperties<...>>` for Update requests:
   ```typespec
   model Product is Domain.Entity.Product;

   model CreateProduct
     is OmitProperties<Product, "id" | "createdAt" | "updatedAt">;

   model UpdateProduct
     is OptionalProperties<OmitProperties<Product, "id" | "createdAt" | "updatedAt">>;
   ```

3. **Define Module HTTP Service (`packages/client/spec/services/<module>.tsp`)**:
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
     getProducts(): ApiOkResponse<Product[]>;

     @get
     @route("/{id}")
     getProduct(@path id: string): ApiOkResponse<Product> | ApiNotFoundResponse;

     @post
     @route("/")
     createProduct(@body body: CreateProduct):
       | ApiCreatedResponse<Product>
       | ApiBadRequestResponse;

     @put
     @route("/{id}")
     updateProduct(@path id: string, @body body: UpdateProduct):
       | ApiOkResponse<Product>
       | ApiNotFoundResponse
       | ApiBadRequestResponse;

     @delete
     @route("/{id}")
     deleteProduct(@path id: string): ApiOkBasicResponse | ApiNotFoundResponse;
   }
   ```

4. **Register in `packages/client/spec/main.tsp`**:
   Add `import "./models/<module>.tsp";` and `import "./services/<module>.tsp";`.

5. **Compile Spec & Generate Client SDK**:
   ```bash
   cd packages/client && npm run generate
   # 1. tsp compile ./spec/main.tsp -> emits schema/openapi.yaml
   # 2. openapi-ts -> compiles schema/openapi.yaml into TypeScript SDK & TanStack Query hooks in src/api/
   ```

---

### 7️⃣ Step 7: Verification & Formatting
After generating the code, **ALWAYS** execute the verification commands:
```bash
npm run check-types   # 1. Type verification across all packages
npm run lint          # 2. ESLint & layer boundary check
npm run format        # 3. Prettier code formatting
```

---

## 📚 Further Reference

- [clean-architecture-typespec](../clean-architecture-typespec/SKILL.md): Comprehensive TypeSpec patterns, DTO transforms, and Client SDK generation guide.
- [feature-generation-guide.md](references/feature-generation-guide.md): Deep-dive rules and best practices for module generation.
- [end-to-end-example.md](references/end-to-end-example.md): Complete real-world code example for a `Product` module.

