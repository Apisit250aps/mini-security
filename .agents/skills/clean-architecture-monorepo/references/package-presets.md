# Monorepo Package Presets & Reference Configurations 📦

This reference contains ready-to-use blueprints (`package.json`, `tsconfig.json`, `eslint.config.mjs`, and starter files) for scaffolding any package within a Turborepo Monorepo.

---

## 1. Preset: `packages/domains` (Core Domain)

### `package.json`
```json
{
  "name": "@<project>/domains",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "check-types": "tsc --noEmit",
    "lint": "eslint .",
    "generate": "npx tsx scripts/generate.ts"
  },
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
  },
  "dependencies": {
    "uuid": "^10.0.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@<project>/eslint-config": "*",
    "@<project>/typescript-config": "*",
    "@types/uuid": "^10.0.0",
    "ts-morph": "^25.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### `tsconfig.json`
```json
{
  "extends": "@<project>/typescript-config/base.json",
  "compilerOptions": {
    "strictNullChecks": true,
    "customConditions": ["source"]
  },
  "include": ["src", "scripts"],
  "exclude": ["node_modules", "dist"]
}
```

### `eslint.config.mjs`
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
              group: [
                '@<project>/database*',
                '@<project>/applications*',
                '@<project>/infrastructures*',
                '@<project>/ui*'
              ],
              message: 'Domain layer cannot import any other internal packages (Clean Architecture).'
            }
          ]
        }
      ]
    }
  }
];
```

### Starter `src/index.ts`
```typescript
export abstract class BaseUseCase<Context, TOutput> {
  abstract execute(context: Context): Promise<TOutput>;
}

export abstract class BaseRepository<T, Create, Update> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(entity: Create): Promise<T>;
  abstract update(id: string, entity: Update): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

export * from './applications';
```

---

## 2. Preset: `packages/database` (Data Access)

### `package.json`
```json
{
  "name": "@<project>/database",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "check-types": "tsc --noEmit",
    "lint": "eslint ."
  },
  "exports": {
    "./db": "./src/db.ts",
    "./schema": "./src/schema/index.ts",
    "./repository": "./src/repository.ts"
  },
  "imports": {
    "#lib/*": "./src/lib/*.ts",
    "#schema/*": "./src/schema/*.ts"
  },
  "dependencies": {
    "@<project>/domains": "*",
    "drizzle-orm": "^0.39.0",
    "pg": "^8.13.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@<project>/eslint-config": "*",
    "@<project>/typescript-config": "*",
    "@types/node": "^22.0.0",
    "@types/pg": "^8.11.0",
    "drizzle-kit": "^0.30.0",
    "typescript": "^5.0.0"
  }
}
```

### `tsconfig.json`
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

### `eslint.config.mjs`
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
              group: [
                '@<project>/applications*',
                '@<project>/infrastructures*',
                '@<project>/ui*'
              ],
              message: 'Database layer cannot import Applications, Infrastructures, or UI layers.'
            }
          ]
        }
      ]
    }
  }
];
```

---

## 3. Preset: `packages/applications` (Use Cases)

### `package.json`
```json
{
  "name": "@<project>/applications",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
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

### `tsconfig.json`
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

### `eslint.config.mjs`
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
              group: [
                '@<project>/infrastructures*',
                '@<project>/database*',
                '@<project>/ui*'
              ],
              message: 'Application layer cannot import Infrastructure, Database, or UI layers.'
            }
          ]
        }
      ]
    }
  }
];
```

### Starter `src/index.ts`
```typescript
export * from './lib/error';
```

---

## 4. Preset: `packages/infrastructures` (Adapters & Repos)

### `package.json`
```json
{
  "name": "@<project>/infrastructures",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "check-types": "tsc --noEmit",
    "lint": "eslint ."
  },
  "exports": {
    ".": "./src/index.ts",
    "./repositories/*": "./src/repositories/*.repo.ts",
    "./lib/*": "./src/lib/*.ts"
  },
  "imports": {
    "#lib/*": "./src/lib/*.ts",
    "#repositories/*": "./src/repositories/*.repo.ts"
  },
  "dependencies": {
    "@<project>/domains": "*",
    "@<project>/database": "*",
    "argon2": "^0.41.0",
    "drizzle-orm": "^0.39.0"
  },
  "devDependencies": {
    "@<project>/eslint-config": "*",
    "@<project>/typescript-config": "*",
    "typescript": "^5.0.0"
  }
}
```

### `tsconfig.json`
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

### `eslint.config.mjs`
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
              group: [
                '@<project>/applications*',
                '@<project>/ui*'
              ],
              message: 'Infrastructure layer cannot import Applications or UI layers directly.'
            }
          ]
        }
      ]
    }
  }
];
```

---

## 5. Preset: `packages/ui` (Design System Primitives)

### `package.json`
```json
{
  "name": "@<project>/ui",
  "version": "1.0.0",
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
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "lint": "eslint ."
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.450.0"
  },
  "devDependencies": {
    "@<project>/eslint-config": "*",
    "@<project>/typescript-config": "*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0"
  }
}
```

### `tsconfig.json`
```json
{
  "extends": "@<project>/typescript-config/react-library.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "strictNullChecks": true,
    "customConditions": ["source"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### `eslint.config.mjs`
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
              group: [
                '@<project>/domains*',
                '@<project>/database*',
                '@<project>/applications*',
                '@<project>/infrastructures*'
              ],
              message: 'UI Design System cannot depend on backend packages (Clean Architecture).'
            }
          ]
        }
      ]
    }
  }
];
```
