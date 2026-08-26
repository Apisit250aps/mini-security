---
name: clean-architecture-monorepo
description: Scaffold, initialize, and configure individual packages in a Turborepo Monorepo — generates package.json with subpath imports, tsconfig.json, eslint.config.mjs with layer boundary rules, and starter directories for domains, database, applications, infrastructures, client, ui, or custom packages.
tags:
  - both
  - fullstack
  - backend
  - frontend
---

# Monorepo Package Initializer & Scaffolder Skill 📦

Use this skill when **initializing a new package** or **adding a layer module** to a Turborepo Monorepo (e.g. *"Init package applications"*, *"Add a new package database"*, *"Create custom package analytics"*).

---

## 🎯 When to Activate This Skill

Activate when requested to:
- *"Add a new package named `<name>` (e.g., `applications`, `domains`, `database`, `infrastructures`, `client`, `ui`)"*
- *"Init package `<name>` with tsconfig, eslint, and subpath imports"*
- *"Scaffold a new layer package in packages/<name>"*

---

## ⚡ The 6-Step Package Initialization Pipeline

Whenever creating a new package in `packages/<name>`, follow this exact 6-step workflow:

```text
[Step 1: Detect Scope] ──▶ [Step 2: Match Preset] ──▶ [Step 3: package.json (#imports & exports)]
                                                                      │
                                                                      ▼
[Step 6: Verify] ◀── [Step 5: src/ & index.ts] ◀── [Step 4: tsconfig & eslint (Boundary Rules)]
```

---

### Step 1: Detect Project Scope Prefix
Read root `package.json` or existing packages to determine the monorepo scope prefix:
- If root `name` is `my-org`, scope is `@my-org/<name>`.
- If packages use `@app/*`, scope is `@app/<name>`.
- If no scope is used, use `<name>`.

---

### Step 2: Match Package Preset

Choose the matching preset according to the Clean Architecture layer:

| Preset | Target Layer | Role | Internal Imports (`#...`) |
|---|---|---|---|
| `domains` | Core Domain | Zod schemas, Entities, Repo/Use-case contracts | `#lib/*`, `#schema/*`, `#entities/*`, `#repositories/*`, `#applications/*` |
| `database` | Data Access | Drizzle ORM schemas, Base generic repo, connection | `#lib/*`, `#schema/*` |
| `applications` | Application Rules | Concrete Use Cases, App errors | `#lib/*`, `#use-cases/*` |
| `infrastructures` | Adapters & Drivers | Concrete Repositories, Auth, Password hashing | `#lib/*`, `#repositories/*` |
| `client` | API & SDK | TypeSpec API specifications & Client SDK | Built-in via TypeSpec / Hey-API |
| `ui` | Frontend Primitives | Dumb Design System primitives (Buttons, Inputs) | `#components/*`, `#lib/*`, `#hooks/*` |
| `generic` | Custom Layer | Domain-specific library or helper package | `#lib/*`, `#utils/*` |

---

### Step 3: Create `packages/<name>/package.json`

Every package must define:
1. `"name": "@<project>/<name>"`
2. Subpath **`imports` (`#...`)** for internal module navigation (avoiding messy relative `../../` paths).
3. Subpath **`exports`** for consuming from other packages.
4. Standard **`scripts`** (`build`, `dev`, `lint`, `check-types`).

#### Example: `packages/applications/package.json`
```json
{
  "name": "@<project>/applications",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "check-types": "tsc --noEmit",
    "lint": "eslint ."
  },
  "exports": {
    ".": "./src/index.ts",
    "./use-cases/*": "./src/use-cases/**/*.usecase.ts",
    "./lib/*": "./src/lib/*.ts"
  },
  "imports": {
    "#lib/*": "./src/lib/*.ts",
    "#use-cases/*": "./src/use-cases/**/*.usecase.ts"
  },
  "dependencies": {
    "@<project>/domains": "*"
  },
  "devDependencies": {
    "@<project>/eslint-config": "*",
    "@<project>/typescript-config": "*",
    "typescript": "^5.0.0"
  }
}
```

---

### Step 4: Create `tsconfig.json` & `eslint.config.mjs`

#### 1. `packages/<name>/tsconfig.json`
Extends the shared workspace TypeScript configuration:

```json
{
  "extends": "@<project>/typescript-config/base.json",
  "compilerOptions": {
    "strictNullChecks": true,
    "customConditions": ["source"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```
*(If the workspace uses root tsconfig, set `"extends": "../../tsconfig.json"`)*.

---

#### 2. `packages/<name>/eslint.config.mjs` (Enforcing Layer Boundary Rules)
Uses ESLint `no-restricted-imports` to **block illegal outward-pointing imports** at compile-time:

```javascript
import { config } from '@<project>/eslint-config/base';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // Enforce Clean Architecture boundary for this layer
              group: [
                '@<project>/infrastructures*',
                '@<project>/database*',
                '@<project>/ui*'
              ],
              message: 'Application layer cannot import Infrastructure or Presentation layers (Clean Architecture).'
            }
          ]
        }
      ]
    }
  }
];
```

#### Layer Boundary Rules Reference:
- **`domains`**: Block `@<project>/database*`, `@<project>/applications*`, `@<project>/infrastructures*`, `@<project>/ui*`.
- **`database`**: Block `@<project>/applications*`, `@<project>/infrastructures*`, `@<project>/ui*`.
- **`applications`**: Block `@<project>/infrastructures*`, `@<project>/database*`, `@<project>/ui*`.
- **`infrastructures`**: Block `@<project>/applications*`, `@<project>/ui*`.
- **`ui`**: Block all backend packages (`@<project>/domains*`, `@<project>/database*`, `@<project>/applications*`, `@<project>/infrastructures*`).

---

### Step 5: Scaffold Directory Layout & Starter Code

Create the standard folder tree and root entry point `src/index.ts`:

#### For `applications`:
```bash
mkdir -p packages/applications/src/{use-cases,lib}
```
- `src/lib/error.ts` (Application error hierarchy)
- `src/index.ts`:
  ```typescript
  export * from './lib/error';
  ```

#### For `domains`:
```bash
mkdir -p packages/domains/src/{lib,schema,entities,repositories,applications}
mkdir -p packages/domains/scripts
```
- `src/lib/entity.ts` (Zod BaseEntity builder)
- `src/index.ts` (BaseUseCase, BaseRepository)
- `scripts/generate.ts` (ts-morph TypeSpec generator)

#### For `database`:
```bash
mkdir -p packages/database/src/{schema,lib}
```
- `src/lib/utils.ts` (primaryKeyUuid7, timestamp helpers)
- `src/repository.ts` (Generic Drizzle Repository base class)
- `src/db.ts` (drizzle client connection)
- `src/relations.ts` (centralized relations definition)
- `src/index.ts`

#### For `infrastructures`:
```bash
mkdir -p packages/infrastructures/src/{repositories,lib,auth}
```
- `src/lib/password.ts` (Argon2 hasher)
- `src/repositories/index.ts`
- `src/index.ts`

---

### Step 6: Install & Verify

Run from monorepo root:
```bash
npm install           # 1. Link new package across workspace
npm run check-types   # 2. Verify TypeScript compiles cleanly
npm run lint          # 3. Verify ESLint layer boundaries pass
```

---

## 📚 Further Reference

- [package-presets.md](references/package-presets.md): Complete copy-paste ready package.json, tsconfig, and eslint configs for every package preset.
- [starter-libraries.md](../clean-architecture-setup/references/starter-libraries.md): Full source code for all shared utilities and starter base classes.
