---
name: clean-architecture-validator
description: Audit and validate codebases against Clean Architecture monorepo rules — detects layer boundary leaks, bypassed use cases, illegal any/@ts-ignore, missing safeParseAsync, unhandled typed errors, and improper cross-package imports.
tags:
  - both
  - fullstack
  - backend
  - frontend
---

# Clean Architecture Validator & Auditor Skill 🛡️

Use this skill when reviewing, auditing, or diagnosing codebases for compliance with **Clean Architecture Monorepo rules**.

---

## 🎯 Primary Responsibilities

When asked to *"Audit codebase"*, *"Check Clean Architecture rules"*, or *"Find layer leaks"*, this skill scans the workspace for:

1. **Layer Import Leaks**: Inward packages importing outward packages (`domains` importing `database`/`applications`/`infrastructures`, or `applications` importing `infrastructures`/`database`).
2. **Bypassed Use Cases**: Presentation controllers or routes importing repositories or querying databases directly instead of invoking Use Cases.
3. **Zero-Tolerance Violations**:
   - Usage of `any` types (must use `unknown` with narrowing).
   - Usage of `// @ts-ignore`, `// @ts-expect-error`, or `// @ts-nocheck`.
   - Usage of `/* eslint-disable */` or `// eslint-disable`.
4. **Validation Flaws**: Using synchronous `.parse()` inside use cases instead of `await schema.safeParseAsync()`.
5. **Untyped Generic Errors**: Throwing raw `new Error()` instead of typed application errors (`NotFoundError`, `ValidationError`, `DuplicateError`, `UnauthorizedError`, `ForbiddenError`).
6. **Persistence Leaks into Domain**: Importing Drizzle ORM, table schemas, or DB connection inside `packages/domains`.
7. **Frontend Design System Pollution**: `packages/ui` importing business logic, `react-hook-form`, or backend packages.
8. **Module View Layout Non-Compliance**: Views in `apps/web/src/modules/**/views/**` failing to use `PageLayout` (`@/shared/components/layouts/page-layout`).

---

## 🔍 Layer Audit Matrix

| Package / Layer | Permitted Imports | Prohibited Imports | Architectural Violations |
| :--- | :--- | :--- | :--- |
| **`packages/domains`** | Pure language types, `zod`, `uuid` (`uuidv7`). | `@<project>/database`, `@<project>/applications`, `@<project>/infrastructures`, `@<project>/ui`, `@<project>/client`, ORMs, HTTP libs. | Any external dependency other than Zod/UUID; ORM schemas inside domain. |
| **`packages/database`** | `@<project>/domains`, `drizzle-orm`, `pg`, `uuid`. | `@<project>/applications`, `@<project>/infrastructures`, `@<project>/ui`, `@<project>/client`. | Business logic in DB schemas; directly implementing use cases. |
| **`packages/applications`** | `@<project>/domains` (schemas, entities, interfaces). | `@<project>/database`, `@<project>/infrastructures`, `@<project>/ui`, `@<project>/client`, HTTP types (`Request`/`Response`). | Direct database queries; using `.parse()` instead of `safeParseAsync`; throwing untyped raw `Error`. |
| **`packages/infrastructures`**| `@<project>/domains`, `@<project>/database`, `drizzle-orm`, `argon2`. | `@<project>/applications`, `@<project>/ui`, `@<project>/client`. | Re-implementing base CRUD methods already in `Repository<T, C, U>`; reading `process.env` inside repos. |
| **`packages/client`** | `@typespec/*`, `@hey-api/*`, `Domain.Entity.*`. | Direct usage of `Domain.Entity.<Model>` in services (must alias in `spec/models/`). | Rewriting request DTO properties manually instead of using `OmitProperties`/`OptionalProperties`. |
| **`packages/ui`** | Pure React, Tailwind CSS, Lucide icons, clsx. | `@<project>/domains`, `@<project>/database`, `@<project>/applications`, `@<project>/infrastructures`, `react-hook-form`, TanStack Table. | Putting compound forms or domain-aware components inside `packages/ui`. |
| **`apps/web`** | All `@<project>/*` packages. | Direct DB queries bypassing use cases. | Controller calling Repository directly; Controller missing Ponytail grouping; Views missing `PageLayout`. |

---

## 🚀 How to Conduct an Architectural Audit

When running an audit, follow these 4 steps:

### 1. Run Automated Lints & Boundaries
```bash
npm run check-types   # 1. TypeScript compilation check
npm run lint          # 2. ESLint no-restricted-imports check
```

### 2. Search for Zero-Tolerance Violations
Search for illegal bypasses across all packages:
- `grep -rn "@ts-ignore" packages/ apps/`
- `grep -rn "eslint-disable" packages/ apps/`
- `grep -rn ": any" packages/ apps/`

### 3. Check Application Use Cases
- Verify every usecase validates with `await schema.safeParseAsync(context.data)`.
- Verify errors use `ValidationError`, `NotFoundError`, `DuplicateError`, etc.
- Verify repositories are injected via constructor interface (`I<Module>Repository`).

### 4. Check Presentation Controllers (`apps/web`)
- Verify controllers inject Use Cases from `shared/applications/<module>.usecase.ts`.
- Verify no controller injects or calls a Repository directly.
- Verify endpoints follow the **Ponytail Principle** (grouped by domain module, not over-fragmented into single-method files).

### 5. Check Module Views (`apps/web`)
- Verify all view files in `apps/web/src/modules/**/views/**` wrap their content in `<PageLayout ...>` from `@/shared/components/layouts/page-layout`.

---

## 📋 Audit Report Output Template

When reporting audit findings to the user, format the output as follows:

```markdown
# 🛡️ Clean Architecture Audit Report

## Summary
- **Total Violations**: X
- **Critical (Layer Leaks / Direct DB bypass)**: X
- **Code Quality (any / @ts-ignore / synchronous parse)**: X

## 🚩 Detected Violations

### 1. [CRITICAL] Illegal Layer Import
- **File**: `packages/applications/src/use-cases/order.usecase.ts:4`
- **Violation**: Importing `db` from `@<project>/database/db` directly inside Use Case.
- **Remedy**: Inject `IOrderRepository` via constructor and call repository method instead.

### 2. [WARNING] Synchronous .parse() Used
- **File**: `packages/applications/src/use-cases/user.usecase.ts:18`
- **Violation**: `createUserSchema.parse(context.data)` throws unhandled ZodError.
- **Remedy**: Replace with `const parsed = await createUserSchema.safeParseAsync(context.data)` and throw `ValidationError`.

### 3. [QUALITY] Zero-Tolerance `any` Usage
- **File**: `packages/infrastructures/src/repositories/product.repo.ts:25`
- **Violation**: Parameter typed as `any`.
- **Remedy**: Use explicit entity type or `unknown` with type narrowing.
```

---

## 📚 Further Reference

- [validation-checklist.md](references/validation-checklist.md): Comprehensive checklist and red flags for Clean Architecture monorepos.
