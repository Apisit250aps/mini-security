---
name: clean-architecture-setup
description: Scaffold and configure a Turborepo Monorepo with Clean Architecture layers (domains → database → applications → infrastructures) using Drizzle ORM, Hono, Zod v4, and TypeScript.
tags:
  - both
  - fullstack
  - backend
  - frontend
---

# Clean Architecture Setup Skill

Use this skill when **initializing a new project** or **configuring layer boundaries** for Clean Architecture in a Turborepo Monorepo.

---

## 🏛️ Primary Architecture: Turborepo Monorepo

### Package Dependency Flow

Dependencies flow strictly **inward** — outer packages depend on inner packages, never the reverse:

```
apps/web (Next.js + Hono API routes)
    │
    ▼
packages/infrastructures  — Concrete Repositories, Auth adapters, External APIs
    │
    ▼
packages/applications     — Use Case implementations, lib/error.ts
    │
    ▼
packages/database         — Drizzle ORM schemas, DB connection, Generic Repository base
    │
    ▼
packages/domains          — (Innermost) Zod schemas, Entity classes, Repository interfaces, Use Case interfaces
```

### Workspace Layout

```text
my-project/
├── apps/
│   └── web/                   # Next.js app + Hono API + UI pages
├── packages/
│   ├── domains/               # Pure business rules (Zod schemas, Entities, interfaces)
│   ├── database/              # Drizzle ORM schemas, migrations, base Repository
│   ├── applications/          # Use Case implementations, error classes
│   ├── infrastructures/       # Concrete repos (Drizzle), Auth (Better Auth), external
│   ├── client/                # TypeSpec API spec & generated Client SDK (Axios + TanStack Query)
│   └── ui/                    # Shared React components, hooks, and utilities
├── turbo.json
├── package.json               # Root workspace
├── tsconfig.json              # Root tsconfig (base)
└── .prettierrc
```

> 💡 **Workspace Scope & Naming Convention**:
> Throughout these skills, `@<project>/*` (e.g. `@app/domains`, `@my-org/domains`, `@core/database`) represents your monorepo's workspace scope prefix configured in root `package.json`. Adapt this prefix and package paths to match your project's specific conventions.
> Internal paths within each package use Subpath Imports (`#lib/*`, `#schema/*`, etc.) to keep internal imports independent of the package's external scope name.

---

## 📦 Package Responsibilities

### `packages/domains` — Innermost Core
**Zero dependencies on other internal packages.**

```
src/
├── lib/
│   └── entity.ts          # BaseEntity Zod builder, field helpers
├── schema/                # Zod schemas (BaseEntity, create/update variants, z.infer types)
├── entities/              # Entity classes (plain data, implements schema type)
├── repositories/          # Repository interfaces (extends BaseRepository)
├── applications/          # Use Case context types + use case type aliases
└── index.ts               # Exports BaseUseCase, BaseRepository
```

Key `package.json` exports:
```json
{
  "name": "@<project>/domains",
  "exports": {
    ".": "./src/index.ts",
    "./schema/*": "./src/schema/*.ts",
    "./entities": "./src/entities/index.ts",
    "./repositories/*": "./src/repositories/*.repo.ts",
    "./applications/*": "./src/applications/*.usecase.ts"
  },
  "imports": {
    "#lib/*": "./src/lib/*.ts",
    "#schema/*": "./src/schema/*.ts",
    "#entities/*": "./src/entities/*.ts",
    "#repositories/*": "./src/repositories/*.repo.ts",
    "#applications/*": "./src/applications/*.usecase.ts"
  }
}
```

---

### `packages/database` — Data Access Core
**Depends on `domains`. Must NOT depend on `applications` or `infrastructures`.**

```
src/
├── schema/                # Drizzle pgTable definitions (one file per domain group)
├── relations.ts           # defineRelationsPart for all tables
├── repository.ts          # abstract class Repository<T, C, U> extends BaseRepository
├── db.ts                  # drizzle() connection, exports Database type
└── lib/
    ├── utils.ts           # primaryKeyUuid7, createdAtTimestamp, updatedAtTimestamp
    └── uuid.ts            # generateUUID() using uuidv7
```

Key `package.json` exports:
```json
{
  "name": "@<project>/database",
  "exports": {
    "./db": "./src/db.ts",
    "./schema": "./src/schema/index.ts",
    "./repository": "./src/repository.ts"
  },
  "imports": {
    "#lib/*": "./src/lib/*.ts",
    "#schema/*": "./src/schema/*.ts"
  }
}
```

Key `db.ts` pattern:
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from './relations';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL environment variable is not set');

const db = drizzle(url, { relations: { ...relations }, logger: true });

type Database = typeof db;
export type { Database };
export default db;
```

---

### `packages/applications` — Application Business Rules
**Depends on `domains`. Cannot depend on `infrastructures` or `database` directly.**

```
src/
├── use-cases/
│   └── <module>/
│       └── <module>.usecase.ts   # Implements use case contracts from domains
└── lib/
    └── error.ts                  # AppError, NotFoundError, ValidationError, DuplicateError, etc.
```

Key `package.json` exports:
```json
{
  "name": "@<project>/applications",
  "exports": {
    ".": "./src/index.ts",
    "./use-cases/*": "./src/use-cases/**/*.usecase.ts",
    "./lib/*": "./src/lib/*.ts"
  },
  "imports": {
    "#lib/*": "./src/lib/*.ts",
    "#use-cases/*": "./src/use-cases/**/*.usecase.ts"
  }
}
```

---

### `packages/infrastructures` — Adapters & External Drivers
**Depends on `domains`, `database`. Must NOT depend on `applications` directly.**

```
src/
├── repositories/          # Concrete repos (extend database/Repository)
├── auth/                  # Better Auth integration
└── lib/
    └── password.ts        # Argon2 hash/verify helpers
```

Key `package.json` exports:
```json
{
  "name": "@<project>/infrastructures",
  "exports": {
    ".": "./src/index.ts",
    "./repositories/*": "./src/repositories/*.repo.ts",
    "./lib/*": "./src/lib/*.ts"
  },
  "imports": {
    "#lib/*": "./src/lib/*.ts",
    "#repositories/*": "./src/repositories/*.repo.ts"
  }
}
```

---

### `packages/client` — TypeSpec API Contracts & Generated Client SDK
**Single source of truth for API contracts. Generates Axios Client SDK + TanStack Query hooks.**

```
packages/client/
├── tspconfig.yaml         # TypeSpec compiler config (emits OpenAPI 3.1.0 to schema/)
├── openapi-ts.config.ts   # Hey-API config (generates TypeScript SDK & React Query hooks)
├── schema/
│   └── openapi.yaml       # Compiled OpenAPI specification
├── spec/
│   ├── main.tsp           # Root spec entry point
│   ├── models/            # common.tsp, entities.tsp, module DTOs (OmitProperties/OptionalProperties)
│   └── services/          # HTTP service interfaces (@route, @get, @post, @body)
└── src/
    ├── index.ts           # export * from './api';
    └── api/               # Auto-generated TypeScript client SDK & React Query hooks
```

Key `package.json` scripts:
```json
{
  "name": "@<project>/client",
  "scripts": {
    "generate:spec": "tsp compile ./spec/main.tsp",
    "generate:client": "openapi-ts",
    "generate": "npm run generate:spec && npm run generate:client"
  }
}
```

---

### `packages/ui` — Shared Frontend
**No backend dependencies.**

```json
{
  "name": "@<project>/ui",
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./components/*": "./src/components/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./hooks/*": "./src/hooks/*.ts"
  },
  "imports": {
    "#components/*": "./src/components/*.tsx",
    "#lib/*": "./src/lib/*.ts",
    "#hooks/*": "./src/hooks/*.ts"
  }
}
```

---

## ⚙️ Step-by-Step Scaffolding Workflow

### 1. Initialize Turborepo Workspace

```bash
# Root package.json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "check-types": "turbo check-types",
    "lint": "turbo lint",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### 2. Create Package Directories

```bash
mkdir -p packages/domains/src/{lib,schema,entities,repositories,applications}
mkdir -p packages/domains/scripts
mkdir -p packages/database/src/{schema,lib}
mkdir -p packages/applications/src/{use-cases,lib}
mkdir -p packages/infrastructures/src/{repositories,lib,auth}
mkdir -p packages/client/{schema,spec/models,spec/services,src}
mkdir -p packages/ui/src/{components,lib,hooks,styles}
mkdir -p apps/web/src/{api,shared,components}
```

### 3. Configure TypeScript per Package

Each package has its own `tsconfig.json` extending the root:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "customConditions": ["source"]
  },
  "include": ["src/**/*"]
}
```

### 4. Install Required Dependencies per Package

| Package | Key Dependencies |
|---|---|
| `domains` | `zod@^4`, `uuid`, `ts-morph` (devDependencies) |
| `database` | `drizzle-orm`, `drizzle-kit`, `@types/node`, `pg`, `@<project>/domains` |
| `applications` | `@<project>/domains` |
| `infrastructures` | `@<project>/domains`, `@<project>/database`, `argon2` |
| `client` | `@typespec/compiler`, `@typespec/http`, `@typespec/rest`, `@typespec/openapi3`, `@hey-api/openapi-ts`, `@hey-api/client-axios`, `@tanstack/react-query` |
| `apps/web` | All packages + `next`, `hono`, `@hono/node-server`, `@<project>/client` |

### 5. Setup Prettier

Root `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

Root `.prettierignore`:
```
node_modules
.next
out
build
coverage
*.log
package-lock.json
bun.lock
.agents
```

Add scripts to root `package.json`:
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### 6. Configure Layer Boundary Checks

Root `.dependency-cruiser.cjs` — enforces the dependency flow:
```javascript
module.exports = {
  forbidden: [
    {
      name: 'domains-must-be-innermost',
      comment: 'packages/domains cannot import from other internal packages',
      severity: 'error',
      from: { path: '^packages/domains' },
      to: { path: '^packages/(database|applications|infrastructures)|^apps' }
    },
    {
      name: 'database-no-app-infra',
      severity: 'error',
      from: { path: '^packages/database' },
      to: { path: '^packages/(applications|infrastructures)|^apps' }
    },
    {
      name: 'applications-no-infra',
      severity: 'error',
      from: { path: '^packages/applications' },
      to: { path: '^packages/infrastructures|^apps' }
    }
  ]
};
```

### 7. Setup TypeSpec Generator (`packages/domains`)

The `packages/domains` package includes a script that converts Entity classes → TypeSpec `.tsp` models for OpenAPI/Client SDK generation:

```bash
# 1. Install ts-morph in packages/domains
npm install ts-morph --save-dev

# 2. Create the scripts directory
mkdir -p packages/domains/scripts
```

Add to `packages/domains/package.json`:
```json
{
  "scripts": {
    "generate": "npx tsx scripts/generate.ts"
  }
}
```

Copy the full script source from [starter-libraries.md → Section 8](references/starter-libraries.md) into `packages/domains/scripts/generate.ts`.

**Run after each Domain Entity is added or changed:**
```bash
cd packages/domains && npm run generate
# Output: packages/client/spec/models/entities.tsp
```

---

## 🛡️ Non-Negotiable Rules

1. **Zero Circular Dependencies**: `domains` → nothing internal; `database` → `domains`; `applications` → `domains`; `infrastructures` → `domains` + `database`.
2. **No `any` Types**: Use `unknown` with narrowing. Exception: `PgTable<any>` in base `Repository` (with inline comment).
3. **No `@ts-ignore` / `eslint-disable`**: Fix root cause instead.
4. **Use UUIDv7** (not v4) via `uuid` package for all entity IDs.
5. **Argon2** for password hashing (not bcrypt or plain SHA).
6. **Zod v4 `safeParseAsync`** for all validation inside use cases (not `parse`).

---

## 📚 Further Reference

- [clean-architecture-typespec](../clean-architecture-typespec/SKILL.md): Complete guide for TypeSpec API definitions, model aliasing, DTO transforms (`OmitProperties`/`OptionalProperties`), and Client SDK generation.
- [starter-libraries.md](references/starter-libraries.md): Full source code for `BaseEntity` builder, `BaseUseCase`, `BaseRepository`, `Repository`, error classes, Drizzle utils, Argon2 helpers, and TypeSpec generator script.
- [architecture-overview.md](references/architecture-overview.md): Dependency inversion diagrams and architectural rules.
