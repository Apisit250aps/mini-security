# Clean Architecture Validation Checklist & Red Flags 🚩

Use this checklist during code reviews, refactoring sessions, or automated audits to ensure the codebase remains clean, strictly bounded, and maintainable.

---

## 🚩 Critical Red Flags

### 1. The Direct DB Controller Anti-Pattern
- **Violation**: An HTTP controller in `apps/web` imports a Repository or Drizzle `db` directly and queries the database without an Application Use Case.
- **Why it's bad**: Bypasses input validation, invariant business rules, transaction boundaries, and authorization checks.
- **Remedy**: Create a Use Case in `packages/applications`, instantiate it in `shared/applications/`, and invoke it from the Controller.

---

### 2. The Inward Dependency Inversion Violation (Layer Leak)
- **Violation**: `packages/domains` imports from `packages/database`, `packages/applications`, or `packages/infrastructures`; or `packages/applications` imports from `packages/infrastructures`.
- **Why it's bad**: Destroys modularity and creates circular dependencies.
- **Remedy**: Invert the dependency by defining an interface in `packages/domains` (`src/repositories/<module>.repo.ts`) and implementing it in `packages/infrastructures`.

---

### 3. The Synchronous `.parse()` Anti-Pattern
- **Violation**: Calling `schema.parse(context.data)` inside a Use Case.
- **Why it's bad**: Throws uncaught raw `ZodError` that breaks error formatting and bypasses async refinement rules (e.g. DB uniqueness checks in Zod).
- **Remedy**: Always use `await schema.safeParseAsync(context.data)`:
  ```typescript
  const parsed = await createSchema.safeParseAsync(context.data);
  if (!parsed.success) throw new ValidationError('Invalid data: ' + parsed.error.message);
  ```

---

### 4. The Untyped Raw `Error` Anti-Pattern
- **Violation**: Throwing `new Error('User not found')` or returning HTTP status codes inside Use Cases (`res.status(404)`).
- **Why it's bad**: Leaks HTTP concerns into Application layer, and fails structured API response formatting.
- **Remedy**: Throw typed subclasses from `packages/applications/src/lib/error.ts`:
  - `throw new NotFoundError('User not found');` (404)
  - `throw new ValidationError('Invalid input');` (422)
  - `throw new DuplicateError('Email already exists');` (409)
  - `throw new UnauthorizedError('Invalid credentials');` (401)
  - `throw new ForbiddenError('Insufficient permissions');` (403)

---

### 5. The Zero-Tolerance Violation (`any` / `@ts-ignore` / `eslint-disable`)
- **Violation**: Adding `// @ts-ignore`, `// eslint-disable`, or `: any` to silence compiler or lint errors.
- **Why it's bad**: Masks runtime bugs, destroys type safety, and compromises system stability.
- **Remedy**: Fix the underlying type signature, schema inference, or use `unknown` with type narrowing.

---

### 6. The UI Design System Pollution Anti-Pattern
- **Violation**: Placing `react-hook-form`, `@tanstack/react-table`, or domain-specific forms inside `packages/ui`.
- **Why it's bad**: Couples reusable design system primitives to application-specific state and domain logic.
- **Remedy**: Keep `packages/ui` dumb (primitives only: `Button`, `Input`, `Dialog`). Place compound forms and feature UI in `apps/web/src/shared/components/` or `apps/web/src/features/`.

---

### 7. The Direct `Domain.Entity` in TypeSpec Services Anti-Pattern
- **Violation**: Directly using `Domain.Entity.Product` in TypeSpec HTTP service interfaces (`spec/services/product.tsp`).
- **Why it's bad**: Couples external API contract directly to generated database entity representations and prevents DTO transforms.
- **Remedy**: Alias the model in `spec/models/<module>.tsp` (`model Product is Domain.Entity.Product;`) and use `OmitProperties`/`OptionalProperties` for request DTOs.

---

## ✅ Layer-by-Layer Verification Checklist

### 1. `packages/domains`
- [ ] No imports from other internal packages (`database`, `applications`, `infrastructures`, `ui`, `client`).
- [ ] No ORM or HTTP libraries installed in `package.json`.
- [ ] Schemas created via `BaseEntity` from `#lib/entity`.
- [ ] All Entity IDs use `UUIDField` (UUIDv7).
- [ ] Entity classes are pure data classes implementing schema `z.infer` types without business methods.
- [ ] Repository interfaces extend `BaseRepository<T, Create, Update>`.
- [ ] Use Case context types and type aliases defined in `src/applications/*.usecase.ts`.

### 2. `packages/database`
- [ ] Depends only on `domains`.
- [ ] Table schemas use `primaryKeyUuid7('id')`, `createdAtTimestamp('created_at')`, `updatedAtTimestamp('updated_at')`.
- [ ] All foreign key columns have indexes defined in the 2nd argument of `pgTable`.
- [ ] All table relations defined in centralized `src/relations.ts` via `defineRelationsPart`.
- [ ] Generic `Repository<T, C, U>` extends `BaseRepository` and uses `this.db` and `this.table`.

### 3. `packages/applications`
- [ ] Depends only on `domains`.
- [ ] Every usecase class implements its contract interface from `domains` (e.g. `ICreateProductUseCase`).
- [ ] Input payload validated using `await schema.safeParseAsync(context.data)`.
- [ ] Errors thrown using typed subclasses from `#lib/error` (`NotFoundError`, `ValidationError`, `DuplicateError`).
- [ ] Repositories injected via constructor with interface type (no concrete repo `new Repository()` inside use case).

### 4. `packages/infrastructures`
- [ ] Depends on `domains` and `database` only (never `applications`).
- [ ] Concrete repositories extend `Repository<T, C, U>` and call `super(db, table)`.
- [ ] Base CRUD methods (`create`, `findById`, `findAll`, `update`, `delete`) are inherited — NOT re-implemented.
- [ ] Password hashing uses `argon2` via `#lib/password`.

### 5. `packages/client`
- [ ] Models in `spec/models/<module>.tsp` alias generated entities (`model User is Domain.Entity.User;`).
- [ ] Create DTOs use `OmitProperties<Model, "id" | "createdAt" | "updatedAt">`.
- [ ] Update DTOs use `OptionalProperties<OmitProperties<...>>`.
- [ ] Service interfaces define explicit response unions (`ApiOkResponse<T> | ApiNotFoundResponse | ApiBadRequestResponse`).

### 6. `packages/ui` & `apps/web`
- [ ] `packages/ui` contains only dumb UI primitives (zero business logic, no form orchestration).
- [ ] `apps/web` controllers extend base `Controller` and use `this.validator()` and `this.success()`.
- [ ] Endpoints grouped by domain module according to the **Ponytail Principle**.
